var GitHubApi = require('github'),
  _ = require('underscore'),
  async = require('async'),
  Q = require('q'),
  request = require('request');

var github = new GitHubApi({
  // required
  version: '3.0.0',
  // optional
  // debug: true,
  // protocol: 'https',
  // host: 'github.my-GHE-enabled-company.com',
  // pathPrefix: '/api/v3', // for some GHEs
  // timeout: 5000
});

// ** Auth (basic)

var authenticate = function() {
  github.authenticate({
    type: 'oauth',
    token: 'b7eeb22a78df8209f95c24c3448c6fcbce9e636c' // personal token
  });
};

var oAuth = {
  type: 'oauth',
  token: 'b7eeb22a78df8209f95c24c3448c6fcbce9e636c' // personal token
}
var basicAuth = {
  type: 'basic',
  username: 'wainetam',
  password: 'wainetam14'
}

authenticate();

// ** User information

var User = function(username) {
  this.user = username;
  this.per_page = 50;
  this.q = username;
};



// github.user.getFollowers(user, function(err, followers) { // need to get followers
//     if(err) { console.log(err); }

//     console.log('USER follower data ', followers);
// });

var getUserRepos = function(username) {
  var deferred = Q.defer();
  var user = new User(username);

  github.repos.getFromUser(user, function(err, repoData) { // get # of repos
    if(err) {
      console.log(err);
      deferred.reject(err);
    }

    userRepos = [];
    repoData.forEach(function(repo) {
      var repoObj = {
        name: repo.name,
        stars: repo.stargazers_count // stars
      };
      userRepos.push(repoObj);
    });
    console.log('USER REPOS ', userRepos);

    var sortedUserRepos = _.sortBy(userRepos, function(repo) { return repo.watchers; });
    console.log('SORTED USER REPOS ', sortedUserRepos.reverse());

    deferred.resolve(sortedUserRepos.reverse());
    // console.log('USER REPO DHH data ', repoData);
  });
  return deferred.promise;
};

// getUserRepos('dhh');

// github.events.getFromUser(user, function(err, eventData) { // get activity
//     if(err) { console.log(err); }

//     console.log('USER EVENT data ', eventData);
// });

// github.search.users(user, function(err, data) {
//     if(err) { console.log(err); }

//     console.log('USER SEARCH data ', data);
// });


exports.userStats = function(username) {
  var deferred = Q.defer();
  // console.log('IN USER STATS');
  var searchObj = { url: 'https://api.github.com/users/' + username + '/repos', headers: { 'User-Agent': 'wainetam' }, auth: basicAuth };
  request(searchObj, function(err, response, repoList) {
    if(err && response.statusCode !== 200) {
      console.log('Request error.');
      deferred.reject(err);
    }
    repoList = JSON.parse(repoList);

    deferred.resolve(repoList);
  });
  return deferred.promise;
};

// github.user.get(user, function(err, data) {
//     if(err) { console.log(err); }

//     request.

//     console.log('SOLE USER data ', data);
// });




// ** Contributors filter

var topContributors = function(contributorsArr, threshold) { //threshold in percent of total contributions to repo (i.e., 5)
  var totalContributions = 0; // of top 100 (param determined in repo query)
  var topContributors = [];
  contributorsArr.forEach(function(user) {
    totalContributions = totalContributions + user.contributions;
  });
  // console.log('total contributions of top 100 ', totalContributions);

  contributorsArr.forEach(function(user) {
    if(user.contributions/totalContributions > threshold/100 )
    topContributors.push(user);
  });
  // console.log('len of topContribs', topContributors.length);
  return topContributors;
};

var findOtherTop = function(contributorsArr, thresholdObj) { // threshold: {followers: 500, repos: 100, gists: 100}
  var deferred = Q.defer();
  async.map(contributorsArr, function(user, callback) {
    // console.log('IN MAP USER ', user);
    // console.log('IN MAP USER LOGIN ', user.login);
    exports.userStats(user.login).then(function(userObj) {
      // console.log('IN MAP ', userObj);
      callback(null, userObj);
    });
  }, function(err, userObjArr) {
    if(err) { deferred.reject(err); }
    // console.log('IN FINDOTHERTOP ', userObjArr);
    var otherTop = [];
    userObjArr.forEach(function(user) {
      if(user.followers > thresholdObj.followers || user.repos > thresholdObj.repos || user.gists > thresholdObj.gists ) {
        otherTop.push(user);
      }
    });
    // console.log('OTHERTOP RESULTS', otherTop);
    deferred.resolve(otherTop);
  });
  return deferred.promise;
};

// ** Repo info

exports.processRepoUrl = function(repoUrl) { // github.com/wainetam/myRepo
  var user = repoUrl.match(/github.com\/(.+)\/.+/)[1];
  var repo = repoUrl.match(/github.com\/.+\/(.+)/)[1];
  return {
    user: user,
    repo: repo
  };
};

exports.processUserUrl = function(userUrl) { // github.com/wainetam
  var user = userUrl.match(/github.com\/(.+)/)[1];
  return {
    user: user
  };
};

var Repo = function(author, repo) {
  this.user = author; // author
  this.repo = repo;
  this.page = 1; // optional; page number of results to fetch
  this.per_page = 100; // optional; 30 is default
};
//
// var repo = new Repo('twbs', 'bootstrap'); // user, repo name


exports.repoStats = function(repoUrl) {  // rails/rails
  var deferred = Q.defer();

  var obj = exports.processRepoUrl(repoUrl);

  github.repos.get(obj, function(err, data) {
    if(err) {
      console.log(err);
      deferred.reject(err);
    }

    var repoObj = {
      watchers: data.subscribers_count, // watchers
      stars: data.stargazers_count, // stars
      url: data.html_url,
      description: data.description,
      owner: data.owner.login,
      forks: data.forks
    };

    // console.log('SOLE REPO OBJ ', repoObj);

    deferred.resolve(repoObj);
  });
  return deferred.promise;
};

// repoStats('https://www.github.com/rails/rails');

exports.getContributors = function(author, repo) { // author, repo
  var deferred = Q.defer();
  var repoQ = new Repo(author, repo);
  console.log('repoObj', repoQ);

  github.repos.getContributors(repoQ, function(err, users) {
    if(err) { console.log(err); }
    // console.log('twbs contributors ', data[50]);
    console.log('USERS ', users);
    var coreTeam = topContributors(users, 1);
    // console.log('CORE ', coreTeam); // of top 100 users, returns those w/ at least 1% of the total contribs of top 100

    var otherTop = findOtherTop(users, {followers: 500, repos: 100, gists: 100});
    findOtherTop(users, {followers: 500, repos: 100, gists: 100}).then(function(otherTop) {
      // console.log('OTHERTOP ', otherTop);
      var contributorsObj = {
        coreTeam: coreTeam,
        otherTop: otherTop
      };
      // console.log('CONTRIBUTORS OBJ', contributorsObj);
      deferred.resolve(contributorsObj);
    });
  });
  return deferred.promise;
};

// exports.getContributors('wainetam', 'githelp');

var Query = function(query) {
  this.q = query;
  // ,
  // 'sort': , optional
  // 'order': optional
};

// exports.query = function(queryString, repoBoolean, userBoolean) { // repo and userBool are optional params and can't be both true
//   var deferred = Q.defer();
//   var query = new Query(queryString); // search string

//   // returns general query
//   github.search.repos(query, function(err, data) { // repos
//     if(err) {
//       console.log(err);
//       deferred.reject(err);
//     }
//     console.log('query output ', data);

//     var urlObj = exports.processRepoUrl('http://github.com/rails/rails'); // dummy variable for now
//     console.log('URLOBJ', urlObj);

//     // if specific repo query

//     if(repoBoolean) {
//       getContributors(urlObj.user, urlObj.repo).then(function(contributorsObj) {
//         deferred.resolve(contributorsObj);
//       });
//     }
//     // if specific user query

//     else if(userBoolean) {
//       exports.userStats(urlObj.user).then(function(userObj) {
//         deferred.resolve(userObj);
//       });
//     }

//     else {
//       deferred.resolve(data);
//     }
//   });
//   return deferred.promise;
// };

exports.query = function(queryString) { // repo and userBool are optional params and can't be both true
  var deferred = Q.defer();
  var query = new Query(queryString); // search string

  // returns general query
  github.search.repos(query, function(err, repoData) { // repos
    if(err) {
      console.log(err);
      deferred.reject(err);
    }
    // console.log('repo query output ', repoData);

    var repoList = repoData.items.map(function(repo) {
      return {
        full_name: repo.full_name,
        html_url: repo.html_url
      };
    });

    github.search.users(query, function(err, userData) { // repos
      if(err) {
        console.log(err);
        deferred.reject(err);
      }
      // console.log('user query output ', userData);

      var userList = userData.items.map(function(user) {
        return {
          login: user.login,
          html_url: user.html_url
        };
      });

      var data = {
        repoData: repoData.items,  // could also be repoList
        userData: userData.items   // could also be userList
      };

      // console.log('QUERY OBJ', data);

      deferred.resolve(data);
    });
  });
  return deferred.promise;
};


// exports.query('TJ Holowaychuk');




