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

exports.composeHtmlBody = function(apptObj) {
  var html = "<b>You've received a request for githelp!</b>";



  return html;
};

exports.sendEmail = function(htmlBody, toEmail) {
  var mailOptions = {
    from: "Githelp ✔ <gitsomehelp@gmail.com>", // sender address
    to: toEmail, // list of receivers
    subject: "You have received a request for githelp!", // Subject line
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
