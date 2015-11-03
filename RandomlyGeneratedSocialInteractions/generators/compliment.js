var _ = require('lodash');
var clothes = require('../data/clothes');
var brands = require('../data/clothing_brands');

var compliments = [
  function clothing(one, two) {
    var pieceOfClothing = _.sample(clothes);
    one.do("point at <%- other.firstName %>'s " + pieceOfClothing)
    one.say("I love your " + pieceOfClothing);
    two.say("Thank you!");
    one.say("Where did you get that from?");  
    two.say("Oh, from the " + _.sample(brands) + " store in SoHo");
    one.say("I should go get one too");
    two.do("laugh");
  },
  function smile(one, two) {
    one.say("I really like your smile");
    two.do("blush");
    two.say("thank you");
  },
  function intelligence(one, two) {
    one.say("you seem like a really smart person");
  }
];

module.exports = function(one, two) {
  _.sample(compliments)(one, two);
};
