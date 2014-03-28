// Module dependencies here
var request = require('request');
var mongoose = require('mongoose');
// Specific mongoose models defined here
var Appointment = mongoose.model('Appointment');

exports.create = function(req, res){
  console.log('APPT REQ', req.body);
  var newAppointment = new Appointment({duration: req.body.duration, date: req.body.dt, message: req.body.message, time: req.body.time});
  newAppointment.save();
  res.send(200);
}
