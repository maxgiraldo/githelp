angular.module('githelp.controllers.user', [])
  .controller('UserController', ['$scope', '$stateParams', 'Global', 'User',
    function ($scope, $stateParams, Global, User) {
    $scope.global = Global;

    $scope.findOne = function(){
      User.get({
        userName: $stateParams.userName
        // look for the github.login and then get the githubId sequence
      }, function(response){
        $scope.repoList = response.repoList;

        $scope.user = response.user;
        $scope.conList = response.conList;
      })
    }
    $scope.repoName = function(url){
      console.log(url)
      return url.replace(/\/.*\//, "");
    }
  }
]);


//   for userStats, you can call search.userStats(username)
// returns a userObj


// var userObj = {
//       email: userData.email || '',
//       blog: userData.blog,
//       followers: userData.followers,
//       repos: userData.public_repos,
//       gists: userData.public_gists
//     };