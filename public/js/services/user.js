angular.module('githelp.services.user', []).factory('User', ['$resource',
    function($resource) {
        return $resource('user/:userId',
        {
          userId: '@_id'
        }, {
          update: {
            method: 'PUT'
          }
        });
    }
]);

