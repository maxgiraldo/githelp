var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Q = require('q');

var MessageSchema = new Schema({
  sender: {type: Schema.ObjectId,
          ref: "User"},
  content: String,
  created: {type: Date,
    default: Date.now}
});

MessageSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('sender').exec(cb);
};

var afterIterate = function(array, callback){
  var newArray = [];
  array.forEach(function(){

  })
  callback(newArray)
}

MessageSchema.statics.multipleLoad = function(idArray, cb){
  var self = this;
  var i = 0;
  var messageArray = [];
  var deferred = Q.defer();
  if(idArray.length < 1){
    deferred.resolve([]);
    // i am making a check for whether or not there are actually messags
  }
  idArray.forEach(function(message){
    self.findOne({
      _id: message._id
    }).populate('sender').exec(function(err, message){
      i++
      messageArray.push(message);
      if(idArray.length === i){
        deferred.resolve(messageArray);
      }
    });
  })
  return deferred.promise;
}






mongoose.model('Message', MessageSchema);
