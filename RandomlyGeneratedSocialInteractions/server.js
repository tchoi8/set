var _ = require('lodash');
var express = require('express');
var WebSocketServer = require('ws').Server;

var wss = new WebSocketServer({port: 8080});
var app = express();

var Participant = require('./Participant');
var Interaction = require('./Interaction');

var participants = [];
var interactions = [];
var interactionHistory = [];

var testInteraction = [
    {index: 0, command: "say", content: "Hello <%- other.firstName %>, I am <%- me.firstName %>", duration: 5},
    {index: 1, command: "say", content: "Hello <%- other.firstName %>", duration: 5},
    {index: 0, command: "say", content: "Goodbye <%- other.firstName %>", duration: 5},
    {index: 1, command: "say", content: "Goodbye <%- other.firstName %>", duration: 5}
];

function pairParticipants(ps) {
  ps = _.shuffle(ps);
  var paired = {};
  var ret = [];
  for (var i = 0; i < ps.length; i++) {
    for (var j = i+1; j < ps.length; j++) {
      if (paired[j]) {
        continue;
      }
      if (shouldInteract(ps[i], ps[j])) {
        ret.push([ps[i], ps[j]]);
        paired[i] = true;
        paired[j] = true;
      }
    }
  }
  return ret;
}

var INTERACTION_BUFFER_TIME = 15000;

function shouldInteract(p1, p2) {
  for (var i = 0; i < interactionHistory.length; i++) {
    var interaction = interactionHistory[i];
    if ((new Date).getTime() - interaction.endTime().getTime() > INTERACTION_BUFFER_TIME) {
      return true;
    }
    if (_.every([p1, p2], function(p) { return _.includes(interaction.participants, p) })) {
      return false;
    }
  }
  return true;
}

function refresh() {
    // clean up participants
    participants = _.filter(participants, function(participant) {
        return participant.isAlive();
    });

    // clean up finished interactions
    interactions = _.filter(interactions, function(interaction) {
      if (!interaction.isValid()) {
        interaction.broadcastEnd();
        _.each(interaction.participants, function(p){
          p.isAvailable = false;
        });
        interactionHistory.unshift(interaction);
      }
      return interaction.isValid();
    });

    // find available participants
    var available = _.filter(participants, function(participant) {
        if (!participant.isAlive() || !participant.isAvailable) {
            return false;
        }
        return _.every(interactions, function(interaction) {
            return !_.contains(interaction.participants, participant);
        });
    });

    console.log("number of available participants:", available.length, "/", participants.length);
    console.log("number of ongoing interactions:", interactions.length);
    console.log('<>');
    
    // pair available participants
    var pairs = pairParticipants(available);
    for (var i = 0; i < pairs.length; i++) {
        var interaction = new Interaction(pairs[i]);
        //interaction.addParts(testInteraction);
        interactions.push(interaction);
        interaction.broadcastStart();
    }
}

setInterval(refresh, 10000);

wss.on('connection', function connection(c) {
  (function(conn){
    var participant = new Participant(conn);  
    participants.push(participant);
    console.log('- created connection', participant.id);
    participant.broadcast('participant-id', participant.id);

    conn.on('message', function(msg) {
      var parsed = JSON.parse(msg);

      // adding some timeouts to responses to make the participant wait a few seconds
      switch(parsed.type) {
      case 'i-want-an-identity':
        setTimeout(function() {
          console.log("broadcasting personality");
          participant.regenerateIdentity();
          participant.broadcast('identity', participant.identity.serialize());
        }, 8000);
        break;

      case 'i-am-available':
        setTimeout(function() {
          participant.isAvailable = true;
        }, 3000);
        break;
      }
    });

    conn.on('close', function() {
      console.log('- connection closed', participant.id);
    });
  })(c);
});
