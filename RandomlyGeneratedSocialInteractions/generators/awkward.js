var _ = require('lodash');

var possibleStaringTargets = [
  "the floor",
  "the ceiling",
  "<%- other.firstName %>'s eyes",
  "a different pair of people interacting, wonder whether their conversation is better than yours",
];

var thingsToThinkAboutWhileBeingAwkwardWithAnotherPerson = [
  "i need to come up with something to say",
];

var awkwardBehaviors = [
  function awkwardStaring(p) {
    p.do("stare at " + _.sample(possibleStaringTargets), null, true);
  },

  function pondering(p) {
    p.think(_.sample(thingsToThinkAboutWhileBeingAwkwardWithAnotherPerson), null, true);
  },

  function oops(p) {
    p.say("i feel like we've run out of things to say");
  }
];

function performAwkwardBehavior(p) {
  _.sample(awkwardBehaviors)(p);
}

module.exports = function(one, two) {
  one.say(_.sample(["so", "um", "well"]));
  two.say(_.sample(["so", "um", "well"]));
  performAwkwardBehavior(one);
  performAwkwardBehavior(two);
}
