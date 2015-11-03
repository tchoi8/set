var _ = require('lodash');

var goalsInLife = [
  function toBeRich(one, two){
    one.say("I started from nothing. I want to make a lot of money and prove myself in the world.");
    
    if (Math.random() > 0.5) {
      two.say("Wow, I appreciate your honesty.");
      two.say("People often say [...]")

    } else {
      
      
    }
  },
  function toFindMySoulmate(one, two) {
    one.say("I'm searching for my soulmate");
    one.say("Once I find them I will live my life with them");
    one.say("create with them");
    one.say("travel with them");
    one.say("be in the world with them");
    
    if (Math.random() > 0.5) {
        //...
      
    } else {
      two.say("Do you seriously believe in soulmateship?");
      two.say("That's ridiculous!");
      one.day("Yes I do");
      one.do("stare at <%- other.name %> intently");
      two.say("They are such an archaic notion");
      ///////
    }
  },
  function toDiscoverTruth(one, two) {
    one.say("I want to understand the physical laws of the universe");

    if (Math.random() > 0.5) {
      two.say("You understand that all truths are human-made right?");
      // ...
            
    } else {
      // ... 

    }
  },
];

module.exports = function(one, two) {
  two.say("What is your goal in life?");
  _.sample(goalsInLife)(one, two);
}
