var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var MessageSchema = new Schema({
  sender: {type: Schema.ObjectId,
          ref: "User"},
  content: String
});

mongoose.model('Message', MessageSchema);
