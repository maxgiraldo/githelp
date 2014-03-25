// Module dependencies here
var async = require('async');
var GitHubStrategy = require('passport-github').Strategy;
var passport = require('passport');
var mongoose = require('mongoose');
// Specific mongoose models defined here
var User = mongoose.model('User');


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
  callbackURL: "http://localhost:3000/auth/github/callback"
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
        return done(err, user);
      }
    });
  }
));



module.exports = function(app) {

  //Routes to App Controllers here
  var index = require('../app/controllers/index');
  var users = require('../app/controllers/users');
  var appointments = require('../app/controllers/appointments');

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

  app.post('/appointment', appointments.create);

  app.get('/', index.render);
  app.post('/query', index.results);

  app.get('/user/:userName', users.profile);

  app.get('/signin', users.signin);
  app.get('/signup', users.signup);
  app.get('/signout', users.signout);
};
