var mongoose = require('mongoose');
// var Message = mongoose.model('Message');
var Chatroom = mongoose.model('Chatroom');
var User = mongoose.model('User');

exports.createChatroom = function(req, res){
  var chatroom = new Chatroom({members: req.body.members});
  User.title(req.body.members).then(function(title){
    chatroom.title = title;
    chatroom.members.push(req.user);
    chatroom.save(function(err) {
      if (err) {
        return res.send('users/signup', {
          errors: err.errors,
          chatroom: chatroom
        });
      } else {
        Chatroom.findOne({_id: chatroom._id}).populate('members').exec(function(err, chatroom){
          res.jsonp(chatroom);
        })
      }
    });
  });
};

// exports.createMessage = function(req, res){
//   var message = new Message({content: req.body.content, sender: req.user._id});
//     message.save(function(err, message) {
//     if (err) {
//       return res.send('users/signup', {
//         errors: err.errors,
//         message: message
//       });
//     } else {
//       //need to get chatroom somehow
//       Chatroom.findOne({_id: req.body.chatroomId}, function(err, chatroom){
//         Message.load(message._id, function(err, message){
//           chatroom.messages.push(message);
//           chatroom.save(function(err, chatroom){
//             res.jsonp(message);
//           });
//         });
//       });
//     }
//   });
// };

exports.createMessage = function(req, res){
  Chatroom.findOne({_id: req.body.chatroomId}, function(err, chatroom){
    var message = {sender: {fullName: req.user.fullName, userName: req.user.userName, avatarUrl: req.user.avatarUrl}, content: req.body.content};
    if(chatroom.messages instanceof Array){
      chatroom.messages.push(message);
    } else{
      chatroom.messages = [message];
    }
    chatroom.save();
    res.jsonp(message);
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

  Chatroom.findOne({_id: req.query.chatroomId}).populate('members').exec(function(err, chatroom){
    if (err) {
      res.render('error', {
          status: 500
      });
    } else {
      res.jsonp(chatroom);
    }
  });
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
