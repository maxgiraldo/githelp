var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  fullName: String,
  userName: String,
  email: String,
  githubId: String,
  github: {},
  accessToken: String,
  // the below is the user id for balanced
  balancedId: String,
  // the below is the id for the tokenized card associated with balanced customer
  balancedToken: String,
  paymentsMade: [{type: Schema.ObjectId,
                ref: 'Payment'}],
  paymentsRecieved: [{type: Schema.ObjectId,
                ref: 'Payment'}]
});

mongoose.model('User', UserSchema);
