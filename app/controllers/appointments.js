// Module dependencies here
var request = require('request');
var mongoose = require('mongoose');
var scheduler = require('../api_builds/scheduler');
// Specific mongoose models defined here
var Appointment = mongoose.model('Appointment');
var moment = require('moment');

exports.create = function(req, res) {
  var duration = req.body.duration;
  // var date = req.body.dt;
  var date = moment.utc(req.body.dt, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD');
  var message = req.body.message;
  var time = moment.utc(req.body.time, 'YYYY-MM-DD HH:mm').format('HH:mm');

  console.log('APPT TIME', time);
  console.log('APPT DATE', date);
  var newAppointment = new Appointment({duration: duration, date: date, message: message, time: time});
  newAppointment.save();
  res.send(200);
};

exports.confirm = function(req, res) {
  // var id = "id of appointment";
  Appointment.findById(id, function(err, appt) {
    appt.confirmed = true;
    appt.save();
     // Once confirmed, send out confirmation
    // scheduler.sendConfirm() function TBD
  });
  res.send(200);
};

