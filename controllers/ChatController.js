var mongoose = require('mongoose');
var User = require("../models/User");
var Chat = require("../models/Chat");

exports.Index = function(req, res) {
  var userId = req.session.user_id; //get the logged in user id
  var chatUserId = req.params.user_id; //get the chat user id

  User.findOne({
    _id : chatUserId
  }, function(err, user) {
    if (err) {
      console.error(err);
      res.redirect('/home');
    } else {
      var chatName = user.username; //get the chatmate username
      Chat.find({
        $or: [{
          user_id: userId,
          chat_user_id: chatUserId
        }, {
          user_id : chatUserId,
          chat_user_id : userId
        }]
      }).sort({date: 'asc'}).exec(function(err, chats) {
        if (err) {
          console.error(err);
        } else {
          myChats = [];
          chats.forEach(function(chat, index) {
            chat = JSON.parse(JSON.stringify(chat)); //dont know but this thing works to add new key value pair

            if (req.session.user_id == chat.user_id) { //check if the chat is coming from you
              chat.is_user_id = true;
            } else {
              chat.is_user_id = false;
            }

            myChats.push(chat);
          });

          res.pageInfo = {};
          res.pageInfo.userId = userId;
          res.pageInfo.chatUserId = chatUserId;
          res.pageInfo.chatName = chatName;
          res.pageInfo.chats = myChats;
          res.render('Chat', res.pageInfo);
        }
      }); //get all the chats of the logged in user to the chat mate
    }
  }); //get the chat user info
};

exports.AddChat = function(req, res) {
  var chat = new Chat({
    msg: req.body.msg,
    date: new Date(),
    user_id: req.body.userId,
    chat_user_id: req.body.chatUserId
  }); //create the chat object

  chat.save(function(err, chat) {
    if (err) {
      return console.error(err);
    } else {
      res.send(JSON.stringify({status: 200})); //save ok
    }
  }); //save the chat object to database
}
