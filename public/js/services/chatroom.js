angular.module('githelp.services.chatrooms', [])
  .factory('Chatroom', ['$resource', function($resource){
      return $resource('chatroom/:chatroomId',{
        chatroomId: '@_id'
      }, {
          update: {
            method: 'PUT'
          }
        })
      }
    ]);
