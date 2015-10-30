var _ = require('lodash');
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: 8080});

var Participant = require('./Participant');
var Interaction = require('./Interaction');

var participants = [];
var interactions = [];

var testInteraction = [
    {index: 0, command: "say", content: "Hello <%- other.firstName %>, I am <%- me.firstName %>", duration: 5},
    {index: 1, command: "say", content: "Hello <%- other.firstName %>", duration: 5},
    {index: 0, command: "say", content: "Goodbye <%- other.firstName %>", duration: 5},
    {index: 1, command: "say", content: "Goodbye <%- other.firstName %>", duration: 5},
]

function randomPairs(ps) {
    ps = _.shuffle(ps);
    var ret = [];
    while (ps.length > 1) {
        ret.push([ps.pop(), ps.pop()]);
    }
    return ret;
}

function refresh() {
    // clean up participants
    participants = _.filter(participants, function(participant) {
        return participant.isAlive();
    });

    // clean up finished interactions
    interactions = _.filter(interactions, function(interaction) {
        if (!interaction.isValid()) interaction.broadcastEnd();
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
    var pairs = randomPairs(available);
    for (var i = 0; i < pairs.length; i++) {
        var interaction = new Interaction(pairs[i]);
        interaction.addParts(testInteraction);
        interactions.push(interaction);
        interaction.broadcast();
    }
}

setInterval(refresh, 2000);

wss.on('connection', function connection(conn) {
    var participant = new Participant(conn);  
    participants.push(participant);

    console.log('- created connection', participant.id);

    conn.on('message', function(msg) {
        var parsed = JSON.parse(msg);

        // adding some timeouts to responses to make the participant wait a few seconds
        switch(parsed.type) {
        case 'i-want-a-personality':
            setTimeout(function() {
                participant.broadcast('personality', participant.serialize());
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
        participant.isAvailable = false;
        participants = _.remove(participants, participant);
    });
});
