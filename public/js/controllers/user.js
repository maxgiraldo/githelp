angular.module('githelp.controllers.user', [])
  .controller('UserController', ['$scope', '$state', '$http', '$stateParams', 'Global', 'User', 'Inbox',
    function ($scope, $state, $http, $stateParams, Global, User, Inbox) {
    $scope.global = Global;

    $scope.members = [];

    $scope.findOne = function(){
      User.get({
        userName: $stateParams.userName
        // look for the github.login and then get the githubId sequence
      }, function(response){
        $scope.repoList = response.repoList;

        $scope.user = response.user;
        $scope.conList = response.conList;
      })
      // make this aynchronous
    }

    // $scope.findAllInboxes = function(){
    //   Inbox.query(function(response){
    //     $scope.inboxes = response.inboxes;
    //   })
    // };

    // $scope.findAllUsers = function(){
    //   User.query(function(response){
    //     $scope.users = response.users;
    //   })
    // };

    $scope.createInbox = function(){
      var newInbox = new Inbox({
        members: this.members
      });
      newInbox.$save(function(inbox){
        $state.go('inbox.individual', {'inboxId': inbox._id});
        // figure how to go to specific inboxId
      })
    };
    // real time make inboxes populate on the side in real time
    // when we inject a child state, that tempalte will
    // have data-ng-controller="MessageController"
    // which will do data-ng-init="findMessages(the id of the state)"

    // $scope.toInbox = function(inboxId){
    //   $state.go('inbox.individual', {'inboxId': inboxId});
    //   // figure how to go to specific inboxId
    // };

    $scope.repoName = function(url){
      console.log(url);
      return url.replace(/\/.*\//, "");
    };

    $scope.findInbox = function(){
      $http({method: 'GET', url: '/user'}).
        success(function(data){
          var response = JSON.parse(data[0]);
          $scope.allUsers = response.allUsers
          $scope.userInboxes = response.inboxes
        })
    };
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