/**
 * Module dependencies.
 */
var express = require('express'),
    fs = require('fs'),
    sockjs = require('sockjs'),
    http = require('http'),
    passport = require('passport');
/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

//Load configurations
//if test env, load example file
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development',
    config = require('./config/config'),
    mongoose = require('mongoose');

//Bootstrap db connection
var db = mongoose.connect(config.db);

//Bootstrap models
var models_path = __dirname + '/app/models';
var walk = function(path) {
    fs.readdirSync(path).forEach(function(file) {
        var newPath = path + '/' + file;
        var stat = fs.statSync(newPath);
        if (stat.isFile()) {
            if (/(.*)\.(js|coffee)/.test(file)) {
                require(newPath);
            }
        } else if (stat.isDirectory()) {
            walk(newPath);
        }
    });
};

walk(models_path);

var app = express();

var sockjs_opts = {sockjs_url: 'http://cdn.sockjs.org/sockjs-0.3.min.js'};
var sockjs_echo = sockjs.createServer(sockjs_opts);

//express settings
require('./config/express')(app, passport);

//Bootstrap routes
require('./config/routes')(app);


var port = process.env.PORT || config.port;
var server = http.createServer(app);





var connections = [];

sockjs_echo.on('connection', function(conn) {
    connections.push(conn);
    console.log(conn);
    conn.on('data', function(message) {
        for (var ii=0; ii < connections.length; ii++) {
            connections[ii].write(message);
        }
    });
    conn.on('close', function(message) {
        for (var ii=0; ii < connections.length; ii++) {
            connections[ii].write(message);
        }
    });
});

/*

What I need to do is separate appointments, inbox, and texteditor

data emitted should find its correct sockjs instance on the server
then, sockjs emits back and it will find its correct instance and execute the correct function

each connection is different

i need to store connections

allocate them in the right emitter.
i can allocate them in the right emitter by checking for the appointmentID for example
when a user refreshes, he gets a fresh new connection, i should make sure that there are not
two connections in appointments for the same user.

so i need an object called Appointment and index it by the appointmentId
loop through the keys of the object and write a message to each of them

i should have the same data structure on the client side
then i still need to key a $scope object using appointmentId and apply new values to variables
then run $scope.$apply();

we need batches of data

*/

// function SockJSEmitter (conn, sockType) {
//     this.conn = conn;
//     this.sockType = sockType;
// }

// var EventEmitter = require('events').EventEmitter;
// util.inherits(SockJSEmitter, EventEmitter);

// // "emit" an event over the SockJS connection
// SockJSEmitter.prototype.emit = function (event, data) {
//     if (event === 'newListener') return;
//     this.conn.write(JSON.stringify({event: event, sockType: this.sockType, data: data}));
// }

// // call this when we receive an event from the remote end
// SockJSEmitter.prototype.emit_event = function (event, data) {
//     EventEmitter.prototype.emit.call(this, event, data);
// }

// sockjs_server.on('connection', function (conn) {
//     connections.push(conn);
//     var sockjs_sockType_map = {};
//     conn.on('data', function (message) {
//         var msg = JSON.parse(message);
//         if (!(msg.event && msg.sockType)) throw "Invalid message format: " + message;

//         // StartRobot is the first message we get from the browser
//         // -- we use it to setup the SockJSEmitter and associate with a sockType
//         if (msg.event === 'StartRobot') {
//             var sockjs_emitter = new SockJSEmitter(conn, msg.sockType);
//             var status = run_robot(msg.data, sockjs_emitter);
//             if (status.status === "Started") {
//                 sockjs_sockType_map[msg.sockType] = sockjs_emitter;
//             }
//             sockjs_emitter.emit("start_status", status);
//         }
//         else {
//             // For every other message we route to the right
//             // sockjs_emitter and emit_event on it
//             var sockjs_emitter = sockjs_sockType_map[msg.sockType];
//             sockjs_emitter.emit_event(msg.event, msg.data);
//         }
//     });
// })



server.addListener('upgrade', function(req, res){
    res.end();
});

sockjs_echo.installHandlers(server, {prefix: '/echo'});

console.log(' [*] Listening on 0.0.0.0:'+port);
server.listen(port, '0.0.0.0');



// var sockType_map = {};
// var sockjs = null;
// var sockjs_status = 'disconnected';
// var pending = [];
// Robot.prototype.init = function () {
//   sockType_map[self.sockType] = self;
//   if (sockjs_status === 'disconnected') {
//     sockjs_status = 'connecting';

//     sockjs = new SockJS(app.robotServer + "/_sockjs");
//     sockjs.onmessage = function (e) {
//       if (e.type != "message") return;
//       var msg = JSON.parse(e.data);
//       var self = sockType_map[msg.sockType];
//       if (!self) throw "No such sockType";
//       var method = self['event_' + msg.event];
        // method will equal a function, when this runs everything that is supposed to be
        // real time should run here (variable assignments and what not);
        // i could use self['name of event'] like appointments, inbox, text editor
//       if (!method) throw "No such event: " + msg.event;
//       method.call(self, msg.data);
//     }
//     sockjs.onopen = function () {
//       sockjs_status = 'connected';
//       for (var i=0; i<pending.length; i++) {
//         pending[i].run();
//       }
//       pending = [];
//     }
//     sockjs.onclose = function () {
//       sockjs_status = 'disconnected';
//     }
//     pending.push(self);
//   }
//   else if (sockjs_status === 'connecting') {
//     pending.push(self);
//   }
//   else if (sockjs_status === 'connected') {
//     self.run();
//   }
// }

// Robot.prototype.run = function () {
//   this.sockjs_send("StartRobot", this.robot_data);
// }

// Robot.prototype.sockjs_send = function (event, data) {
//   sockjs.send(JSON.stringify({event: event, sockType: this.sockType, data: data});
// }
// instead i can sort by the type of socket i am working with

// // Now implement Robot.prototype.event_* = function (data)
// // -- these will catch your remote events specific to this instance of Robot.


//expose app
exports = module.exports = app;
