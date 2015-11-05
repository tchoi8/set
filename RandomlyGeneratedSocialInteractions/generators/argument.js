var _ = require('lodash');

var debates = [
  "are cell phones safe?",
  "is college worth it?",
  "are social networks good for you?",
  "should doping be allowed?",
];

module.exports = function(one, two) {
  var q = _.sample(debates);
  one.say(q);
  two.say("of course not");
  one.say("are you serious? of course the answer is yes");
  two.say("it's not, sorry");
  one.do("get mad");
  one.say("let's ask someone else");
  one.do("find someone nearby and bring them to this conversation");
  one.say("hi. we have a question for you");
  two.say(q);
  one.do("wait for the person to answer", 5, true);
  two.do("wait for the person to answer", 5, true);
  one.say("thank you for clearing this up");
  one.say("bye now");
};
