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

// passport that has views
// a package that used passport but included views and validations
// devise on rails



// server.addListener('request', function(req, res){
//     sockjs_echo.on('connection', function(conn) {
//         conn.on('data', function(message){
//             console.log("i'm actually")
//             conn.write(message);
//         });
//     });
// });

sockjs_echo.on('connection', function(conn) {
    connections.push(conn);

    conn.on('data', function(message) {
        for (var ii=0; ii < connections.length; ii++) {
            connections[ii].write(message);
        }
    });
    conn.on('close', function() {
        for (var ii=0; ii < connections.length; ii++) {
            connections[ii].write("User has disconnected");
        }
    });
});




server.addListener('upgrade', function(req, res){
    res.end();
});

sockjs_echo.installHandlers(server, {prefix: '/echo'});

console.log(' [*] Listening on 0.0.0.0:'+port);
server.listen(port, '0.0.0.0');



//Start the app by listening on <port>


// Socket.io
// var io = require('socket.io').listen(server);

// GLOBAL.sockets = {};

// // Socket.io Communication
// io.sockets.on('connection', function (socket) {
//   socket.emit('news', { hello: 'world' });
//   socket.on('textEditorChange', function (dataAboutChangeInTextEditor) {
//     console.log(dataAboutChangeInTextEditor);
//   });
// });

//   socket.on('userChange', function(data) {
//     socket.emit('userChange', { userChange: data });
//   });



//expose app
exports = module.exports = app;
