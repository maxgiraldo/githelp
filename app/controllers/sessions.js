// Module dependencies here
var request = require('request');
var mongoose = require('mongoose');
// Specific mongoose models defined here
var Session = mongoose.model('Session');

exports.create = function(req, res){
  console.log(req);
  var newSession = new Session({duration: "thirty"});
  newSession.save();
  res.send(200);
}
