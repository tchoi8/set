var _ = require('lodash');
var uuid = require('node-uuid');
var casual = require('casual');
var corpora = require('corpora-project');
var queryArticle = require('./AvsAn').query;

function withArticle(phrase) {
  return queryArticle(phrase) + ' ' + phrase;
}

function generateOccupation() {
  return withArticle(_.sample(corpora.getFile("humans", "occupations").occupations));
}

var Participant = function(conn) {
  this.id = uuid();
  this.connection = conn;
  this.firstName = casual.first_name;
  this.lastName = casual.last_name;
  this.age = _.random(18, 60);
  this.occupation = generateOccupation();
  this.isAvailable = false;
};

Participant.prototype.name = function() {
  return this.firstName + " " + this.lastName;
};

Participant.prototype.serialize = function() {
  return {
    id: this.id,
    name: this.name(),
    age: this.age,
    occupation: this.occupation
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

module.exports = Participant;
