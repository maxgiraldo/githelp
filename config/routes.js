// Module dependencies here
var async = require('async');
var passport = require('passport');
var mongoose = require('mongoose');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var GitHubStrategy = require('passport-github').Strategy;
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

var githubCallbackURL;
var googleCallbackURL;
if (process.env.NODE_ENV === 'production'){
  googleCallbackURL = 'http://githelp.herokuapp.com/auth/google/callback';
  githubCallbackURL = 'http://githelp.herokuapp.com/auth/github/callback';
} else{
  googleCallbackURL = 'http://192.168.1.174:3000/auth/google/callback';
  githubCallbackURL = 'http://192.168.1.174:3000/auth/github/callback';
}

passport.use(new GitHubStrategy({
  // Below are JHK's Keys

  // clientID: '71778e134296a29071f4',
  // clientSecret: '2a6a040b9fd4a2b74763055c8f017dba964f1d99',
  // callbackURL: githubCallbackURL
  // WT keys:
  clientID: '0934ee7ca0cdc34cc007',
  clientSecret: 'dc0845769a5c3835bebc2a7a4772e0689b7ac1d7',
  callbackURL: githubCallbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({ githubId: profile.id }, function (err, user) {
      if(err) return err;
      if(!user){
        var u = new User({
          fullName: profile.displayName,
          userName: profile._json.login,
          contactEmail: profile._json.email, // save github email as contact email when first sign up
          email: profile._json.email,
          githubId: profile.id,
          github: profile._json,
          accessToken: accessToken,
          avatarUrl: profile._json.avatar_url
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
        user.avatarUrl = profile._json.avatar_url;
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
    callbackURL: googleCallbackURL
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
  var texteditor = require('../app/controllers/texteditor');

  // passport routes
  // this requests to github login with clientId and clientSecret
  app.get('/auth/github',
    passport.authenticate('github'),
    users.signin);

  var lastUrl;
  var lastUrl2;

// added optional lastUrl2 in case someone is looking for 'wainetam/settings' directly
  app.get('/login/:lastUrl/:lastUrl2?', function(req, res){ // lasturl from LoginController in needAuth.html
    res.redirect('/auth/github');
  });

  app.param('lastUrl', function(req, res, next, url){
    console.log('lastUrl', url)
    lastUrl = url;
    next();
  });

  app.param('lastUrl2', function(req, res, next, url){
    console.log('lastUrl2', url)
    lastUrl2 = url;
    next();
  });

  // user gets automatically redirect to this route along with accessToken
  // get JSON user object back, this will serialize and deserialize the user
  // also attaches user to req (req.user)
  app.get('/auth/github/callback',
    passport.authenticate('github', {failureRedirect: '/signin'}),
    function(req, res){
      var url = {lastUrl: lastUrl, lastUrl2: lastUrl2};
      lastUrl = ''
      lastUrl2 = ''
      users.authCallback(req, res, url);
    });

  app.get('/appointment', ensureLoggedIn('/signin'), appointments.appointmentsByUser);
  app.post('/appointment', ensureLoggedIn('/signin'), appointments.confirm);
  app.get('/appointment/initialize/:appointmentId', ensureLoggedIn('/signin'), appointments.initialize);
  app.get('/appointment/show/:appointmentId', ensureLoggedIn('/signin'), appointments.show);
  app.post('/appointment/create', ensureLoggedIn('/signin'), appointments.create);
  app.post('/appointment/edit', ensureLoggedIn('/signin'), appointments.edit);

  app.get('/appointments/:appointmentId', ensureLoggedIn('/signin'), appointments.toSession);
  // app.get('/appointments/:appointmentId', appointments.details);
  app.get('/appointments/confirm/:userName/:appointmentId/:option', ensureLoggedIn('/signin'), appointments.confirm);
  app.get('/appointments/reschedule/:userName/:appointmentId', ensureLoggedIn('/signin'), appointments.reschedule);
  app.get('/inbox', ensureLoggedIn('/signin'), messages.findAllChatroom);
  app.post('/inbox', ensureLoggedIn('/signin'), messages.createChatroom);
  app.get('/message', ensureLoggedIn('/signin'), messages.messageByChatroom);
  app.post('/message', ensureLoggedIn('/signin'), messages.createMessage);

  app.post('/updatePpm', ensureLoggedIn('/signin'), users.updatePpm);
  app.post('/submitEmail', ensureLoggedIn('/signin'), users.updateEmail);
  // app.post('/updateEmail', ensureLoggedIn('/signin'), users.updateEmail);

  app.get('/', index.render);

  app.get('/user', users.findAll);
  app.get('/user/:userName', users.profile);
  app.get('/user/:userName/:repoName', users.repoData);
  app.put('/user', users.edit);

  app.post('/query', index.results);
  app.post('/create/cc', ensureLoggedIn('/signin'), payments.createCard);
  app.post('/charge', ensureLoggedIn('/signin'), payments.transaction);

  app.post('/upload', ensureLoggedIn('/signin'), texteditor.upload);

  // app.get('/email', appointments.sendEmail);

  app.post('/create/ba', ensureLoggedIn('/signin'), payments.createBankAcct);

  app.get('/loggedin', users.clientSideAuth); // for client-side auth

  // app.post('/session/end', appointments.endSession);

  app.get('/signedin', function(req, res) {
    res.send(req.isAuthenticated() ? req.user : '0');
  });

  app.get('/signin', users.signin);
  app.get('/signup', users.signup);
  app.get('/signout', users.signout);

  app.get('/session', function(req, res) {
    res.render('session');
  });

};
