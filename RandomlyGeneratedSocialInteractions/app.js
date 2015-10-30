// ---

var INTRODUCTION_STARTED = 'Welcome to Randomly Generated Social Interactions. Before you ' +
        'can start interacting with others, you will need to acquire a personality. ' +
        'Studies have shown that having a personality is a crucial component to enjoying ' +
        'healthy social interaction. Please hold while we generate a ' +
        'personality for you.';
var INTRODUCTION_PERSONALITY = 'Thanks for waiting. Your personality has been generated. ' +
        'Your name is {name}. You are {age} years old and you work as ' +
        '{occupation}. Go ahead and locate the nametag stickers. Grab a ' +
        'pen and write your generated name on one of the stickers. Then place it on ' +
        'your chest. Again, your name is {name}. To spell it out, {spelled_out_name}.';
var INTRODUCTION_ENDED = 'Excellent work! You are now ready to enjoy our high-quality ' +
        'social interactions. Please wait near the entrance while we generate ' +
        'your next interaction.';
var INTERACTION_STARTED = 'Your next interaction has been generated. Please locate ' +
        'the {location} and start walking to that location. ' +
        'You will be interacting with {other_name}.';
var INTERACTION_ENDED = 'This interaction has ended. Please head back at the entrance ' +
        'and wait while we generate your next interaction.';

// ---

var HOLD_MUSIC_PATH = "hold_music.mp3";
var BEEP_SOUND_PATH = "beep.wav";

// ---

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
    return s.match( /[^\.!\?]+[\.!\?]+/g ) || [s];
}

function connect(cb) {
    ws = new WebSocket("ws://localhost:8080");
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
        utterance.lang = 'en-US';
        utterance.text = sents[i];
        window.speechSynthesis.speak(utterance);
    }
    if (cb !== undefined) utterance.onend = cb;
}

function stopAllAudio() {
    $("audio").each(function(i, el) {
        el.pause();
        $(el).remove();
    });
}

function playAudio(path, loop) {
    console.log("Play Audio >", path);
    if (silent) {
        return;
    }
    var audio = new Audio(path);
    if (loop) audio.loop = true;
    $(document.body).append(audio);
    audio.play();
}

function interactionEnded() {
    clearCurrentInteraction();
    say(INTERACTION_ENDED, function() {
        playAudio(HOLD_MUSIC_PATH, true);
    });
}

function performInstruction(instruction) {
    if (instruction.participantId !== personality.id) return;
    switch(instruction.command) {
    case 'say':
        say("Say the following: " + instruction.content);
        break;
    }
}

function refresh() {
    if (currentInteraction !== null) {
        if (currentInteraction.parts.length > 0) {
            var nextInstruction = currentInteraction.parts[0];
            if ((new Date).getTime() > (new Date(nextInstruction.start)).getTime()) {
                performInstruction(nextInstruction);
                currentInteraction.parts.shift();
            }
        } else {
            interactionEnded();
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
    timeoutId = setInterval(refresh, 500);
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
            playAudio(HOLD_MUSIC_PATH, true);
            requestPersonality(function(p) {
                personality = p;
                stopAllAudio();
                var toSay = format(INTRODUCTION_PERSONALITY, {
                    name: p.name,
                    spelled_out_name: spelledOutName(p.name),
                    age: p.age,
                    occupation: p.occupation
                });
                say(toSay, function() {
                    setTimeout(function() {
                        say(INTRODUCTION_ENDED, function() {
                            sendMessage('i-am-available');
                            playAudio(HOLD_MUSIC_PATH, true);
                        });
                    }, 5000);
                });
            });
        });
    });
}

events.on('interaction', function(interaction) {
    startInteraction(interaction);
});

events.on('interaction-ended', function(interaction) {
    if (currentInteraction && currentInteraction.id === interaction.id) {
        interactionEnded();
    }
});

$("#start-button").on("click", function(evt) {
    $("#start").fadeOut(300, function() {
        $("#ongoing").fadeIn(300, start);
    });
});

$("#end-button").on("click", function(evt) {
    disconnect();
    goToStart();
});
