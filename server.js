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





// var connections = [];

// sockjs_echo.on('connection', function(conn) {
//     connections.push(conn);
//     console.log(conn);
//     conn.on('data', function(message) {
//         for (var ii=0; ii < connections.length; ii++) {
//             connections[ii].write(message);
//         }
//     });
//     conn.on('close', function(message) {
//         for (var ii=0; ii < connections.length; ii++) {
//             connections[ii].write(message);
//         }
//     });
// });

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

var SockJSEmitter = function (sockType) {
    // this connection should be an array
    this.allConnections = {};
    this.sockType = sockType;
};

// "emit" an event over the SockJS connection
SockJSEmitter.prototype.emit = function (connections, message) {
    if (message.event === 'newListener') return;
    for (var ii=0; ii < connections.length; ii++) {
        connections[ii].write(JSON.stringify(message));
    }
};

// each time i have to use sockets, i open a new connection
var inboxEmitter = new SockJSEmitter('inbox');
var timeEmitter = new SockJSEmitter('time');
var fileEmitter = new SockJSEmitter('file');
// there is really no point in creating channels dynamically.
sockjs_echo.on('connection', function (conn) {

    conn.on('data', function (message) {
        var msg = JSON.parse(message);
        // we need validations to check if appointments already exist
        // if (!(msg.event && msg.sockType)) throw "Invalid message format: " + message;

        // StartRobot is the first message we get from the browser
        // -- we use it to setup the SockJSEmitter and associate with a sockType
        if (msg.event === 'StartRobot') {
            if (msg.sockType === "inbox") {
                //  check if AppointmentId
                var connections = inboxEmitter.allConnections[msg.id];
                if(connections instanceof Array){
                    connections.push(conn);
                } else{
                    inboxEmitter.allConnections[msg.id] = [conn];
                }
            } else if(msg.sockType === "time"){
                var connections = timeEmitter.allConnections[msg.id];
                if(connections instanceof Array){
                    connections.push(conn);
                } else{
                    timeEmitter.allConnections[msg.id] = [conn];
                }
            } else if(msg.sockType === "file"){
                var connections = fileEmitter.allConnections[msg.id];
                if(connections instanceof Array){
                    connections.push(conn);
                } else{
                    fileEmitter.allConnections[msg.id] = [conn];
                }
            }
        }
        else {
            // For every other message we route to the right
            // sockjs_emitter and emit_event on it
            // iteration should happen here.
            if (msg.sockType === "inbox") {
                //  check if AppointmentId
                var connections = inboxEmitter.allConnections[msg.id];
                inboxEmitter.emit(connections, msg);
            } else if (msg.sockType === "time") {
                //  check if AppointmentId
                var connections = timeEmitter.allConnections[msg.id];
                timeEmitter.emit(connections, msg);
            } else if (msg.sockType === "file") {
                //  check if AppointmentId
                var connections = fileEmitter.allConnections[msg.id];
                fileEmitter.emit(connections, msg);
            }
        }
    });

    conn.on('close', function (message){
        console.log("hello");
        console.log(message);
        console.log('closing on the server')
        if(message){
            var msg = JSON.parse(message);
            console.log(msg);
            if(msg.sockType === "time"){
                var connections = timeEmitter.allConnections[msg.id];
                timeEmitter.emit(connections, msg);
            }
        }
    });
})



server.addListener('upgrade', function(req, res){
    res.end();
});

sockjs_echo.installHandlers(server, {prefix: '/echo'});

console.log(' [*] Listening on 0.0.0.0:'+port);
server.listen(port, '0.0.0.0');



//expose app
exports = module.exports = app;
