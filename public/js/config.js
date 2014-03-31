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
        .state('appointments', {
          url: '/appointments',
          templateUrl: 'views/appointments.html'
        })
        .state('session', {
          url: '/session/:sessionId',
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
          .state('profile.booking', {
            url: '/booking',
            templateUrl: 'views/booking.html'
          })
          .state('profile.settings', {
            url: '/settings',
            templateUrl: 'views/settings.html'
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
