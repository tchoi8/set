var _ = require('lodash');
var corpora = require('corpora-project');
var concepts = require('../data/concepts');
var artforms = require('../data/artforms');

var verbs = [
  "interesting in",
  "obsessed with",
  "excited about",
  "critical of",
  "exploring"
];

function conversationAboutArt(one, two) {
  if (Math.random() > 0.5) {
    two.say("I play music");
    one.say("Really? What kind of music?");
    var genre = _.sample(corpora.getFile("music", "genres").genres);
    two.say("Mostly " + genre);
    genre = _.sample(corpora.getFile("music", "genres").genres);
    two.say("But with elements of " + genre);

  } else if (Math.random() > 0.5) {
    var artform = _.sample(artforms);
    two.say("I occasionally make " + artform + " art");
    one.say("Interesting!");
    one.say(_.sample([
      "What themes are you exploring currently?",
      "What do you want to accomplish with your art?",
      "What motivates you to make that kind of art?"
    ]));
    two.say("I'm " + _.sample(verbs) + " the relationship between " + _.sample(concepts) + " and " + _.sample(concepts));
  }
}

module.exports = function(one, two) {
  one.say("Do you make any art?");
  conversationAboutArt(one, two);
  two.say("What about you?");
  conversationAboutArt(two, one);
}
