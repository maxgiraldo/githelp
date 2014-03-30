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
  // var date = req.body.dt;
  var date = moment.utc(req.body.dt, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD');
  var message = req.body.message;
  // var time = moment.utc(req.body.time, 'YYYY-MM-DD HH:mm').format('HH:mm');
  var time = req.body.time;

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
    newAppointment.save(function(err){
      sendMessage(newAppointment._id, newAppointment.message, req.user);
    });
    var ppm = user.ppm;
    // send out email
    var htmlBody = mailer.composeHtmlBody(newAppointment, customer.userName, merchant, ppm);
    mailer.sendEmail(htmlBody, user.email); //user.email
    res.jsonp(newAppointment);
    // res.send(200);

  });
};

var sendMessage = function(appointmentId, message, user){
  console.log(appointmentId);
  Appointment.findOne({_id: appointmentId}, function(err, appointment){
    console.log(appointment);
    User.find({ $or: [{_id: appointment.merchant},{_id: appointment.customer}]}, function(err, users){
      var alert = new Message({sender: user._id, content: message});
      Chatroom.findOne({ $and: [{members: users[0]._id}, {members: users[1]._id}]}, function(err, chatroom){
        if(chatroom){
          var newChatroom = new Chatroom({title: "test"});
          newChatroom.members = [users[0]._id, users[1]._id];
          newChatroom.messages = [alert._id];
          alert.save();
          newChatroom.save();
        } else{
          chatroom.messages.push(alert._id);
          alert.save();
        }
        return "hello";
      });
    });
  });
};

exports.toSession = function(req, res){
  Appointment.findOne({_id: req.params.appointmentId}, function(err, appointment){
    res.render('sessionPage', {appointment: appointment});
  })
}

exports.confirmPage = function(req, res){
  res.render('confirm', {appointmentId: req.params.appointmentId})
};

exports.confirm = function(req, res) {
  // var id = "id of appointment";
  Appointment.findById(id, function(err, appt) {
    appt.confirmed = true;
    appt.save();
     // Once confirmed, send out confirmation
    scheduler.sendEventInvite(apptObj);
  });
  res.send(200);
};

// Appointment.findById('5337a57d876c5027bdc5c00c', function(err, appt) {
//   appt.confirmed = true;
//   appt.save();
//    // Once confirmed, send out confirmation
//   scheduler.sendEventInvite(appt);
// });

