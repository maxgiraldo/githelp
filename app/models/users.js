var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Q = require('q');

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
  // price per minute
  ppm: String,
  intro: String
});


UserSchema.statics.title = function(membersArray){
  var membersName = [];
  var deferred = Q.defer();
  var i = 0;
  var self = this;
  membersArray.forEach(function(member){
    i++
    self.findOne({_id: member}).populate('members').exec(function(err, member){
      membersName.push(member.fullName);
      if(membersArray.length === i){
        deferred.resolve(membersName.join(", "))
      }
    })
  })
  return deferred.promise;
}

mongoose.model('User', UserSchema);
