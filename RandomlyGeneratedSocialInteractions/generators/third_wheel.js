module.exports = function(one, two) {
  one.say("is there anyone here you want to meet?");
  two.do("point at someone who seems interesting");
  one.do("go to the person <%- other.firstName %> is pointing at", 10);
  one.say("hi, <%- other.firstName %> over there wants to meet you");
  two.do("laugh awkwardly");
  two.do("wave at the new person");
  two.say("well hello, how are you today");
  two.do("interact freely with this person for the next 30 seconds", 30, true);
  one.do("wait patiently while becoming increasingly annoyed");
  two.say("i want to interact with <%- other.firstName %> again");
  two.do("completely focus on <%- other.firstName %> and ignore the other person");
  one.do("appear relieved");
  one.say("well hello again");
};
