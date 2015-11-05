var _ = require('lodash');

module.exports = function(one, two) {
  if (Math.random() > 0.5) {
    one.say("I've enjoyed this conversation");
    two.say("Yeah. I usually find it hard to open up to strangers but talking to you seems easy.");
    one.say("You're not just saying that to be nice are you?");
    two.say("no I'm being genuine");
    
  } else {
    one.say("This conversation has gone poorly, hasn't it?");
    two.say("Yeah. You seem like a nice person.");
    two.say("we just don't have a lot in common.")
    one.say("Well, it's going to be over soon.");
    two.do("laugh");
  }
}
