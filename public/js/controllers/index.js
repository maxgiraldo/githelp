angular.module('githelp.controllers.index', [])
  .controller('IndexController', ['$scope', '$state', 'Global', '$http',
    function ($scope, $state, Global, $http) {
      $scope.global = Global;

      $scope.form = {
        queryInput: ""
      };

      $scope.cc = {
        name: "",
        number: "",
        expiration_month: "",
        expiration_year: "",
        cvv: ""
      };

      $scope.ba = {
        name: "",
        routing_number: "",
        account_type: "",
        account_number: ""
      };

      $scope.createCard = function() {
        $http.post('/create/cc', $scope.cc).success(function(response) {
          console.log('CREATE CARD SUCCESS', response);
          $scope.ccComplete = response;
        });
      };


      $scope.createBankAcct = function() {
        $http.post('/create/ba', $scope.ba).success(function(response) {
          console.log('CREATE BANK SUCCESS', response);
          $scope.baComplete = response;
        });
      };

      $scope.query = function() {
        if($scope.form.queryInput) {
          console.log($scope.form);
          $http.post('/query', $scope.form).success(function(response) {
            // $location.path('/');
            console.log('RESULTS ',response);
            $scope.userResults = response.userResults;
            $scope.repoResults = response.repoResults;
            // $scope.githubResults = response.githubResults;
            // $scope.githelpResults = response.githelpResults;
            $state.go('main.search');
          });
        }
      };

      $scope.userProfile = function(username){

        $location.path('/'+username);
      };

      $scope.appt = {
        duration: "15",
        dt: "",
        time: ""
      };

      $scope.createAppointment = function() {
        $http.post('/create/appointment', $scope.appt).success(function(response) {
          $scope.apptComplete = response;
          console.log('BOOKING', response);
          console.log($scope.appt.time);
        });
      };
    }

])
  .controller('TimepickerCtrl', ['$scope', '$state', 'Global',
    function($scope, $state, Global) {
      $scope.appt.time = new Date();
      $scope.hstep = 1;
      $scope.mstep = 30;

      $scope.ismeridian = true;
    }

])

  .config(function (datepickerConfig, datepickerPopupConfig) {
    datepickerConfig.showWeeks = false;
    datepickerPopupConfig.showButtonBar = false;
  }).controller('DatepickerCtrl', ['$scope', '$state', 'Global',
    function($scope, $state, Global) {
      $scope.today = function() {
        $scope.appt.dt = new Date();
      };

      $scope.today();

      // Disable weekend selection
      $scope.disabled = function(date, mode) {
        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
      };

      $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = true;
      };

      $scope.dateOptions = {
        'year-format': "'yy'",
        'starting-day': 1
      };

      $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'shortDate'];
      $scope.format = $scope.formats[2];
    }
]);













