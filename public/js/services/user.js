angular.module('githelp.services.user', []).factory('User', ['$resource',
    function($resource) {
        return $resource('user/:userName',
        {
          userName: '@userName'
        }, {
          update: {
            method: 'PUT'
          }
        });
    }
]);

