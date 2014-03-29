//Setting up route
window.app.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');

        $stateProvider
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
        .state('booking', {
          url: '/:merchantName/booking',
          templateUrl: 'views/booking.html'
        })
        .state('session', {
          url: '/session/sessionId',
          templateUrl: 'views/session.html'
        })
        .state('inbox', {
          url: '/inbox',
          templateUrl: 'views/inbox.html'
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
          .state('profile.repo', {
          url: '/:repoName',
          templateUrl: 'views/profile.repos.html'
        });

    }
]);

//Setting HTML5 Location Mode
window.app.config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.hashPrefix("!");
    }
]);
