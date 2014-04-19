//Setting up route
window.app.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        // start state params ---
        $urlRouterProvider.otherwise('/');

        $stateProvider
        .state('signin', {
          url:'/signin',
          templateUrl: 'views/needAuth.html'
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
            loggedin: checkLoggedin,
            email: checkEmailExists
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
            loggedin: checkLoggedin,
            email: checkEmailExists
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
            templateUrl: 'views/booking.html',
            resolve: {
              loggedin: checkLoggedin,
              // card: checkBalancedCard,
              email: checkEmailExists
            }
          })
          .state('profile.requiredEmail', {
            url:'/emailrequired',
            templateUrl: 'views/needEmail.html'
          })
          .state('profile.settings', {
            url: '/settings',
            templateUrl: 'views/settings.html',
            resolve: {
              loggedin: checkLoggedin,
              permissions: checkPermissions
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

  // for client-side authentication
  function checkLoggedin($q, $timeout, $http, $location, $rootScope, redirectToUrlAfterLogin) {
    // Initialize a new promise
    var deferred = $q.defer();
    // Make an AJAX call to check if the user is logged in
    $http.get('/loggedin').success(function(response){
      // Authenticated
      if (response !== '0') { // req.user
        console.log(response);
        console.log('authenticated');
        $timeout(function() {
          deferred.resolve();
        }, 0);
      // Not Authenticated
      }
      else {
        console.log('not authenticated');
        // $rootScope.message = 'You need to log in.';
        if($location.path().toLowerCase() !== '/signin') {
            redirectToUrlAfterLogin.url = $location.path().slice(1);
            console.log(redirectToUrlAfterLogin.url);
          } else {
            redirectToUrlAfterLogin.url = '/';
          }
        $timeout(function() {
          deferred.reject();
        }, 0);
        $location.url('/signin');
      }
    });
    return deferred.promise;
  };
  // end

  function checkEmailExists($q, $timeout, $http, $location, $state, Global) {
    var deferred = $q.defer();
    console.log('in checkemailexists');
    var user = Global.user;
    console.log('global user email?', user.contactEmail);
    if(user.contactEmail) {
      console.log('resolved');
      $timeout(function() {
        deferred.resolve();
      },0);
    } else {
      console.log('No email submitted in profile');
      // console.log('redirect to settings of:', user.userName);
      $location.url("/" + user.userName + '/emailrequired');
      // $location.url("/" + user.userName + '/settings');
      // $state.go('profile.requiredEmail', {'userName': user.userName});
      $timeout(function() {
        deferred.reject();
      }, 0);
    }
    return deferred.promise;
  }

  function checkBalancedCard($q, $timeout, $http, $location, $state, Global) {
    var deferred = $q.defer();
    console.log('in checkbalancedcard');
    var user = Global.user;
    if(user.BalancedCard) {
      console.log('resolved');
      $timeout(function() {
        deferred.resolve();
      }, 0);
    } else {
      console.log('No balanced card in profile');
      console.log('redirect to settings of:', user.userName);
      $location.url("/" + user.userName + '/settings');
      // $state.go('profile.settings', {'userName': user.userName});
      $timeout(function() {
        deferred.reject();
      }, 0);
    }
    return deferred.promise;
  }

  function checkPermissions($q, $timeout, $http, $location, $state, $stateParams, Global) {
    var deferred = $q.defer();
    console.log('in checkPermissions');
    var user = Global.user;
    if($stateParams.userName === user.userName) {
      console.log('permissions legit');
      $timeout(function() {
        deferred.resolve();
      }, 0);
    } else {
      $timeout(function() {
        deferred.reject();
      }, 0);
    }
    return deferred.promise;
  }

  function checkBalancedBank($q, $timeout, $http, $location, $state, Global) {
    var deferred = $q.defer();
    console.log('in checkbalancedbank');
    var user = Global.user;
    if(user.BalancedBank) {
      console.log('resolved');
      deferred.resolve;
    } else {
      console.log('No balanced bank in profile');
      console.log('redirect to settings of:', user.userName);
      $location.url("/" + user.userName + '/settings');
      // $state.go('profile.settings', {'userName': user.userName});
      deferred.reject;
    }
    return deferred.promise;
  }

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
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];

  console.log('in interceptor func');
  $httpProvider.interceptors.push(function($q, $location) {
      return function(promise) {
        return promise.then(
          // Success: just return the response
          function(response){
            console.log('success in interceptor', response);
            return response;
          },
          // Error: check the error status to get only the 401
          function(response) {
            console.log('401 in interceptor', response);
            if (response.status === 401) {
              $location.url('/signin');
            }
            return $q.reject(response);
          }
        );
      };
  });
}]);

