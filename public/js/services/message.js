angular.module('githelp.services.messages', []).
  factory('Message', ['$resource', function($resource){
      return $resource('/message/:messageId',
      {
        messageId: '@_id'
      }, {
          update: {
            method: "PUT"
          }
        });
      }
  ]);