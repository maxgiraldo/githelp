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

// exports.merchantData = function(apptObj) {
//   // apptObj.populate;
//   var deferred = Q.defer();
//   apptObj.merchant.populate('email').exec(function(err, merchEmail) {
//     deferred.resolve(merchEmail);
//   });
//   return deferred.promise;
// };

// exports.customerData = function(apptObj) {
//   // apptObj.populate;
//   var deferred = Q.defer();
//   apptObj.customer.populate('email').exec(function(err, cusEmail) {
//     deferred.resolve(cusEmail);
//   });
//   return deferred.promise;
// };

exports.attendeesEmail = function(apptObj) {
  var deferred = Q.defer();
  // console.log('custObj', apptObj.customer);
  User.find({$or: [{_id: apptObj.customer},{_id: apptObj.merchant}]}, function(err, users) {
    if(err) {
      console.log(err);
      deferred.reject(err);
    }
    // console.log('users', users);
    deferred.resolve(users);
  });
  return deferred.promise;
};

// var getUserName = function(id) {
//   var deferred = Q.defer();
//   User.findById(id, function(err, user) {
//     if(err) {console.log(err)}
//     deferred.resolve(user.userName);
//   });
//   return deferred.promise;
// };

exports.composeHtmlBody = function(apptObj, fromUserName, toUserName, ppm) {
  var estIncome = (apptObj.duration * ppm).toFixed(2);
  // console.log('id', apptObj._id);
  var appointmentId = apptObj._id;
  var date = moment.utc(apptObj.date).format('MMMM Do YYYY'); // don't need add'l format string bc ISO format
  // console.log('DATE in email', date);
  var time = moment.utc(apptObj.time).local().format('h:mm A');
  var duration = apptObj.duration + " minutes";
  var html = "<b>You've received a request from " + fromUserName + " for githelp!</b>" +
  "<br /><div><ul>" +
  "<li>Date: " + date + "</li>" +
  "<li>Time: " + time + " (ET)</li>" +
  "<li>Requested call length: " + duration + "</li>" +
  "<li>Rate per minute: $" + ppm + "</li>" +
  "<li>Estimated income: $" + estIncome + "</li>" +
  "</ul></div><br />" +
  "<a href='http://192.168.1.174:3000/#!/" + toUserName + "/confirm/" + appointmentId + "'>Manage Request</a>";

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






