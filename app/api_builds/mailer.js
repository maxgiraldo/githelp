// Module dependencies here
var nodemailer= require('nodemailer');
var path = require('path');
var appDir = path.dirname(require.main.filename);
var swig = require('swig');


var email = function(options, done){
  var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
      user: "gitsomehelp@gmail.com",
      pass: "githelp123"
    }
  });
  console.log("in the email function");
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
  console.log("hello");
  var tpl = swig.compileFile(appDir+"/public/views/email_templates/"+emailTemplate+".html", {autoescape: false});
  var html;
  console.log("sendTemplateMail");
  if (html = tpl(emailData)) {
    emailData.html = html;
    email(emailData, done);
  }
};

exports.sendConfirmEmail = function(options, done){
  sendTemplateMail("confirm", options, done);
};

exports.sendReminderEmail = function(options, done){
  sendTemplateMail("reminder", options, done);
};

exports.sendDebitEmail = function(options, done){
  sendTemplateMail("debit", options, done);
};


exports.sendCreditEmail = function(options, done){
  console.log('sendCreditEmail')
  sendTemplateMail("credit", options, done);
};