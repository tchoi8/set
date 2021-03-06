var HOST = "ws://agermanidis.com:8080"

// ---

var WELCOME = "Welcome to Randomly Generated Social Interactions.";
var INTRODUCTION_STARTED = 'Before you ' +
  'can start interacting with others, you will need to acquire an identity. ' +
  'Studies have shown that having an identity is a crucial component to enjoying ' +
  'healthy social interaction. Please hold while we generate an ' +
  'identity for you.';
var INTRODUCTION_IDENTITY = 'Thanks for waiting. A new identity has been generated for you. ' +
  'Your name is {name}. You are {age} years old and ' +
  '{occupation}. Your personality quirk is that you {quirk}. Please take a moment to embody your new personality.'
var INTRODUCTION_NAMETAG = 'Great. Go ahead and locate the nametag stickers. Grab a ' +
  'pen and write your generated name on one of the stickers. Then place it on ' +
  'your chest.';
var INTRODUCTION_ENDED = 'Excellent work! You are now ready to enjoy our high-quality ' +
  'social interactions. Please wait near the entrance while we generate ' +
  'your next interaction.';
var INTERACTION_STARTED = 'Your next interaction has been generated. Please locate ' +
  'the {location} and start walking to that location. ' +
  'You will be interacting with {other_name}.';
var INTERACTION_ENDED = 'This interaction has ended. Please head back at the entrance ' +
  'and wait while we generate your new identity.';

// ---

var HOLD_MUSIC_PATH = "sounds/hold_music.mp3";
var BEEP_SOUND_PATH = "sounds/beep.wav";

// ---

var utteranceQueue = [];

function clearUtteranceQueue() {
  utteranceQueue = [];
}

function popUtterance() {
  return utteranceQueue.shift();
}

function say(text, cb) {
  var sents = splitSentences(text);
  for (var i = 0; i < sents.length-1; i++) {
    utteranceQueue.push([sents[i], null]);
  }
  utteranceQueue.push([sents[sents.length-1], cb]);
}

function speechLoop() {
  if (!window.speechSynthesis.speaking && utteranceQueue.length > 0) {
    var u = popUtterance();
    performUtterance(u[0], u[1]);
  }
}

setInterval(speechLoop, 100);

// ---

speechCallback = null;
previousSpeechState = false;
ws = null;
identity = null;
myId = null;
currentInteraction = null;
timeoutId = null;
utterance = null;
silent = false;
events = new EventEmitter();

// ---

function format(s, args) {
  var this_string = '';
  for (var char_pos = 0; char_pos < s.length; char_pos++) {
    this_string = this_string + s[char_pos];
  }

  for (var key in args) {
    var string_key = '{' + key + '}';
    this_string = this_string.replace(new RegExp(string_key, 'g'), args[key]);
  }
  return this_string;
};

function spelledOutName(s) {
  return s.replace(" ", "").split("").join(". ");
}

function splitSentences(s) {
  return s.match(/[^\.!\?]+[\.!\?]+/g) || [s];
}

function connect(cb) {
  ws = new WebSocket(HOST);
  ws.onopen = cb;
  ws.onmessage = function(msg) {
    var parsed = JSON.parse(msg.data);
    events.emit(parsed.type, parsed.data);
  };
}

function disconnect() {
  clearCurrentInteraction();
  identity = null;
  ws.close();
}

function speechCheck() {
  var prevState = previousSpeechState;
  previousSpeechState = window.speechSynthesis.speaking;
  if (prevState === true && !window.speechSynthesis.speaking && speechCallback !== null) {
    speechCallback();
    speechCallback = null;
  }
}

setInterval(speechCheck, 500);

function currentVoiceSpeed() {
  return parseFloat($("#speed-input").html());
};

function performUtterance(text, cb) {
  console.log("Say >", text);
  if (silent) {
    if (cb !== undefined) cb();
    return;
  }
  //var sents = splitSentences(text);
  var utterance;
  //for (var i = 0; i < sents.length; i++) {
    utterance = new SpeechSynthesisUtterance();
    //utterance.voice = window.speechSynthesis.getVoices()[2];
    utterance.voiceURI = 'native';
    utterance.volume = 1;
    utterance.pitch = 1.05;
    utterance.rate = currentVoiceSpeed();
    utterance.lang = 'en-US';
  //utterance.text = sents[i];
  utterance.text = text;
    //console.log("speaking utterance");
    window.speechSynthesis.speak(utterance);
  //}
  speechCallback = cb || null;
}

function stopAllAudio() {
  // $("audio").each(function(i, el) {
  //   el.pause();
  //   $(el).remove();
  // });

  var o = window.sounds || {};
  for (var path in o) {
    if (o.hasOwnProperty(path)) {
      o[path].pause();
    }
  }
}

function loadAudio(path, loop) {
  window.sounds = window.sounds || {};
  var sound = new Audio(path);
  sound.loop = loop;
  sound.load();
  window.sounds[path] = sound;
}

function playAudio(path) {
  console.log("Play Audio >", path);
  if (silent) {
    return;
  }
  //var audio = new Audio(path);
  var audio = window.sounds[path];
  if (audio === undefined) {
    console.log("Audio with path", path, "has not been loaded.")
  }
  //$(document.body).append(naudio);
  audio.play();
}

function endInteraction() {
  clearCurrentInteraction();
  clearUtteranceQueue();
  say(INTERACTION_ENDED, function() {
    playAudio(HOLD_MUSIC_PATH);
    requestIdentity(function(i) {
        stopAllAudio();
        setIdentity(i);        
      });
  });
}

function performInstruction(instruction) {
  if (instruction.participantId !== myId) return;
  $("#last-instruction").html("<b>" + instruction.command + ":</b> " + instruction.content);
  playAudio(BEEP_SOUND_PATH);
  //clearUtteranceQueue();
  setTimeout(function() {
    stopAllAudio();
    if (instruction.command == "think") { return }
    if (instruction.command === "do") {
      say(instruction.content);
    } else {
      say(instruction.command + " " + instruction.content);
    }
  }, 500);
  
}

function refresh() {
  if (currentInteraction !== null) {
    if (currentInteraction.parts.length > 0) {
      var nextInstruction = currentInteraction.parts[0];
      if ((new Date).getTime() > (new Date(nextInstruction.start)).getTime()) {
        performInstruction(nextInstruction);
        
        currentInteraction.parts.shift();
      }
    } else if ((new Date).getTime() > (new Date(currentInteraction.end)).getTime()) {
      endInteraction();
    }
  }
}

function clearCurrentInteraction() {
  if (timeoutId) clearInterval(timeoutId);
  currentInteraction = null;
  //$("#identity-name").html("");
  $("#interaction-partner-name").html("<font color='gray'>N/A</font>");
  $("#last-instruction").html("<font color='gray'>N/A</font>");
}

function startInteraction(interaction) {
  clearCurrentInteraction();
  stopAllAudio();
  currentInteraction = interaction;
  var participants = currentInteraction.participants;
  var other;
  for (var i = 0; i < participants.length; i++) {
    if (participants[i].id !== myId) {
      other = participants[i];
      break;
    }
  }
  $("#interaction-partner-name").html(other.identity.name);
  say(format(INTERACTION_STARTED, {
    location: interaction.location,
    other_name: other.identity.name
  }));
  timeoutId = setInterval(refresh, 100);
}

function goToStart() {
  $("#ongoing").fadeOut(300, function() {
    $("#start").fadeIn(300);
  });
}

function sendMessage(type, obj) {
  if (obj === undefined) obj = {};
  obj.type = type;
  ws.send(JSON.stringify(obj));
}

function requestIdentity() {
  sendMessage('i-want-an-identity');
}

function setIdentity(_identity) {
  stopAllAudio();
  identity = _identity;
  $("#identity-name").html(identity.name + " (" + identity.age + ")");
  $("#identity-image").attr("src", "images/person.png");
  var occupationText;
  if (identity.occupation === "unemployed") {
    occupationText = "you are unemployed";
  } else {
    occupationText = "you work as " + identity.occupation;
  }
  var toSay = format(INTRODUCTION_IDENTITY, {
    name: identity.name,
    spelled_out_first_name: spelledOutName(identity.name.split(' ')[0]),
    spelled_out_last_name: spelledOutName(identity.name.split(' ')[1]),
    age: identity.age,
    occupation: occupationText,
    quirk: identity.quirk
  });
  say(toSay, function() {
    setTimeout(function() {
      say(INTRODUCTION_NAMETAG, function() {
        setTimeout(function() {
          say(INTRODUCTION_ENDED, function() {
            sendMessage('i-am-available');
            playAudio(HOLD_MUSIC_PATH);
          });
        }, 5000);
      });
    }, 7000);
  });
}


function start() {
  connect(function() {
    say(INTRODUCTION_STARTED, function() {
      playAudio(HOLD_MUSIC_PATH);
      requestIdentity();
    });
  });
}

events.on('identity', setIdentity);

events.on('participant-id', function(participantId) {
  myId = participantId;
});

events.on('interaction-started', function(interaction) {
  startInteraction(interaction);
});

events.on('interaction-ended', function(interaction) {
  if (currentInteraction && currentInteraction.id === interaction.id) {
    endInteraction();
  }
});

$("#start-button").on("click", function(evt) {
  loadAudio("sounds/beep.wav", false);
  loadAudio("sounds/hold_music.mp3", true);
  performUtterance(WELCOME, null);
  $("#start").fadeOut(300, function() {
    $("#ongoing").fadeIn(300, function() {
      setTimeout(start, 3000);
    });
  });
});

$("#end-button").on("click", function(evt) {
  stopAllAudio();
  disconnect();
  goToStart();
});

$("#speed-input").on("input", function(evt) {
  $("#speed-input-label").html("speed ("+$("#speed-input").val()+")");
});

$("#knob-plus").on("click", function(evt) {
  var newValue = Math.min(1.5, (currentVoiceSpeed() + 0.1).toFixed(1));
  $("#speed-input").html(newValue);
});

$("#knob-minus").on("click", function(evt) {
  var newValue = Math.max(0.5, (currentVoiceSpeed() - 0.1).toFixed(1));
  $("#speed-input").html(newValue);
});

