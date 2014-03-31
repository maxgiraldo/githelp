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
var Message = mongoose.model('Message');
var Chatroom = mongoose.model('Chatroom');


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
  var merchant = req.body.merchant; // merchant username
  var date = req.body.dt;
  // var date = moment.utc(req.body.dt, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD');
  var message = req.body.message;
  var time = moment.utc(req.body.time, 'YYYY-MM-DD HH:mm').format('HH:mm'); // just extract time
  // var time = req.body.time;

  console.log('APPT TIME', time);
  console.log('APPT DATE', date);
  var timeObj = moment.utc(date + " " + time, "YYYY-MM-DD HH:mm").toDate();
  console.log('TIME OBJ', timeObj); // in UTC

  var customer = req.user;
  var newAppointment = new Appointment({
    duration: duration,
    date: timeObj, // utc TimeObj
    message: message,
    time: timeObj,
    customer: customer._id
    // merchant: merchant // needs objectId here
  });

  User.findOne({userName: merchant}, function(err, user){
    newAppointment.merchant = user._id;
    newAppointment.save(function(err){
      sendMessage(newAppointment._id, newAppointment.message, req.user);
    });
    var ppm = user.ppm;
    // send out email
    configConfirmOpt(newAppointment, customer.userName, merchant, ppm, user.email, function(options){
      mailer.sendConfirmEmail(options, function(err, response){
        console.log(response);
        console.log(options);
        res.jsonp(newAppointment);
      })
    });
  });
};

var sendMessage = function(appointmentId, message, user){
  console.log(appointmentId);
  Appointment.findOne({_id: appointmentId}, function(err, appointment){
    console.log(appointment);
    User.find({ $or: [{_id: appointment.merchant},{_id: appointment.customer}]}, function(err, users){
      var alert = new Message({sender: user._id, content: message});
      Chatroom.findOne({ $and: [{members: users[0]._id}, {members: users[1]._id}]}, function(err, chatroom){
        if(!chatroom){
          var newChatroom = new Chatroom({title: "test"});
          newChatroom.members = [users[0]._id, users[1]._id];
          newChatroom.messages = [alert._id];
          alert.save();
          newChatroom.save();
        } else{
          chatroom.messages.push(alert._id);
          chatroom.save();
          alert.save();
        }
        return "hello";
      });
    });
  });
};

// should queue a bunch of requests and fire them off when their time is up
var sendReminder = function(appt, done){
  return function(){
    setTimeout(function(){
      // console.log('moment', (moment(apptObject.time).subtract(moment(Date.now)).subtract('minutes', 1)).unix());
      startSession(appt);
    }, (moment(appt.time).subtract(moment(Date.now)).subtract('minutes', 1)).unix()*1000);
  }()
}

var startSession = function(appt){
  configReminderOpt(appt, function(options){
    console.log("this is the startSession function", options)
    mailer.sendReminderEmail(options, function(err, response){
      console.log("hello");
      console.log("askldjflaksdjfkljads;ljflasdjflkadsfj;asd;lf;dsjfkdsjfasf")
      console.log(err, response);
    });
  });
};

var configReminderOpt = function(appt, done){
  var estIncome = (parseInt(appt.duration) * parseInt(appt.merchant.ppm)).toFixed(2);
  // console.log('id', appt._id);
  var appointmentId = appt._id;
  var date = moment.utc(appt.date).format('MMMM Do YYYY'); // don't need add'l format string bc ISO format
  // console.log('DATE in email', date);
  var time = moment.utc(appt.time).local().format('h:mm A');
  var duration = appt.duration + " minutes";
  var to = appt.merchant.email+", "+appt.customer.email;
  var subject = "Githelp - You have an appointment in 30 minutes!";
  var url = 'http://192.168.1.178:3000/#!/session/'+appt._id;

  var options = {
    estIncome: estIncome,
    appointmentId: appointmentId,
    date: date,
    time: time,
    duration: duration,
    merchant: appt.merchant.userName,
    customer: appt.customer.userName,
    ppm: appt.merchant.ppm,
    to: to,
    // this should be a string of emails separated by a comma
    subject: subject,
    url: url
  };
  done(options);
}

exports.confirmPage = function(req, res){
  res.render('confirm', {appointmentId: req.params.appointmentId});
};

exports.confirm = function(req, res) {
  // var id = "id of appointment";
  Appointment.findOne({_id: req.body.appointmentId}).populate('merchant').populate('customer').exec(function(err, appt) {
    appt.confirmed = true;
    scheduler.sendEventInvite(appt);
    // startSession(appt);
    sendReminder(appt);
    appt.save();
     // Once confirmed, send out confirmation
  });
  res.send(200);
}

var configConfirmOpt = function(apptObj, fromUserName, toUserName, ppm, merchantEmail, done) {
  var estIncome = (apptObj.duration * ppm).toFixed(2);
  // console.log('id', apptObj._id);
  var appointmentId = apptObj._id;
  var date = moment.utc(apptObj.date).format('MMMM Do YYYY'); // don't need add'l format string bc ISO format
  // console.log('DATE in email', date);
  var time = moment.utc(apptObj.time).local().format('h:mm A');
  var duration = apptObj.duration + " minutes";
  var to = merchantEmail;
  var subject = "Githelp - "+fromUserName+" needs your help!";

  var object = {
    estIncome: estIncome,
    appointmentId: appointmentId,
    date: date,
    time: time,
    duration: duration,
    fromUserName: fromUserName,
    toUserName: toUserName,
    ppm: ppm,
    to: to,
    subject: subject
  };
  done(object);
};

exports.toSession = function(req, res){
  Appointment.findOne({_id: req.params.appointmentId}).populate('merchant').populate('customer').exec(function(err, appointment){
    res.render('session', {appointment: appointment});
    // session.jade already created, have to design
  });
};

exports.endSession = function(req, res) { // untested as of 3/30 bc no new sessions created w new model
  console.log('endsession func');
  Appointment.findById(req.body.appointmentId, function(err, appt) {
    if(err) {console.log(err);}
    console.log('APPT edited', appt);
    appt.completionTime = req.body.duration; // in minutes
    appt.totalCost = req.body.amount; // in cents
    appt.save();
    res.send(200);
  });
};

exports.appointmentsByUser = function(req, res){
  Appointment.find({$or: [{merchant: req.user._id}, {customer: req.user._id}]})
  .populate('merchant')
  .populate('customer')
  .exec(function(err, appointments){
    console.log(appointments);
    res.jsonp({appointments: appointments})
  })
}










