var _ = require('lodash');
var excuses = require('../data/excuses');

var responses = [
  "likewise",
  "let's keep in touch",
  "and you",
  "nice to meet you too",
  "yeah, good conversation"
];

var postmortems = [
  "this actually felt good",
  "we could've talked about so much more",
  "will i talk to this person again?",
  "phew i'm glad this is over",
  "i never know how to end conversations"
];

module.exports = function(one, two) {
  one.say("Well, " + _.sample(excuses));  
  one.say("But it was great to meet you!");
  two.say(_.sample(responses));
  if (Math.random() > 0.5) {
    two.think("What an absurd excuse");
  }

  one.say("Can I add you on Facebook?");
  if (Math.random() > 0.5) {
    two.say("I actually don't have a Facebook. Sorry.");
  } else {
    two.say("Sure, I have a pretty unique name so you can easily find me");
  }

  one.say("Okay then, see you around!");

  var farewell = _.sample([
    "hug",
    "handshake"
  ]);

  if (farewell === "hug-handshake mismatch") {
    one.do("go for a hug", null, true);
    two.do("go for a handshake", null, true);
    two.do("pull back and say oops");
    one.do("pull back");
    
  } else if (farewell === "hug") {
    one.do("give <%- other.firstName %> a hug");
    two.do("give <%- other.firstName %> a hug");

  } else {
    one.do("give <%- other.firstName %> a handshake");
    two.do("give <%- other.firstName %> a handshake");
  }
  
  one.think(_.sample(postmortems), null, true);
  two.think(_.sample(postmortems), null, true);
};
