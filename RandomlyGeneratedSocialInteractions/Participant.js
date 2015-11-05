var _ = require('lodash');
var uuid = require('node-uuid');
var casual = require('casual');
var corpora = require('corpora-project');
var queryArticle = require('./AvsAn').query;
var quirks = require('./data/quirks');
var Identity = require("./Identity")

function withArticle(phrase) {
  return queryArticle(phrase) + ' ' + phrase;
}

function generateOccupation() {
  return withArticle(_.sample(corpora.getFile("humans", "occupations").occupations));
}

function calculateSpeechDelay(s) {
  return Math.max(3, Math.floor(s.length/8)) + 1;
}

// double tap

var Participant = function(conn) {
  this.id = uuid();
  this.connection = conn;
  this.currentInteraction = null;
  this.identity = null;
  this.isAvailable = false;
};

Participant.prototype.name = function() {
  return this.firstName + " " + this.lastName;
};

Participant.prototype.serialize = function() {
  return {
    id: this.id,
    identity: this.identity.serialize()
  };
};

Participant.prototype.isAlive = function() {
  return this.connection.readyState === 1;
};

Participant.prototype.broadcast = function(type, data) {
  if (!this.isAlive()) return;
  this.connection.send(JSON.stringify({
    type: type,
    data: data
  }));
};

Participant.prototype.say = function(content, duration, concurrent) {
  if (duration === undefined || duration === null) duration = calculateSpeechDelay(content);
  if (this.currentInteraction !== null) {
    this.currentInteraction.addPart({
      participant: this,
      command: "say",
      content: _.template(content)(this.createTemplateScope()),
      duration: duration,
      concurrent: concurrent || false,
    });
  }
};

Participant.prototype.do = function(content, duration, concurrent) {
  if (duration === undefined || duration === null) duration = calculateSpeechDelay(content);
  if (this.currentInteraction !== null) {
    this.currentInteraction.addPart({
      participant: this,
      command: "do",
      content: _.template(content)(this.createTemplateScope()),
      duration: duration,
      concurrent: concurrent || false,
    });
  }
};

Participant.prototype.think = function(content, duration, concurrent) {
  if (duration === undefined || duration === null) duration = calculateSpeechDelay(content);
  if (this.currentInteraction !== null) {
    this.currentInteraction.addPart({
      participant: this,
      command: "think",
      content: _.template(content)(this.createTemplateScope()),
      duration: duration,
      concurrent: concurrent || false
    });
  }
};

Participant.prototype.conversationPartner = function () {
  if (this.currentInteraction === null) {
    return null;
  }
  var ps = this.currentInteraction.participants;
  for (var i = 0; i < ps.length; i++) {
    if (ps[i].id !== this.id) {
      return ps[i];
    }
  }
  return null;
};

Participant.prototype.createTemplateScope = function() {
  return {
    me: this.identity,
    other: this.conversationPartner().identity
  };
};

Participant.prototype.regenerateIdentity = function() {
  this.identity = new Identity();
  return this;
}

module.exports = Participant;
