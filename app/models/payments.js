var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var PaymentSchema = new Schema({
  giver: {type: Schema.ObjectId,
          ref: "User"},
  taker: {type: Schema.ObjectId,
          ref: "User"},
  amount: String,
  balancedId: String,
  createDate: String,
  status: String
});

mongoose.model('Payment', PaymentSchema);
