var User = require("../models/User");

exports.Index = function(request, response) {
  /* get the list of users */
  User.find({}, function(err, users) {
    if (err) {
      console.error(err);
    } else {
      response.pageInfo = {}; //init pageInfo

      var chatUsers = []; //array that will hold the list of chat users
      var username = ""; //holds the username of logged in user
      users.forEach(function(user, index) {
        if (user._id != request.session.user_id) { //check if the iterated user is not the logged in user
          chatUsers.push(user); //put the user on the chatUser
        } else { //otherwise, this user is the logged in user
          username = user.username; //get the username of the logged in user
        }
      });

      response.pageInfo.username = username; //set the username from the fetched user from database
      response.pageInfo.users = chatUsers; //set the chat users
      response.render('Home', response.pageInfo);
    }
  });
};
