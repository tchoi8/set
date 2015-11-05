var _ = require('lodash');

module.exports = function(one, two) {
  one.say("I really need to exercise");
  two.say("Why don't we exercise now?");
  one.say("Okay!");
  one.do("start doing pushups", 10, true);
  two.do("start doing pushups", 10, true);
}
