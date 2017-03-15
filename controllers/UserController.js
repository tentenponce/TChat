var mongoose = require('mongoose');
var User = require("../models/User");

exports.Login = function(request, response) {
  var newUser = new User({
    username: request.body.username,
    password: request.body.password
  }); //create object from the username and password entered

  if (typeof request.body.login != "undefined") { //check if login is clicked
    console.log("Logging in...");
    User.findOne({ //find if there's matched on the username and password entered
      username: newUser.username,
      password: newUser.password
    }, function(err, user) {
      if (err) {
        return console.error(err);
      } else {
        if (user != null) { //check if there's a user found
          request.session.user_id = user._id; //set the session of user_id
          response.redirect("Home"); // go to home page
        } else { //otherwise, no user matched with the username and password
          response.pageInfo = {};
          response.pageInfo.msg = "Invalid Username or Password";
          response.pageInfo.showMsg = true;
          response.pageInfo.layout = false;
          response.render("Login", response.pageInfo);
        }
      }
    });
  } else if (typeof request.body.signup != "undefined") { //check if signup is clicked
    console.log("Signing Up...");
    User.findOne({ //find if username exists
      username : newUser.username
    }, function(err, user) {
      if (user == null) {
        newUser.save(function(err, user) { //save the user object
          if (err) {
            return console.error(err);
          } else { //show message successfully registered
            response.pageInfo = {};
            response.pageInfo.msg = user.username + " Successfully Registered.";
            response.pageInfo.showMsg = true;
            response.pageInfo.layout = false;
            response.render("Login", response.pageInfo);
          }
        });
      } else {
        response.pageInfo = {};
        response.pageInfo.msg = user.username + " already exists.";
        response.pageInfo.showMsg = true;
        response.pageInfo.layout = false;
        response.render("Login", response.pageInfo);
      }
    });

  } else if (typeof request.body.delete != "undefined") { //check if deleting the user
    console.log("Removing User...");
    User.findOne({ //find if there's matched on the username and password entered
      username: newUser.username,
      password: newUser.password
    }, function(err, user) {
      if (err) {
        return console.error(err);
      } else {
        if (user != null) { //check if there's a user found
          User.remove({
            _id : user._id
          }, function(err) {
            if (err) {
              console.error(err);
            } else {
              response.pageInfo = {};
              response.pageInfo.msg = user.username + " Successfully Removed.";
              response.pageInfo.showMsg = true;
              response.pageInfo.layout = false;
              response.render("Login", response.pageInfo);
            }
          }); //delete the user
        } else { //otherwise, no user matched with the username and password
          response.pageInfo = {};
          response.pageInfo.msg = "Invalid Username or Password";
          response.pageInfo.showMsg = true;
          response.pageInfo.layout = false;
          response.render("Login", response.pageInfo);
        }
      }
    });
  }
};
