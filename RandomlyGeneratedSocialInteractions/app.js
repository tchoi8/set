var HOST = "ws://agermanidis.com:8080"

// ---

var WELCOME = "Welcome to Randomly Generated Social Interactions.";
var INTRODUCTION_STARTED = 'Before you ' +
  'can start interacting with others, you will need to acquire an identity. ' +
  'Studies have shown that having an identity is a crucial component to enjoying ' +
  'healthy social interaction. Please hold while we generate an ' +
  'identity for you.';
var INTRODUCTION_PERSONALITY = 'Thanks for waiting. Your new identity has been generated. ' +
  'Your name is {name}. You are {age} years old and you work as ' +
  '{occupation}. Go ahead and locate the nametag stickers. Grab a ' +
  'pen and write your generated name on one of the stickers. Then place it on ' +
  'your chest. Again, your name is {name}. To spell it out, {spelled_out_first_name}. ' +
  'Last name. {spelled_out_last_name}.';
var INTRODUCTION_ENDED = 'Excellent work! You are now ready to enjoy our high-quality ' +
  'social interactions. Please wait near the entrance while we generate ' +
  'your next interaction.';
var INTERACTION_STARTED = 'Your next interaction has been generated. Please locate ' +
  'the {location} and start walking to that location. ' +
  'You will be interacting with {other_name}.';
var INTERACTION_ENDED = 'This interaction has ended. Please head back at the entrance ' +
  'and hold while we generate your new identity.';

// ---

var HOLD_MUSIC_PATH = "hold_music.mp3";
var BEEP_SOUND_PATH = "beep.wav";

// ---

var utteranceQueue = [];

function clearUtteranceQueue() {
  utteranceQueue = [];
}

function popUtterance() {
  return utteranceQueue.shift();
}

// ---

speechCallback = null;
previousSpeechState = false;
ws = null;
personality = null;
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
  personality = null;
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

function say(text, cb) {
  console.log("Say >", text);
  if (silent) {
    if (cb !== undefined) cb();
    return;
  }
  var sents = splitSentences(text);
  var utterance;
  for (var i = 0; i < sents.length; i++) {
    utterance = new SpeechSynthesisUtterance();
    //utterance.voice = window.speechSynthesis.getVoices()[2];
    utterance.voiceURI = 'native';
    utterance.volume = 1;
    utterance.pitch = 1.05;
    utterance.rate = parseFloat($("#speed-input").val());
    utterance.lang = 'en-US';
    utterance.text = sents[i];
    //console.log("speaking utterance");
    window.speechSynthesis.speak(utterance);
  }
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

function loadAudio(path) {
  window.sounds = window.sounds || {};
  var sound = new Audio(path);
  sound.loop = true;
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
  say(INTERACTION_ENDED, function() {
    playAudio(HOLD_MUSIC_PATH);
  });
}

function performInstruction(instruction) {
  $("#last-instruction").html("<b>" + instruction.command + ":</b> " + instruction.content);
  if (instruction.participantId !== personality.id) return;
  if (instruction.command === "do") {
    say(instruction.content);
  } else {
    say(instruction.command + " the following:" + instruction.content);
  }
}

function refresh() {
  if (currentInteraction !== null) {
    if (currentInteraction.parts.length > 0) {
      var nextInstruction = currentInteraction.parts[0];
      if ((new Date).getTime() > (new Date(nextInstruction.start)).getTime()) {
        playAudio("beep.wav");
        setTimeout(function() {
          stopAllAudio();
          performInstruction(nextInstruction);
        }, 1000);
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
}

function startInteraction(interaction) {
  clearCurrentInteraction();
  stopAllAudio();
  currentInteraction = interaction;
  var participants = currentInteraction.participants;
  var other;
  for (var i = 0; i < participants.length; i++) {
    if (participants[i].id !== personality.id) {
      other = participants[i];
      break;
    }
  }
  say(format(INTERACTION_STARTED, {
    location: interaction.location,
    other_name: other.name
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

function requestPersonality(cb) {
  sendMessage('i-want-a-personality');
  events.on('personality', cb);
}

function start() {
  connect(function() {
    say(INTRODUCTION_STARTED, function() {
      playAudio(HOLD_MUSIC_PATH);
      requestPersonality(function(p) {
        personality = p;
        stopAllAudio();
        var toSay = format(INTRODUCTION_PERSONALITY, {
          name: p.name,
          spelled_out_first_name: spelledOutName(p.name.split(' ')[0]),
          spelled_out_last_name: spelledOutName(p.name.split(' ')[1]),
          age: p.age,
          occupation: p.occupation
        });
        say(toSay, function() {
          setTimeout(function() {
            say(INTRODUCTION_ENDED, function() {
              sendMessage('i-am-available');
              playAudio(HOLD_MUSIC_PATH);
            });
          }, 5000);
        });
      });
    });
  });
}

events.on('interaction-started', function(interaction) {
  startInteraction(interaction);
});

events.on('interaction-ended', function(interaction) {
  if (currentInteraction && currentInteraction.id === interaction.id) {
    endInteraction();
  }
});

$("#start-button").on("click", function(evt) {
  loadAudio("beep.wav");
  loadAudio("hold_music.mp3");
  say(WELCOME);
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
  $("#speed-input-label").html("speed (current value = "+$("#speed-input").val()+")");
});

