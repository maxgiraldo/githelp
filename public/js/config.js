//Setting up route
window.app.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        // for client-side authentication
        var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){
          // Initialize a new promise
          var deferred = $q.defer();
          // Make an AJAX call to check if the user is logged in
          $http.get('/loggedin').success(function(user){
            // Authenticated
            if (user !== '0')
              $timeout(deferred.resolve, 0);
            // Not Authenticated
            else {
              $rootScope.message = 'You need to log in.';
              $timeout(function() {
                deferred.reject();
              }, 0);
              $location.url('/signin');
            }
          });
          return deferred.promise;
        };
        // end

        // start state params ---
        $urlRouterProvider.otherwise('/');

        $stateProvider
        .state('signin', {
          url:'/signin',
          templateUrl: 'views/signin.html'
        })
        .state('main', {
          url:'/',
          templateUrl: 'views/index.html'
        })
          .state('main.search', {
            views: {
              'search':{
                templateUrl: 'views/search.html'
              }
            }
          })
        .state('appointments', {
          url: '/appointments',
          templateUrl: 'views/appointments.html',
          resolve: {
            loggedin: checkLoggedin
          }
        })
          .state('appointments.reschedule', {
            url: '/:sessionId/reschedule',
            templateUrl: 'views/reschedule.html',
            resolve: {
              loggedin: checkLoggedin
            }
          })
          .state('appointments.confirmation', {
            url: '/:sessionId/confirmation',
            templateUrl: 'views/confirmation.html'
          })
        .state('session', {
          url: '/session/:sessionId',
          templateUrl: 'views/session.html'
        })
        .state('inbox', {
          url: '/inbox',
          templateUrl: 'views/inbox.html',
          resolve: {
            loggedin: checkLoggedin
          }
        })
          .state('inbox.individual', {
            url: '/:inboxId',
            templateUrl: 'views/partials/chatwindow.html'
            // chatroomId will be available in stateparams
          })
        .state('profile', {
          url: '/:userName',
          templateUrl: 'views/profile.html'
        })
          .state('profile.booking', {
            url: '/booking',
            templateUrl: 'views/booking.html'
          })
          .state('profile.settings', {
            url: '/settings',
            templateUrl: 'views/settings.html',
            resolve: {
              loggedin: checkLoggedin
            }
          })
          .state('profile.repo', {
            url: '/repos/:repoName',
            templateUrl: 'views/profile.repos.html'
          })
          .state('profile.confirm', {
            url: '/confirm/:sessionId',
            templateUrl: 'views/confirm.html'
          });
    }
]);

//Setting HTML5 Location Mode
window.app.config(['$locationProvider', 'datepickerConfig', 'datepickerPopupConfig',
    function($locationProvider, datepickerConfig, datepickerPopupConfig) {
        $locationProvider.hashPrefix("!");
        datepickerConfig.showWeeks = false;
        datepickerPopupConfig.showButtonBar = false;
    }
]);

// Add an interceptor for AJAX errors
window.app.config(['$httpProvider', function($httpProvider) {
  $httpProvider.interceptors.push(function($q, $location) {
      return function(promise) {
        return promise.then(
          // Success: just return the response
          function(response){
            console.log(response);
            return response;
          },
          // Error: check the error status to get only the 401
          function(response) {
            console.log(response);
            if (response.status === 401) {
              $location.url('/signin');
            }
            return $q.reject(response);
          }
        );
      };
  });
}]);

