angular.module('githelp.controllers.messages', [])
  .controller('MessageController', [
    '$scope',
    '$location',
    '$state',
    '$stateParams',
    'Global',
    'Message',
    'Socks',
    function($scope, $location, $state, $stateParams, Global, Message, Socks){

      var inboxSock = function(sockType, id){
        Socks.call(this, sockType, id);
      };
      inboxSock.prototype = Object.create(Socks.prototype);

      inboxSock.prototype.event_message = function(messageData){
        console.log("we are in the message event");
        $scope.currentChatroomId = $stateParams.inboxId;
        if($scope.messagesByChatroom[$stateParams.inboxId] instanceof Array){
          $scope.messagesByChatroom[$stateParams.inboxId].push(messageData);
        } else{
          $scope.messagesByChatroom[$stateParams.inboxId] = [messageData];
        }
        $scope.$apply();
      };

      var inboxBot = new inboxSock('inbox', $stateParams.inboxId);
      inboxBot.init();

      $scope.global = Global;
      // var sock = new SockJS('/echo');

      $scope.messagesByUser = {};
      $scope.messagesByChatroom = {};
      $scope.membersByChatroom = {};

      $scope.createMessage = function(){
        var newMessage = new Message({
          content: this.content,
          chatroomId: $stateParams.inboxId
          // somehow find the chatroomId
        });
        this.content = '';

        newMessage.$save(function(message){
          // sock.send(JSON.stringify(message));
          console.log("sending message now");
          inboxBot.sockjs_send('message', message);
        })
      };


      // need to create an inheritance chain for inboxes
      // define function that inboxes need
      // should only have one connection for inboxes
      // no need to create several for one user each time he clicks through

      // sock.onopen = function() {
      //   console.log('open');
      // };

      // sock.onmessage = function(e) {
      //   $scope.currentChatroomId = $stateParams.inboxId;
      //   if($scope.messagesByChatroom[$stateParams.inboxId] instanceof Array){
      //     $scope.messagesByChatroom[$stateParams.inboxId].push(JSON.parse(e.data));
      //   } else{
      //     $scope.messagesByChatroom[$stateParams.inboxId] = [JSON.parse(e.data)];
      //   }
      //   $scope.$apply();
      // };

      // sock.onclose = function() {
      //   console.log('sockjs close');
      // };

      $scope.findMessages = function(){
        Message.get({
          chatroomId: $stateParams.inboxId
          // this shouldn't be stateParams
        },
          function(chatroom){
            console.log('we in the find messages');
            $scope.currentChatroomId = $stateParams.inboxId;
            // messages and members populated
            $scope.chatroom = chatroom;
            console.log(chatroom);
            $scope.membersByChatroom[$stateParams.inboxId] = chatroom.members;
            $scope.messagesByChatroom[$stateParams.inboxId] = chatroom.messages;
            console.log('hello');
            console.log($scope.membersByChatroom[$stateParams.inboxId]);
        })
      };
    }
  ])