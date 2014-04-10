// Module dependencies here
var async = require('async');
var GitHubStrategy = require('passport-github').Strategy;
var passport = require('passport');
var mongoose = require('mongoose');
// Specific mongoose models defined here
var User = mongoose.model('User');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// Deserialize the user object based on a pre-serialized token
// which is the user id
passport.deserializeUser(function(id, done) {
  User.findOne({
      _id: id
  }, function(err, user) {
      done(err, user);
  });
});
// this will attach user to request (req.user);
//

passport.use(new GitHubStrategy({
  // Below are JHK's Keys
  clientID: '71778e134296a29071f4',
  clientSecret: '2a6a040b9fd4a2b74763055c8f017dba964f1d99',
  callbackURL: "http://172.18.74.30:3000/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({ githubId: profile.id }, function (err, user) {
      if(err) return err;
      if(!user){
        var u = new User({
          fullName: profile.displayName,
          userName: profile._json.login,
          email: profile._json.email,
          githubId: profile.id,
          github: profile._json,
          accessToken: accessToken
        });
        u.save(function(err){
          return done(err, u);
        });
      } else{
        user.fullName = profile.displayName;
        user.userName = profile._json.login;
        user.email = profile._json.email;
        user.githubId = profile.id;
        user.github = profile._json;
        user.accessToken = accessToken;
        user.save(function(err){
          return done(err, user);
        })
      }
    });
  }
));

// clientID: "1062441697172-33jpstb44qdojs5j4nvkkuqjddisbkuf.apps.googleusercontent.com",
// clientSecret: "pMISlGf7iRg41t9Y7Nxhxk97",
// callbackURL: "https://localhost:3000/auth/google/callback"

passport.use(new GoogleStrategy({
    clientID: "700936463795-3ettb8q7r93i281rp9mrtt8qd6q3k4uv.apps.googleusercontent.com",
    clientSecret: "5TfB_7aHC6mL9SyPHQNtMPBM",
    callbackURL: "https://192.168.1.178/:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({ googleId: profile.id }, function (err, user) {
    if(err) return err;
      if(!user){
        var u = new User({
          fullName: profile.displayName,
          email: profile.emails[0],
          accessToken: accessToken,
          googleId: profile.id,
          google: profile._json,
          refreshToken: refreshToken
        });
        console.log('token?', u);
        u.save(function(err){
          return done(err, u);
        });
      } else{
          return done(err, user);
      }
    });
  }
));


// accessToken: "ya29.1.AADtN_XoNSuOQFfitJXEgSam8bCayvisuhvjQmvNpLwjS8vYR0STH0aNPqdZLShx92gk", googleId: "111493934185373214286"
// refreshToken:
module.exports = function(app) {

  //Routes to App Controllers here
  var index = require('../app/controllers/index');
  var users = require('../app/controllers/users');
  var payments = require('../app/controllers/payments');
  var appointments = require('../app/controllers/appointments');
  var messages = require('../app/controllers/messages');

  // passport routes
  // this requests to github login with clientId and clientSecret
  app.get('/auth/github',
    passport.authenticate('github'),
    users.signin);

  // user gets automatically redirect to this route along with accessToken
  // get JSON user object back, this will serialize and deserialize the user
  // also attaches user to req (req.user)
  app.get('/auth/github/callback',
    passport.authenticate('github', {failureRedirect: '/login'}),
    users.authCallback);



  app.get('/auth/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
                                            'https://www.googleapis.com/auth/userinfo.email',
                                            'https://www.googleapis.com/auth/calendar'] }),
    users.signin);

  // app.get('/auth/google',
  //   passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/calendar'] }),
  //   users.signin);


  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      console.log('GOOG?', req);
      res.redirect('/');
    });

  // var githelpGoog = {
  //   username: gitsomehelp,
  //   password: githelp123
  // };

  // req.logIn(githelpGoog, function(err) {
  //   if(err) { return next(err); }
  //   return res.redirect('/');
  // });
  app.get('/appointment', appointments.appointmentsByUser);
  app.post('/appointment', appointments.confirm);
  app.get('/appointments/:appointmentId', appointments.toSession);
  app.get('/inbox', messages.findAllChatroom);
  app.post('/inbox', messages.createChatroom);
  app.get('/message', messages.messageByChatroom);
  app.post('/message', messages.createMessage);

  app.post('/updatePpm', users.updatePpm);

  app.post('/appointment', appointments.create);

  app.get('/', index.render);

  app.get('/user', users.findAll);
  app.get('/user/:userName', users.profile);
  app.get('/user/:userName/:repoName', users.repoData);
  app.put('/user', users.edit);

  app.post('/query', index.results);
  app.post('/create/cc', payments.createCard);
  app.post('/create/appointment', appointments.create);
  app.post('/charge', payments.transaction);

  // app.get('/email', appointments.sendEmail);

  app.post('/create/ba', payments.createBankAcct);

  app.post('/session/end', appointments.endSession);

  app.get('/signin', users.signin);
  app.get('/signup', users.signup);
  app.get('/signout', users.signout);

  app.get('/session', function(req, res) {
    res.render('session');
  });
};
