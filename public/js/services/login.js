angular.module('githelp.services.login', []).
  factory('Login', ['$resource', function($resource){
      return $resource('/login/:lastUrl/:lastUrl2',
      {
        lastUrl: '@lastUrl',
        lastUrl2: '@lastUrl2'
      }, {
          update: {
            method: "PUT"
          }
        });
      }
  ]);
