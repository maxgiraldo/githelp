angular.module('githelp.services.inboxes', [])
  .factory('Inbox', ['$resource', function($resource){
      return $resource('inbox/:inboxId',{
        inoxId: '@_id'
      }, {
          update: {
            method: 'PUT'
          }
        })
      }
    ]);
