angular.module('githelp.controllers.user', [])
  .controller('UserController', ['$scope', '$state', '$http', '$stateParams', 'Global', 'User', 'Chatroom',
    function ($scope, $state, $http, $stateParams, Global, User, Chatroom) {
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
        $scope.chatrooms = response.user.chatrooms;
      })
      // make this aynchronous
    }

    $scope.findAllChatroom = function(){
      Chatroom.query(function(response){
        $scope.chatrooms = response.chatrooms;
      })
    };

    $scope.findAllUsers = function(){
      User.query(function(response){
        $scope.users = response.users;
      })
    };

    $scope.createChatroom = function(){
      var newChatroom = new Chatroom({
        members: this.members
      });
      newChatroom.$save(function(chatroom){
        $state.go('inbox.individual', {'chatroomId': chatroom._id});
        // figure how to go to specific chatroomId
      })
    };
    // real time make chatrooms populate on the side in real time
    // when we inject a child state, that tempalte will
    // have data-ng-controller="MessageController"
    // which will do data-ng-init="findMessages(the id of the state)"

    $scope.toChatroom = function(chatroomId){
      $state.go(chatroom.individual);
      // figure how to go to specific chatroomId
    };

    $scope.repoName = function(url){
      console.log(url);
      return url.replace(/\/.*\//, "");
    };

    $scope.findInbox = function(){
      $http({method: 'GET', url: '/user'}).
        success(function(data){
          var response = JSON.parse(data[0]);
          $scope.allUsers = response.allUsers
          $scope.userChatrooms = response.chatrooms
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