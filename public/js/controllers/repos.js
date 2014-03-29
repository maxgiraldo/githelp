angular.module('githelp.controllers.repos', [])
  .controller('ReposController', ['$scope', '$state', '$http', '$stateParams', 'Global', 'User', 'Inbox',
    function ($scope, $state, $http, $stateParams, Global, User, Inbox) {
    $scope.global = Global;
    $scope.userName = $stateParams.userName;
    $scope.repoName = $stateParams.repoName;
    }
]);
