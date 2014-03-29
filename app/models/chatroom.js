var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Q = require('q');

var ChatroomSchema = new Schema({
  title: String,
  members: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  messages: [{
    type: Schema.ObjectId,
    ref: 'Message'
  }]
});



mongoose.model('Chatroom', ChatroomSchema);
