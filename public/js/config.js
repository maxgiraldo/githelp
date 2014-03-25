//Setting up route
window.app.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');

        $stateProvider
        .state('main', {
            url:'/',
            templateUrl: 'views/index.html'
        })
        .state('profile', {
          url: '/:userName',
          templateUrl: 'views/profile.html'
        })
        .state('session', {
          url: '/session',
          templateUrl: 'views/session.html'
        });
    }
]);

//Setting HTML5 Location Mode
window.app.config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.hashPrefix("!");
    }
]);
