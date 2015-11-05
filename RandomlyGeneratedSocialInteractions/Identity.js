var _ = require('lodash');
var casual = require('casual');
var corpora = require('corpora-project');
var queryArticle = require('./AvsAn').query;
var quirks = require('./data/quirks');

function withArticle(phrase) {
  return queryArticle(phrase) + ' ' + phrase;
}

function generateOccupation() {
  if (Math.random() < 0.7) {
    return withArticle(_.sample(corpora.getFile("humans", "occupations").occupations));
  } else {
    return "unemployed";
  }
}

var Identity = function() {
  this.firstName = casual.first_name;
  this.lastName = casual.last_name;
  this.age = _.random(18, 60);
  this.occupation = generateOccupation();
  this.quirk = _.sample(quirks);
};

Identity.prototype.name = function() {
  return this.firstName + " " + this.lastName;  
};

Identity.prototype.serialize = function(){
  return {
    name: this.name(),
    age: this.age,
    occupation: this.occupation,
    quirk: this.quirk
  };
};

module.exports = Identity;
