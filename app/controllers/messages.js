var mongoose = require('mongoose');
var Message = mongoose.model('Message');
var Chatroom = mongoose.model('Chatroom');

exports.createChatroom = function(req, res){
  var chatroom = new Chatroom(req.body);
  chatroom.creator = req.user;
  chatroom.members.push(req.user);
  console.log('backend controller');
  chatroom.save(function(err) {
    if (err) {
      return res.send('users/signup', {
        errors: err.errors,
        chatroom: chatroom
      });
    } else {
      res.jsonp(chatroom);
    }
  });
};

exports.createMessage = function(req, res){
  var message = new Message({content: req.body.content, sender: req.user._id});
    message.save(function(err) {
    if (err) {
      return res.send('users/signup', {
        errors: err.errors,
        message: message
      });
    } else {
      console.log("hello")
      //need to get chatroom somehow
      Chatroom.findOne({_id: req.body.chatroomId}, function(err, chatroom){
        Message.load(message._id, function(err, message){
          chatroom.messages.push(message);
          chatroom.save();
          res.jsonp(message);
        });
      });
    }
  });
};

exports.updateChatroom = function(req, res){
  var chatroom = req.chatroom;

  chatroom = _.extend(chatroom, req.body);

  chatroom.save(function(err) {
    if (err) {
      return res.send('users/signup', {
        errors: err.errors,
        chatroom: chatroom
        });
    } else {
      res.jsonp(chatroom);
    }
  });
};

exports.messageByChatroom = function(req, res){
  Chatroom.findOne({_id: req.chatroom._id}).populate('members', 'name').populate('creator', 'name').exec(function(err, chatroom){
    if (err) {
      res.render('error', {
          status: 500
      });
    } else {
      res.jsonp(chatroom);
    }
  })
};

exports.findAllChatroom = function(req, res){
  Chatroom.find().sort('-created').populate('creator', 'name username').exec(function(err, chatrooms) {
    if (err) {
      res.render('error', {
        status: 500
      });
    } else {
      res.jsonp(chatrooms);
    }
  });
};
