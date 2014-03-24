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

authenticate();

// ** User information

var User = function(username) {
    this.user = username;
    this.per_page = 50;
    this.q = username;
};

// var user = new User('visionmedia');

// github.user.getFollowers(user, function(err, followers) { // need to get followers
//     if(err) { console.log(err); }

//     console.log('USER follower data ', followers);
// });

// github.repos.getFromUser(user, function(err, repoData) { // get # of repos
//     if(err) { console.log(err); }

//     console.log('USER REPO data ', repoData);
// });

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
    console.log('IN USER STATS');
    var searchObj = { url: 'https://api.github.com/users/' + username, headers: { 'User-Agent': 'wainetam' }, auth: { 'type': 'basic', 'username': 'wainetam', 'password': 'wainetam14'} };
    request(searchObj, function(err, response, userData) {
        console.log('IN USER STATS post REQUEST ', userData.email);
        if(err && response.statusCode !== 200) {
            console.log('Request error.');
            deferred.reject(err);
        }
        userData = JSON.parse(userData);
        console.log('SOLE USER ', userData);
        console.log('USER EMAIL ', userData.email);
        console.log('USER BLOG ', userData.blog);
        console.log('USER FOLLOWER COUNT ', userData.followers);
        console.log('USER REPO COUNT ', userData.public_repos);
        console.log('USER GIST COUNT ', userData.public_gists);
        var userObj = {
            email: userData.email || '',
            blog: userData.blog,
            followers: userData.followers,
            repos: userData.public_repos,
            gists: userData.public_gists
        };
        deferred.resolve(userObj);
    });
    return deferred.promise;
};

// userStats('visionmedia');

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
    console.log('total contributions of top 100 ', totalContributions);

    contributorsArr.forEach(function(user) {
        if(user.contributions/totalContributions > threshold/100 )
        topContributors.push(user);
    });
    console.log('len of topContribs', topContributors.length);
    return topContributors;
};

var findOtherTop = function(contributorsArr, thresholdObj) { // threshold: {followers: 500, repos: 100, gists: 100}

    async.map(contributorsArr, function(user, callback) {
        console.log('IN MAP USER ', user);
        console.log('IN MAP USER LOGIN ', user.login);
        exports.userStats(user.login).then(function(userObj) {
            console.log('IN MAP ', userObj);
            callback(null, userObj);
        });
    }, function(err, userObjArr) {
        console.log('IN FINDOTHERTOP ', userObjArr);
        var otherTop = [];
        userObjArr.forEach(function(user) {
            if(user.followers > thresholdObj.followers || user.repos > thresholdObj.repos || user.gists > thresholdObj.gists ) {
                otherTop.push(user);
            }
        });
        console.log('OTHERTOP RESULTS', otherTop);
    });
};

// ** Repo info

var Repo = function(author, repo) {
    this.user = author; // author
    this.repo = repo;
    this.page = 1; // optional; page number of results to fetch
    this.per_page = 100; // optional; 30 is default
};
//
// var repo = new Repo('twbs', 'bootstrap'); // user, repo name

exports.getContributors = function(author, repo) {
    var repo = new Repo(author, repo);

    github.repos.getContributors(repo, function(err, users) {
        if(err) { console.log(err); }
        // console.log('twbs contributors ', data[50]);

        var coreTeam = topContributors(users, 1);
        console.log('CORE ', coreTeam); // of top 100 users, returns those w/ at least 1% of the total contribs of top 100

        var otherTop = findOtherTop(users, {followers: 500, repos: 100, gists: 100});
        console.log('OTHERTOP ', otherTop);
    });
};

var Query = function(query) {
    this.q = query;
    // ,
    // 'sort': , optional
    // 'order': optional
};

exports.query = function(queryString) {
    var deferred = Q.defer();
    var query = new Query(queryString); // search string

    github.search.repos(query, function(err, data) { // repos
        if(err) {
            console.log(err);
            deferred.reject(err);
        }
        console.log('query output ', data);
        deferred.resolve(data);
    });
    return deferred.promise;
};

exports.extractUserAndRepo = function(partialUrl) { // wainetam/myRepo
    var user = partialUrl.match(/(.+)\/.+/)[0];
    var repo = partialUrl.match(/.+\/(.+)/)[0];
    return {
        user: user,
        repo: repo
    };
};

// github.repos.getContributors(repo, function(err, data) {
//     if(err) { console.log(err); }
//     console.log('twbs contributors ', data);
// });
