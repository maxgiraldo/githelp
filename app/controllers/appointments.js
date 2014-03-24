// Module dependencies here
var request = require('request');
var mongoose = require('mongoose');
// Specific mongoose models defined here
var Appointment = mongoose.model('Appointment');

exports.create = function(req, res){
  console.log(req);
  var newAppointment = new Appointment({duration: "thirty"});
  newAppointment.save();
  res.send(200);
}
