angular.module('githelp.controllers.appointment', [])
  .controller('AppointmentController', ['$scope', '$state', 'Global', '$http',
    function ($scope, $state, Global, $http) {
      $scope.global = Global;
      editor.on('change', function(e) {
        alert('change');
      });
      $scope.form = {
        queryInput: ""
      }

      $scope.query = function() {
        if($scope.form.queryInput) {
          console.log($scope.form);
          $http.post('/query', $scope.form).success(function(response) {
            // $location.path('/');
            console.log('RESULTS ',response);
            $scope.githubResults = response.githubResults;
            $scope.githelpResults = response.githelpResults;
            $state.go('main.search')
          });
        }
      };

      $scope.userProfile = function(username){

        $location.path('/'+username)
      }
    }
]);
