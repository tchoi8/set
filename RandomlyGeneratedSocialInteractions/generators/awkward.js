var _ = require('lodash');

var possibleStaringTargets = [
  "the floor",
  "the ceiling",
  "<%- other.firstName %>'s eyes",
  "a different pair of people interacting, wonder whether their conversation is better than yours",
];

var thingsToThinkAboutWhileBeingAwkwardWithAnotherPerson = [
  "i need to come up with something to say",
  "put your brain to work <%- me.firstName %>, come on!",
];

var awkwardBehaviors = [
  function awkwardStaring(p) {
    p.do("stare at " + _.sample(possibleStaringTargets), 0);
  },

  function pondering(p) {
    p.think(_.sample(thingsToThinkAboutWhileBeingAwkwardWithAnotherPerson), 0);
  }
];

function performAwkwardBehavior(p) {
  _.sample(awkwardBehaviors)(p);
}

module.exports = function(one, two) {
  one.say(_.sample(["so", "um", "well"]));
  two.say(_.sample(["so", "um", "well"]));
  one.think("this is awkward", null, true);
  two.think("this is awkward", null, true);
  performAwkwardBehavior(one);
  performAwkwardBehavior(two);
}
