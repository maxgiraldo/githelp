// Module dependencies here
var request = require('request');
var mongoose = require('mongoose');
var scheduler = require('../api_builds/scheduler');
// Specific mongoose models defined here
var Appointment = mongoose.model('Appointment');
var moment = require('moment');
var nodemailer = require("nodemailer");

exports.create = function(req, res) {
  var duration = req.body.duration;
  // var date = req.body.dt;
  var date = moment.utc(req.body.dt, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD');
  var message = req.body.message;
  var time = moment.utc(req.body.time, 'YYYY-MM-DD HH:mm').format('HH:mm');

  console.log('APPT TIME', time);
  console.log('APPT DATE', date);

  var newAppointment = new Appointment({
    duration: req.body.duration,
    date: req.body.dt,
    message: req.body.message,
    time: req.body.time
  });

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

exports.sendEmail = function(req, res) {
  // create reusable transport method (opens pool of SMTP connections)
  var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "gitsomehelp@gmail.com",
        pass: "githelp123"
    }
  });

  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: "Githelp ✔ <gitsomehelp@gmail.com>", // sender address
    to: "maxagiraldo@gmail.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world ✔", // plaintext body
    html: "<b>Hello world ✔</b>" // html body
  }

  // send mail with defined transport object
  smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
        console.log(error);
    }else{
        console.log("Message sent: " + response.message);
    }

    // if you don't want to use this transport object anymore, uncomment following line
    //smtpTransport.close(); // shut down the connection pool, no more messages
    res.send(200);
  });

};

