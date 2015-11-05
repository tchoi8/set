var Participant = require('./Participant');
var Interaction = require('./Interaction');

for (var i = 0; i < 1; i++) {
  var p1 = new Participant(null).regenerateIdentity();
  var p2 = new Participant(null).regenerateIdentity();
  var interaction = new Interaction([p1, p2]);
  interaction.debug();
}


