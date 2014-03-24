var GitHubApi = require('github'),
    _ = require('underscore'),
    async = require('async'),
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

github.authenticate({
    type: 'basic',
    username: 'wainetam',
    password: 'wainetam14'
});

// ** User information

var User = function(username) {
    this.user = username;
    this.per_page = 50;
    this.q = username;
};

var user = new User('visionmedia');

github.user.getFollowers(user, function(err, followers) { // need to get followers
    if(err) { console.log(err); }

    console.log('USER follower data ', followers);
});

// github.repos.getFromUser(user, function(err, repoData) { // get # of repos
//     if(err) { console.log(err); }

//     console.log('USER REPO data ', repoData);
// });

// github.events.getFromUser(user, function(err, eventData) { // get activity
//     if(err) { console.log(err); }

//     console.log('USER EVENT data ', eventData);
// });

github.search.users(user, function(err, data) {
    if(err) { console.log(err); }

    console.log('USER SEARCH data ', data);
});


var userStats = function(username) {
    github.authenticate({
        type: 'basic',
        username: 'wainetam',
        password: 'wainetam14'
    });
    var searchObj = { url: 'https://api.github.com/users/' + username, headers: { 'User-Agent': 'wainetam' }};
    request(searchObj, function(err, response, userData) {
        if(err && response.statusCode !== 200) {
            console.log('Request error.');
        }
        userData = JSON.parse(userData);
        console.log('SOLE USER ', userData);
        console.log('USER EMAIL ', userData.email);
        console.log('USER BLOG ', userData.blog);
        console.log('USER FOLLOWER COUNT ', userData.followers);
        console.log('USER REPO COUNT ', userData.public_repos);
        console.log('USER GIST COUNT ', userData.public_gists);
        return {
            email: userData.email,
            blog: userData.blog,
            followers: userData.followers,
            repos: userData.public_repos,
            gists: userData.public_gists
        };
    });
};

userStats('visionmedia');

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
    var userStatsArr = contributorsArr.map(function(user) {
        console.log('IN MAP USER ', user);
        var result = userStats(user.login);
        console.log('IN MAP ', result);
        // return userStats(user.login);
        return result;
    });
    console.log('IN FINDOTHERTOP ', userStatsArr);
    // var otherTop = [];
    // userStatsArr.forEach(function(user) {
    //     if(user.followers > thresholdObj.followers || user.repos > thresholdObj.repos || user.gists > thresholdObj.gists ) {
    //         otherTop.push(user);
    //     }
    // });
    // return otherTop;
};

// ** Repo info

var Repo = function(author, repo) {
    this.user = author; // author
    this.repo = repo;
    this.page = 1; // optional; page number of results to fetch
    this.per_page = 100; // optional; 30 is default
};

var repo = new Repo('twbs', 'bootstrap'); // user, repo name

github.repos.getContributors(repo, function(err, users) {
    if(err) { console.log(err); }
    // console.log('twbs contributors ', data[50]);

    var coreTeam = topContributors(users, 1);
    console.log('CORE ', coreTeam); // of top 100 users, returns those w/ at least 1% of the total contribs of top 100

    var otherTop = findOtherTop(users, {followers: 500, repos: 100, gists: 100});
    console.log('OTHERTOP ', otherTop);

});

var Query = function(query) {
    this.q = query;
    // ,
    // 'sort': , optional
    // 'order': optional
};

var query = new Query('twitter'); // search string

// github.search.repos(query, function(err, data) { // repos
//     if(err) { console.log(err); }
//     console.log('twitter repo query ', data);
// });

// github.repos.getContributors(repo, function(err, data) {
//     if(err) { console.log(err); }
//     console.log('twbs contributors ', data);
// });
