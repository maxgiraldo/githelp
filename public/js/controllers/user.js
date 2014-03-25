angular.module('githelp.controllers.user', [])
  .controller('UserController', ['$scope', 'Global', 'User',
    function ($scope, Global) {
    $scope.global = Global;


    $scope.find = function(){
      User.get({
        userName: $stateParams.username
        // look for the github.login and then get the githubId sequence
      }, function(user){
        console.log(user)
      })
    }
  }
]);
