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
    sender: {},
    seen: {type: Boolean,
          default: false},
    content: String,
    created: {type: Date,
      default: Date.now}
  }]
});

// var ChatroomSchema = new Schema({
//   title: String,
//   members: {
//     type: [{
//       type: Schema.ObjectId,
//       ref: 'User'
//     }],
//     index: true
//   },
//   messages: [{
//     sender: {type: Schema.ObjectId,
//             ref: "User"},
//     seen: {type: Boolean,
//           default: false},
//     content: String,
//     created: {type: Date,
//       default: Date.now}
//   }]
// });


mongoose.model('Chatroom', ChatroomSchema);
