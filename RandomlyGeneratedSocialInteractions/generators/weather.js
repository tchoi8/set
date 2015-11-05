var _ = require('lodash');

var weathers = [
  "sunny",
  "foggy",
  "raining",
  "snowing"
];

module.exports = function(one, two) {
  one.say("The weather is so " + _.sample(['great', 'terrible']) + " today");
  two.say("Yeah, I can't believe it's still " + _.sample(weathers) + ".");
  if (Math.random() > 0.5) {
    one.say("Me neither. I recently moved from California.");
    one.say("I'm still getting used to this");
  } else {
    one.say("Oh I can believe it");
    one.say("I've been living in New York forever.");
  }
};
