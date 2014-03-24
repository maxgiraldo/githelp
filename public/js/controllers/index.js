angular.module('githelp.controllers.index', [])
  .controller('IndexController', ['$scope', 'Global', '$http',
    function ($scope, Global, $http) {
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

          });
        }
      };
  }
]);
