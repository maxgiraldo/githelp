// Module dependencies here
var request = require('request');
var nodemailer= require('nodemailer');
var mongoose = require('mongoose');
var Q = require('q');
// Specific mongoose models defined here
var User = mongoose.model('User');

var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "gitsomehelp@gmail.com",
        pass: "githelp123"
    }
});

var merchantData = function(apptObj) {
  apptObj.populate
}

exports.composeHtmlBody = function(apptObj, toUser, fromUser) {
  var html = "<b>You've received a request from XXXX for githelp!</b>";

  //  +

  // "<div>
  //   <ul>
  //     <li>Rate per minute:
  //     <li>Requested call length:
  //     <li>Estimate income:
  //   </ul>
  // </div>
  // <div>
  //   Time:
  // </div>

  // 'Requested call length: ' + apptObj.duration
  // 'Date: ' + apptObj.date
  // 'Time: ' + apptObj.time



  // "<a href='http://localhost:3000/appointments/' + appointment._id>Manage Request</a>";



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
