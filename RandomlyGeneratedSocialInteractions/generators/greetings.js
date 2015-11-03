var _ = require('lodash');

var firstImpressions = [
  "this person seems nice",
  "this person seems cool",
  "this person seems unpleasant",
  "this person seems self-absorved",
  "this person seems boring",
  "this person seems confident",
  "this person reminds me of someone",
];

var greetings = [
  {type: 'one', f: function(p) { p.say("hey"); }},
  {type: 'one', f: function(p) { p.say("yo"); }},
  {type: 'one', f: function(p) { p.say("how's it going"); }},
  {type: 'one', f: function(p) { p.say("good evening!"); }},
  {type: 'both', f: function(p) { p.do("wave with your hand", null, true); }},
  {type: 'both', f: function(p) { p.do("give a handshake", null, true); }},
  {type: 'both', f: function(p) { p.do("hug each other", null, true); }},
  {type: 'both', f: function(p) { p.do("high five each other", null, true); }},
];

module.exports = function (one, two) {
  if (Math.random() < 0.5) one.think(_.sample(firstImpressions), null, true);
  if (Math.random() < 0.5) two.think(_.sample(firstImpressions), null, true);
  var g1 = _.sample(greetings);
  if (g1.type === "both") {
    g1.f(one);
    g1.f(two);
  } else {
    var g2 = _.sample(_.filter(greetings, function(g) { return g.type == 'one'; }));
    g1.f(one);
    g2.f(two);
  }
};
