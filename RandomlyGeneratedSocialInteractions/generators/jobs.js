var _ = require('lodash');
var corpora = require('corpora-project');

var thoughtsAboutJobDisclosure = [
  "i'm much more than my job",
  "geez i hate talking about my job"
];

var reactionsToHearingAboutOnesJob = [
  function backhanded(one, two) {
    one.say("I didn't know that was something people still did?")
    two.do("frown");
    two.think("What an asshole");
  },
  function genuinelyImpressed(one, two) {
    one.say("Wow, you must be really brilliant to be <%- other.occupation %>.");
    two.say("My boss doesn't seem to think that");
  },
  function rudeResponse(one, two) {
    one.say("Do people seriously get paid to do that?");
    two.say("Yeah they do");
    two.do("frown");
  },
  function coldResponse(one, two) {
    one.say("Cool");
    two.say("I know, exciting right?");
    if (Math.random() > 0.5) {
      one.do("give a blank stare");
      two.say("I was being sarcastic");
      one.say("Oh");
    } else {
      one.say("So exciting");
    }
  },
];

var secondReactions = [
  function selfEffacing(one, two) {
    two.say("Well that's definitely more interesting than my job!");
    one.do("laugh");
    one.say("I wouldn't necessarily say that");
  },
  function commonalitiesSeeking(one, two) {
    two.say("I guess we're doing similar things");
    one.do("laugh awkwardly", null);
    one.say("You could say that");
    one.think("They are not similar at all, what is this person talking about");
  },
  function thatsboring(one, two) {
    two.say("That sounds so boring");
    one.say("It's not actually boring");
    one.think("How rude");
  }
];

module.exports = function(one, two) {
  one.say("So what do you do?")
  var randomCompany = _.sample(corpora.getFile("corporations", "fortune500").companies);
  if (Math.random() < 0.3) two.think(_.sample(thoughtsAboutJobDisclosure));
  if (two.identity.occupation == "unemployed") {
    two.say("I'm unemployed");
  } else {
    two.say("I work as <%- me.occupation %> at " + randomCompany);
    _.sample(reactionsToHearingAboutOnesJob)(one, two);
  }
  two.say("And you?");
  if (one.identity.occupation == "unemployed") {
    one.say("I'm unemployed");
  } else {
    randomCompany = _.sample(corpora.getFile("corporations", "fortune500").companies);
    one.say("Oh, I'm <%- me.occupation %> at " + randomCompany);
    _.sample(secondReactions)(one, two);
  }
};
