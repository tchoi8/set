var _ = require('lodash');
var corpora = require('corpora-project');

var enumerations = {
  'a fruit': corpora.getFile('foods', 'fruits').fruits,
  'a kind of vegetable': corpora.getFile('foods', 'vegetables').vegetables,
  'an object': corpora.getFile('objects', 'objects').objects,
  'a us military operations': corpora.getFile('governments', 'us_mil_operations').operations,
  'a kind of sandwich': corpora.getFile('foods', 'sandwiches').sandwiches.map(function(s) {
    return s.name;
  })
};

module.exports = function(one, two) {
  one.say("let's play a game");
  var thingToEnumerate = _.sample(_.keys(enumerations));
  one.say("we each take turns naming " + thingToEnumerate);
  one.say("whoever can't come up with one first loses");
  var winner = _.sample([one, two]);
  two.say("ok i'll start");
  two.say(_.sample(enumerations[thingToEnumerate]));
  for (var i = 0; i < _.random(3, 6); i++) {
    one.say(_.sample(enumerations[thingToEnumerate]));
    two.say(_.sample(enumerations[thingToEnumerate]));
  }
  if (winner === one) {
    one.say(_.sample(enumerations[thingToEnumerate]));
    two.do("try to think of one and fail", 5);
  } else {
    one.do("try to think of one and fail", 5);
  }
  winner.say("I WIN");
  winner.do("victory dance");
};
