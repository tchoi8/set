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
    two.say("From the " + _.sample(brands) + " store in " + _.sample(["soho", "midtown", "lower east side", "west village"]));
    one.say("I should go get one too");
    if (Math.random() < 0.5) {
      two.say("I don't think it would look on good");
    }
  },
  function smile(one, two) {
    one.say("I really like your smile");
    two.do("blush");
    two.say("thank you");
  }
];

module.exports = function(one, two) {
  _.sample(compliments)(one, two);
};
