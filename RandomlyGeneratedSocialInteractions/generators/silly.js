var _ = require('lodash');

var funnyBehaviors = [
  function sillyFace(p) {
    p.do("make silly face", 5);
  },
  function sillyDance(p) {
    p.do("silly dance", 8);
  },
  function sillyWalk(p) {
    p.do("silly walk", 8);
  },
];

module.exports = function(one, two) {
  one.say("do you thnik i can make you laugh");
  if (Math.random() > 0.5) {
    two.say("no way");
  } else {
    two.say("possibly");
  }
  _.sample(funnyBehaviors)(one);
  if (Math.random() > 0.5) {
    two.do("laugh");
    two.say("you're a funny person");
    one.say("i know");
  } else {
    two.say("that was not funny");
  }
};
