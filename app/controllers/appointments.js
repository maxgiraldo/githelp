// Module dependencies here
var request = require('request');
var mongoose = require('mongoose');
var scheduler = require('../api_builds/scheduler');
var mailer = require('../api_builds/mailer');
var Q = require('q');
var moment = require('moment');
var async = require('async');
// Specific mongoose models defined here
var Appointment = mongoose.model('Appointment');
var User = mongoose.model('User');
// var Message = mongoose.model('Message');
var Chatroom = mongoose.model('Chatroom');


var getEmailByUser = function(username) {
  var deferred = Q.defer();
  User.findOne({userName: username}, function(err, user) {
    var email = user.email;
    deferred.resolve(email);
  });
  return deferred.promise;
};

var timeObj = function(date, time) {
  return moment.utc(date + " " + time, "YYYY-MM-DD HH:mm").toDate();
};

exports.create = function(req, res) {
  var duration = req.body.duration;
  var merchant = req.body.merchant; // merchant username
  var message = req.body.message;
  var customer = req.user;

  // var date = req.body.dt; latest v
  // var date = moment.utc(req.body.dt, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD');
  // var time = moment.utc(req.body.time, 'YYYY-MM-DD HH:mm').format('HH:mm'); // just extract time latest v
  // var time = req.body.time;

  var firstDateTime = {
    date: req.body.first.dt,
    time: moment.utc(req.body.first.time, 'YYYY-MM-DD HH:mm').format('HH:mm')
  };

  var secondDateTime = {
    date: req.body.second.dt,
    time: moment.utc(req.body.second.time, 'YYYY-MM-DD HH:mm').format('HH:mm')
  };

  var thirdDateTime = {
    date: req.body.third.dt,
    time: moment.utc(req.body.third.time, 'YYYY-MM-DD HH:mm').format('HH:mm')
  };

  console.log('firstDateTime', firstDateTime);
  console.log('secondDateTime', secondDateTime);
  console.log('thirdDateTime', thirdDateTime);

  // dateTimeObj = req.body.first, req.body.second, req.body.third (each has .dt and .time attribs)

  // var Appointment = function(duration, merchant, customer, message, dateTimeObj) {
  //   this.duration = duration;
  //   this.customer = req.user._id;
  //   this.merchant = merchant;
  //   this.message = message;
  //   this.date = dateTimeObj.dt;
  //   this.time = moment.utc(dateTimeObj.time, 'YYYY-MM-DD HH:mm').format('HH:mm');
  // };

  var newAppointment = new Appointment({
    duration: duration,
    customer: customer._id,
    message: message,
    date: {
      option1: {
        date: timeObj(firstDateTime.date, firstDateTime.time),
        confirmed: false
      },
      option2: {
        date: timeObj(secondDateTime.date, secondDateTime.time),
        confirmed: false
      },
      option3: {
        date: timeObj(thirdDateTime.date, thirdDateTime.time),
        confirmed: false
      }
    }
    // time:
    // date: timeObj(firstDateTime.date, firstDateTime.time),
    // time: timeObj(firstDateTime.date, firstDateTime.time),
  });

  User.findOne({userName: merchant}, function(err, merchant){
    newAppointment.merchant = merchant._id;

    newAppointment.save(function(err){
      sendMessage(newAppointment._id, newAppointment.message, customer);
    });
    var ppm = merchant.ppm;
    // send out email
    configConfirmOpt(newAppointment, customer.userName, merchant.userName, ppm, merchant.email, function(options){
      mailer.sendConfirmEmail(options, function(err, response){
        console.log(response);
        console.log(options);
        res.jsonp(newAppointment);
      });
    });
  });
};

exports.edit = function(req, res) {
  var appointmentId = req.body.appointmentId;
  console.log('REQ', req.body);
  var user = req.user;
  // console.log('user', user);

  // var duration = req.body.duration;
  // var merchant = req.body.merchant; // merchant username from datePicker controller
  // var customer = req.body.customer;

  var toEmail, toUserName;

  var firstDateTime = {
    date: req.body.first.dt,
    time: moment.utc(req.body.first.time, 'YYYY-MM-DD HH:mm').format('HH:mm')
  };

  var secondDateTime = {
    date: req.body.second.dt,
    time: moment.utc(req.body.second.time, 'YYYY-MM-DD HH:mm').format('HH:mm')
  };

  var thirdDateTime = {
    date: req.body.third.dt,
    time: moment.utc(req.body.third.time, 'YYYY-MM-DD HH:mm').format('HH:mm')
  };

  Appointment.findOne({_id: appointmentId}).populate('merchant').populate('customer').exec(function(err, appt) {
    // console.log('APPT',appt);
    if(user.github.login === appt.customer.userName) {
    toEmail = appt.merchant.email;
    toUserName = appt.merchant.userName;
    } else {
      toEmail = appt.customer.email;
      toUserName = appt.customer.userName;
    }

    console.log('cust email', appt.customer.email);
    console.log('merch email', appt.merchant.email);

    appt.date.option1.date = timeObj(firstDateTime.date, firstDateTime.time);
    appt.date.option2.date = timeObj(secondDateTime.date, secondDateTime.time);
    appt.date.option3.date = timeObj(thirdDateTime.date, thirdDateTime.time);
    appt.save();
    // send confirmation email back to customer (apptObj, fromUserName, toUserName, ppm, toEmail, done)
    configConfirmOpt(appt, req.user.userName, toUserName, appt.merchant.ppm, toEmail, function(options){
      mailer.sendConfirmEmail(options, function(err, response){
        console.log(response);
        console.log(options);
        res.jsonp(appt);
      });
    });
  });
};

var sendMessage = function(appointmentId, message, user){
  console.log(appointmentId);
  Appointment.findOne({_id: appointmentId}, function(err, appointment){
    console.log(appointment);
    User.find({ $or: [{_id: appointment.merchant},{_id: appointment.customer}]}, function(err, users){
      var alert = {sender: {fullName: user.fullName, userName: user.userName, avatarUrl: user.github.avatar_url}, content: message};
      Chatroom.findOne({ $and: [{members: users[0]._id}, {members: users[1]._id}]}, function(err, chatroom){
        if(!chatroom){
          var newChatroom = new Chatroom({title: "test"});
          newChatroom.members = [users[0]._id, users[1]._id];
          newChatroom.messages = [alert];
          newChatroom.save();
        } else{
          chatroom.messages.push(alert);
          chatroom.save();
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
  var confirmedDate = scheduler.getConfirmedDate(appt);
  //NEED TO CHECK WHICH APPT IS CONFIRMED
  var date = formatDate(confirmedDate); // don't need add'l format string bc ISO format
  // console.log('DATE in email', date);
  var time = formatTime(confirmedDate);
  var duration = appt.duration + " minutes";
  var to = appt.merchant.email+", "+appt.customer.email;
  var subject = "Githelp - You have an appointment in 30 minutes!";
  var url = 'http://172.18.73.218:3000/#!/session/'+appt._id;

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
};

exports.display = function(req, res) {
  var appointmentId = req.body.appointmentId;

  Appointment.findOne({_id: appointmentId}).populate('merchant').populate('customer').exec(function(err, appt) {
    appt.date[option].confirmed = true;
    // appt.confirmed = true;
    scheduler.sendEventInvite(appt);
    // startSession(appt);
    sendReminder(appt);
    appt.save();
     // Once confirmed, send out confirmation
    res.redirect('/#!/confirm/' + appointmentId);
  });
};

exports.show = function(req, res) {
  var appointmentId = req.body.appointmentId;
  Appointment.findOne({_id: appointmentId}).populate('merchant').populate('customer').exec(function(err, appt) {
    res.jsonp(appt);
  });
};

exports.confirm = function(req, res) {
  // var id = "id of appointment";
  var option = req.params.option; // 'option1', 'option2', 'option3'
  var userName = req.params.userName; // first click, userName is merchant

  console.log('OPTION', option);
  // console.log('PARAMS', req.params);

  // var appointmentId = req.body.appointmentId; // with post
  var appointmentId = req.params.appointmentId;

  Appointment.findOne({_id: appointmentId}).populate('merchant').populate('customer').exec(function(err, appt) {
    if(appt.confirmed) { // already confirmed; only 1 of 3 options can be confirmed true
      console.log('Appt has already been confirmed');
      // if(req.user) {
        res.redirect('/#!/appointments/' + appointmentId + "/confirmation");
      // } else {
      //   res.render('confirmation');
      // }
    } else {
      appt.date[option].confirmed = true;
      appt.confirmed = true;
      // appt.confirmed = true;
      scheduler.sendEventInvite(appt); // or separate final Confirmation email
      // startSession(appt);
      sendReminder(appt);
      appt.save();
       // Once confirmed, send out confirmation
      if(req.user) {
        res.redirect('/#!/appointments/' + appointmentId + "/confirmation");
      } else {
        res.render('confirmation');
      }
      // res.redirect('/#!/' + userName + '/confirmation/' + appointmentId);
    }
  });
};

exports.reschedule = function(req, res) {
  var appointmentId = req.params.appointmentId;
  var userName = req.params.userName;
  res.redirect('/#!/appointments/' + appointmentId + "/reschedule");
  // res.redirect('/#!/' + userName + '/reschedule/' + appointmentId);

  // Appointment.findOne({_id: appointmentId}).populate('merchant').populate('customer').exec(function(err, appt) {
  //   res.render('reschedule', {appt: appt});
  // });
};

var formatDate = function(dateFromDb) { // apptObj.date
  return moment.utc(dateFromDb).format('MMMM Do YYYY');
};
var formatTime = function(dateFromDb) { // apptObj.date
  return moment.utc(dateFromDb).local().format('h:mm A');
};

var configConfirmOpt = function(apptObj, fromUserName, toUserName, ppm, toEmail, done) {
  var estIncome = (apptObj.duration * ppm).toFixed(2);
  var subject = "Githelp - "+fromUserName+" needs your help!";

  var estIncome = (apptObj.duration * ppm).toFixed(2);
  var appointmentId = apptObj._id;

  // var date = moment.utc(apptObj.date).format('MMMM Do YYYY'); // don't need add'l format string bc ISO format
  // var time = moment.utc(apptObj.time).local().format('h:mm A');
  var duration = apptObj.duration + " minutes";
  var message = apptObj.message;
  var to = toEmail;

  console.log('apptObj.date',apptObj.date );

  var object = {
    estIncome: estIncome,
    appointmentId: appointmentId,
    date: {
      option1: {
        date: formatDate(apptObj.date.option1.date),
        time: formatTime(apptObj.date.option1.date),
        confirmed: apptObj.date.option1.confirmed
      },
      option2: {
        date: formatDate(apptObj.date.option2.date),
        time: formatTime(apptObj.date.option2.date),
        confirmed: apptObj.date.option2.confirmed
      },
      option3: {
        date: formatDate(apptObj.date.option3.date),
        time: formatTime(apptObj.date.option3.date),
        confirmed: apptObj.date.option3.confirmed
      }
    },
    // time: time,
    message: message,
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


