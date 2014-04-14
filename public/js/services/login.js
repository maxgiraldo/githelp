angular.module('githelp.services.login', []).
  factory('Login', ['$resource', function($resource){
      return $resource('/login/:lastUrl',
      {
        lastUrl: '@lastUrl'
      }, {
          update: {
            method: "PUT"
          }
        });
      }
  ]);
