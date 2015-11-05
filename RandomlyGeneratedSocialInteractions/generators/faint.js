module.exports = function(one, two) {
  one.do("start feeling dizzy");
  two.say("Are you okay?");
  one.say("I'm feeling dizzy");
  one.do("faint", 3);
  two.say("oh my god");
  two.do("kneel", 2);
  for (var i = 0; i < 3; i++) {
    two.say("<%- other.firstName %>!");
  }
  one.do("regain consciousness");
  one.do("stand up", null, true);
  two.do("stand up", null, true);
  one.say("sorry that happens sometimes");
}
