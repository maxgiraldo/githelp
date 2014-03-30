// Module dependencies here
var request = require('request');
var mongoose = require('mongoose');
var scheduler = require('../api_builds/scheduler');
var mailer = require('../api_builds/mailer');
var Q = require('q');
var moment = require('moment');
// Specific mongoose models defined here
var Appointment = mongoose.model('Appointment');
var User = mongoose.model('User');

var getEmailByUser = function(username) {
  var deferred = Q.defer();
  User.findOne({userName: username}, function(err, user) {
    var email = user.email;
    deferred.resolve(email);
  });
  return deferred.promise;
};

exports.create = function(req, res) {
  var duration = req.body.duration;
  var merchant = req.body.merchant;
  // var date = req.body.dt;
  var date = moment.utc(req.body.dt, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD');
  var message = req.body.message;
  var time = moment.utc(req.body.time, 'YYYY-MM-DD HH:mm').format('HH:mm');

  console.log('APPT TIME', time);
  console.log('APPT DATE', date);

  var customer = req.user;

  var newAppointment = new Appointment({
    duration: duration,
    date: date,
    message: message,
    time: time,
    customer: customer._id
    // merchant: merchant // needs objectId here
  });

  User.findOne({userName: merchant}, function(err, user){
    newAppointment.merchant = user._id;
    newAppointment.save();
    // send out email
    var htmlBody = mailer.composeHtmlBody(newAppointment);
    mailer.sendEmail(htmlBody, customer.email);
    res.jsonp(newAppointment);
    // res.send(200);

  });
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

