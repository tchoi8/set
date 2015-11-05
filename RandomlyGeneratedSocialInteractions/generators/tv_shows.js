var _ = require('lodash');
var corpora = require('corpora-project');

var responses = [
  "Yeah, that's one of my favorites",
  "Yeah, it was great for its time",
  "It was okay, I guess",
  "I honestly thought that was overrated",
  "I couldn't finish it",
  "No, but it's been recommended to me",
  "No, I have never heard of it",
];

module.exports = function(one, two) {
  var tvShow = _.sample(corpora.getFile("film-tv", "tv_shows").tv_shows);
  one.say("Have you seen the tv series " + tvShow + "?");
  two.say(_.sample(responses));
  //one.say(_.sample(responses2));
  tvShow = _.sample(corpora.getFile("film-tv", "tv_shows").tv_shows);
  two.say("What about the show " + tvShow + "?");
  one.say(_.sample(responses));
  //two.say(_.sample(responses2));
};
