var _ = require('lodash');

var peopleInYourLife = [
  "dad",
  "mom",
  "aunt",
  "boyfriend",
  "girlfriend",
  "roommate",
  "coworker",
  "therapist"
];

var whatDidTheyDo = [
  "was a jerk to me",
  "spilled milk on me",
  "pulled a prank on me",
  "was being really loud",
];

var whenDidTheyDoIt = [
  "this morning",
  "this afternoon",
  "yesterday",
];

module.exports = function(one, two) {
  one.say("Sorry I'm not in the best mood right now");
  two.say("What happened?");
  one.say("my " + _.sample(peopleInYourLife) + " " + _.sample(whatDidTheyDo) + " " + _.sample(whenDidTheyDoIt));
  if (Math.random() > 0.5) {
    two.say("I'm so sorry");
  } else {
    two.say("That's all?");
    two.say("Grow up");
  }
};
