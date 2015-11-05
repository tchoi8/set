var _ = require('lodash');
var corpora = require('corpora-project');
var excuses = require('../data/excuses');
var socialNetworks = require('../data/social_networks');

var responses = [
  "likewise",
  "let's keep in touch",
  "nice to meet you too",
  "yeah, we had a good conversation"
];

var postmortems = [
  "this actually felt good",
  "we could've talked about so much more",
  "i hope i talk to this person again",
  "i'm glad this is over",
  "i never know how to end conversations"
];

function generateUsername() {
  return _.sample(corpora.getFile("humans", "moods").moods) + " " + _.sample(corpora.getFile("animals", "common").animals) + " " + _.random(0, 100);
}

module.exports = function(one, two) {
  one.think("I need an excuse to go");  
  one.say("I have to go, " + _.sample(excuses));  
  one.say("But it was great to meet you!");
  two.say(_.sample(responses));

  var socialNetwork = _.sample(socialNetworks);
  one.say("Can I add you on " + socialNetwork + "?");
  if (Math.random() > 0.5) {
    two.say("I don't have a " + socialNetwork + " sorry");
  } else if (Math.random() > 0.) {
    two.say("Of course");
    two.say("my username is " + generateUsername());
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
    one.do("give <%- other.firstName %> a hug", null, true);
    two.do("give <%- other.firstName %> a hug", null, true);

  } else {
    one.do("give <%- other.firstName %> a handshake", null, true);
    two.do("give <%- other.firstName %> a handshake", null, true);
  }
  
  one.think(_.sample(postmortems), null, true);
  two.think(_.sample(postmortems), null, true);
};
