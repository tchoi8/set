var _ = require('lodash');
var uuid = require('node-uuid');
var locations = require('./data/meeting_locations');
var greeting = require('./generators/greetings');
var metaConversation = require('./generators/meta');
var farewell = require('./generators/farewells');
var generators = [
  require('./generators/compliment'),
  require('./generators/weather'),
  require('./generators/awkward'),
  require('./generators/jobs'),
  require('./generators/tv_shows'),
  require('./generators/art'),
//  require('./generators/politics'),
  //require('./generators/life'),
];

function secondsFromNow(n) {
  var ret = new Date();
  ret.setSeconds(ret.getSeconds() + n);
  return ret;
}

var NUMBER_OF_SECTIONS = 5;

function generateInteraction(one, two) {
  var ps = _.shuffle([one, two]);
  greeting(ps[0], ps[1]);
  var gs = _.sample(generators, NUMBER_OF_SECTIONS);
  for (var i = 0; i < NUMBER_OF_SECTIONS; i++) {
    ps = _.shuffle([one, two]);
    gs[i](ps[0], ps[1]);
  }
  ps = _.shuffle([one, two]);
  if (Math.random() < 0.3) metaConversation(ps[0], ps[1]);
  ps = _.shuffle([one, two]);
  farewell(ps[0], ps[1]);
}

var Interaction = function(participants) {
  console.log("- creating interaction with participants:", _.map(participants, function(p) {
    return p.name();
  }));
  this.id = uuid();
  this.participants = participants;
  _.forEach(this.participants, function(p) {
    p.currentInteraction = this;
  }.bind(this));
  this.location = _.sample(locations);
  this.interactionStart = secondsFromNow(20);
  this.parts = [];
  generateInteraction(participants[0], participants[1]);
};

Interaction.prototype.addPart = function(part) {
  var partToAdd = _.clone(part);
  partToAdd.participant = part.participant || this.participants[part.index];
  var current;
  if (partToAdd.concurrent) {
    current = this.concurrentTime();
  } else {
    current = this.endTime();
  }
  partToAdd.start = current;
  partToAdd.end = new Date(current.getTime() + part.duration*1000);
  partToAdd.content = _.template(part.content)({
    me: this.participants[part.index],
    other: this.participants[(part.index + 1) % 2]
  });
  this.parts.push(partToAdd);    
};

Interaction.prototype.addParts = function(parts) {
  _.forEach(parts, this.addPart.bind(this));
};

Interaction.prototype.concurrentTime = function() {
  if (this.parts.length > 0) {
    if (this.parts[this.parts.length-1].concurrent) {
      return this.parts[this.parts.length-1].start;
    } else {
      return this.parts[this.parts.length-1].end;
    }
  } else {
    return this.interactionStart;
  }
}

Interaction.prototype.endTime = function() {
  if (this.parts.length > 0) {
    return this.parts[this.parts.length-1].end;
  } else {
    return this.interactionStart;
  }
}

Interaction.prototype.isOngoing = function() {
  return (new Date).getTime() < this.endTime().getTime();
};

Interaction.prototype.participantsAreAlive = function() {
  return _.every(this.participants, function(p) {
    return p.isAlive(); 
  });
}

Interaction.prototype.isValid = function() {
  return this.isOngoing() && this.participantsAreAlive();
};

Interaction.prototype.broadcastStart = function() {
  _.forEach(this.participants, function(participant) {
    participant.broadcast('interaction-started', this.serialize());
  }.bind(this));
};

Interaction.prototype.broadcastEnd = function() {
  _.forEach(this.participants, function(participant) {
    participant.broadcast('interaction-ended', this.serialize());
  }.bind(this));
};

Interaction.prototype.serialize = function() {
  return {
    id: this.id,
    location: this.location,
    participants: _.map(this.participants, function(participant) {
      return participant.serialize();
    }),
    end: this.endTime(),
    parts: _.map(this.parts, function(part) {
      return {
        participantId: part.participant.id,
        start: part.start,
        end: part.end,
        command: part.command,
        content: part.content,
      }
    })
  };
};

Interaction.prototype.debug = function() {
  for (var i = 0; i < this.parts.length; i++) {
    var part = this.parts[i];
    var verb;
    if (part.command === "say") verb = "says";
    if (part.command === "think") verb = "thinks";
    if (part.command === "do") verb = "does";
    console.log("["+part.start.toLocaleString('en').split(', ')[1] + "] " + part.participant.name() + " " + verb + ': '  + part.content + " (" + part.duration + ")");
  }
};

module.exports = Interaction;
