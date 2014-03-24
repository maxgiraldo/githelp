var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SessionSchema = new Schema({
  merchant: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  customer: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  payment:{
    type: Schema.ObjectId,
    ref: 'Payment'
  },
  date: {
    type: Date
  },
  duration: String
});

mongoose.model('Session', SessionSchema);
