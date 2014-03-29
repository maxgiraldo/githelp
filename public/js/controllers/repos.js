angular.module('githelp.controllers.repos', [])
  .controller('ReposController', ['$scope', '$state', '$http', '$stateParams', 'Global', 'User', 'Inbox',
    function ($scope, $state, $http, $stateParams, Global, User, Inbox) {
    $scope.global = Global;
    // alert('public repos loaded');
    $scope.userName = $stateParams.userName;
    $scope.repoName = $stateParams.repoName;
    console.log('REPO name', $scope.repoName);

    $scope.getContribs = function() {
      $http.get('/user/' + $scope.userName + '/' + $scope.repoName).success(function(response) {
        console.log('RESP', response);
        $scope.coreTeam = response.coreTeam;
        $scope.otherTop = response.otherTop;
      });
    };
  }
]);
