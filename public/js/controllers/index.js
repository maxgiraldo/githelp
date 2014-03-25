angular.module('githelp.controllers.index', [])
  .controller('IndexController', ['$scope', '$state', 'Global', '$http',
    function ($scope, $state, Global, $http) {
      $scope.global = Global;

      $scope.form = {
        queryInput: ""
      }

      $scope.query = function() {
        if($scope.form.queryInput) {
          console.log($scope.form);
            $http.post('/query', $scope.form).success(function(results) {
            // $location.path('/');
            console.log('RESULTS ',results);
            $scope.results = results;
            $state.go('main.search')
          });
        }
      };
  }
]);
