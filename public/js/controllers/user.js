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
        $scope.chatrooms = response.user.chatrooms;
      })
      // make this aynchronous
    }

    $scope.createChatroom = function(){
      var member = $scope.members.push($scope.global.user.userName);
      var newChatroom = new Chatroom({
        members: $scope.members,
        title: $scope.members.join(", ")
      })
      newChatroom.$save(function(chatroom){
        $state.go(chatroom.individual);
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
      console.log(url)
      return url.replace(/\/.*\//, "");
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