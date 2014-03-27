var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  fullName: String,
  userName: String,
  email: String,
  githubId: String,
  googleId: String,
  github: {},
  accessToken: String,
  // the below is the user id for balanced
  balancedUser: String,
  // the below is the id for the tokenized card associated with balanced customer
  balancedCard: String,
  // below is the id for the tokenized acct if the customer is a merchant
  balancedBank: String,
  paymentsMade: [{type: Schema.ObjectId,
                ref: 'Payment'}],
  paymentsReceived: [{type: Schema.ObjectId,
                ref: 'Payment'}],
  refreshToken: String,
  chatrooms: [{type: Schema.ObjectId,
              ref: 'Chatroom'}]
});

mongoose.model('User', UserSchema);
