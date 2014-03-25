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
        .state('profile', {
          url: '/:userName',
          templateUrl: 'views/profile.html'
        })
    }
]);

//Setting HTML5 Location Mode
window.app.config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.hashPrefix("!");
    }
]);
