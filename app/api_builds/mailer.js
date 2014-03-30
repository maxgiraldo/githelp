// Module dependencies here
var request = require('request');
var nodemailer= require('nodemailer');
var mongoose = require('mongoose');
var Q = require('q');
var moment = require('moment');
// Specific mongoose models defined here
var User = mongoose.model('User');
var Appointment = mongoose.model('Appointment');

var smtpTransport = nodemailer.createTransport("SMTP",{
  service: "Gmail",
  auth: {
    user: "gitsomehelp@gmail.com",
    pass: "githelp123"
  }
});

exports.ppmData = function(apptObj) {
  // apptObj.populate;
  var deferred = Q.defer();
  apptObj.merchant.populate('ppm').exec(function(err, ppm) {
    deferred.resolve(ppm);
  });
  return deferred.promise;
};

exports.composeHtmlBody = function(apptObj, fromUserName, ppm) {
  var estIncome = (apptObj.duration * ppm).toFixed(2);
  var date = moment.utc(apptObj.date).format('MMMM Do YYYY'); // don't need add'l format string bc ISO format
  // console.log('DATE in email', date);
  var time = moment.utc(apptObj.time).local().format('HH:mm a');
  var duration = apptObj.duration + " minutes";
  var html = "<b>You've received a request from " + fromUserName + " for githelp!</b>" +
  "<br /><div><ul>" +
  "<li>Date: " + date + "</li>" +
  "<li>Time: " + time + " (EST)</li>" +
  "<li>Requested call length: " + duration + "</li>" +
  "<li>Rate per minute: $" + ppm + "</li>" +
  "<li>Estimated income: $" + estIncome + "</li>" +
  "</ul></div><br />" +
  "<a href='http://localhost:3000/appointments/' + apptObj._id>Manage Request</a>";

  return html;
};

exports.sendEmail = function(htmlBody, toEmail) {
  var mailOptions = {
    from: "Githelp ✔ <gitsomehelp@gmail.com>", // sender address
    to: toEmail, // list of receivers
    subject: "githelp Request!", // Subject line
    // text: "Hello world ✔", // plaintext body
    html: htmlBody // html body
  };

  // send mail with defined transport object
  smtpTransport.sendMail(mailOptions, function(error, response){
    if(error) {
        console.log(error);
    } else{
        console.log("Message sent: " + response.message);
    }
  });

};
