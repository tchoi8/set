var _ = require('lodash');
var presidentialCandidates = require('../data/presidential_candidates');

var issues = [
  "abortion rights",
  "gun laws",
  "foreign policy",
  "immigration",
  "marijuana",
  "minimum wage",
  "wall street"
];

module.exports = function(one, two) {
  var candidate1 = _.sample(presidentialCandidates);
  var candidate2 = _.sample(presidentialCandidates);
  one.say("are you following the 2016 elections");
  two.say(_.sample([
    "yeah it's important to be informed",
    "yeah they're a trainwreck",
    "no it's too early"
  ]));
  one.say("who do you support for president?");
  two.say(candidate2);
  if (candidate1 === candidate2) {
    one.say("ME TOO");
    one.do("hold hands and start jumping", 8, true);
    two.do("hold hands and start jumping", 8, true);
  } else {
    var issue = _.sample(issues);
    one.say("I can't believe you support a candidate with such views on " + issue);
    two.say("You better believe it");
  } 
};
