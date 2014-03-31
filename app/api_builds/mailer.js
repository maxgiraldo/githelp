// Module dependencies here
var request = require('request');
var nodemailer= require('nodemailer');
var mongoose = require('mongoose');
var path = require('path');
var appDir = path.dirname(require.main.filename);
var Q = require('q');
var moment = require('moment');
// Specific mongoose models defined here
var User = mongoose.model('User');
var Appointment = mongoose.model('Appointment');
var swig = require('swig');


var email = function(options, done){
  var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
      user: "gitsomehelp@gmail.com",
      pass: "githelp123"
    }
  });

  if (!done) {
    done = function () {};
  }
  smtpTransport.sendMail({
     from: "Githelp ✔ <gitsomehelp@gmail.com>", // sender address
     to: options.to, // comma separated list of receivers
     subject: options.subject, // Subject line
     html: options.html // plaintext body
  }, function(error, response){
     if(error){
         console.log(error);
         done(error, response);
     }else{
         console.log("Message sent: " + response.message);
         done(null, response);
     }
  });
};

var sendTemplateMail = function (emailTemplate, emailData, done) {
  var tpl = swig.compileFile(appDir+"/public/views/email_templates/"+emailTemplate+".html", {autoescape: false});
  var html;
  if (html = tpl(emailData)) {
    emailData.html = html;
    email(emailData, done);
  }
};

exports.sendConfirmEmail = function(options, done){
  sendTemplateMail("confirm", options, done);
}
