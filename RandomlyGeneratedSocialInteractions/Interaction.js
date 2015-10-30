var _ = require('lodash');
var uuid = require('node-uuid');
var locations = require('./meeting_locations');

function secondsFromNow(n) {
    var ret = new Date();
    ret.setSeconds(ret.getSeconds() + n);
    return ret;
}

var Interaction = function(participants) {
    console.log("- creating interaction with participants:", _.map(participants, function(p) {
        return p.name()
    }));
    this.id = uuid();
    this.participants = participants;
    this.location = _.sample(locations);
    this.interactionStart = secondsFromNow(20);
    this.parts = [];
};

Interaction.prototype.addPart = function(part) {
    var current = this.endTime();
    var partToAdd = _.clone(part);
    partToAdd.participant = this.participants[part.index];
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

Interaction.prototype.broadcast = function() {
    _.forEach(this.participants, function(participant) {
        participant.broadcast('interaction', this.serialize());
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

module.exports = Interaction;
