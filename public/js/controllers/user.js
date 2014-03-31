angular.module('githelp.controllers.user', [])
  .controller('UserController', ['$scope', '$state', '$http', '$stateParams', 'Global', 'User', 'Inbox', 'Appointment',
    function ($scope, $state, $http, $stateParams, Global, User, Inbox, Appointment) {
    $scope.global = Global;

    $scope.members = [];
    $scope.userName = $stateParams.userName;

    $scope.findAppointments = function(){
      Appointment.get(function(data){
        $scope.userAppointments = data.appointments;
      });
    }

    $scope.findOne = function(){
      User.get({
        userName: $stateParams.userName
        // look for the github.login and then get the githubId sequence
      }, function(response){
        $scope.repoList = response.repoList;

        $scope.user = response.user;
        $scope.conList = response.conList;
        console.log('user', $scope.user)
      })
      // make this aynchronous
    };

    $scope.onSelect = function ($item, $model, $label) {
      $scope.$item = $item;
      $scope.$model = $model;
      $scope.$label = $label;
      console.log($item)
      console.log($model)
      console.log($label)
    };

    // Edit price-per-minute
    $scope.inputShown = false;
    $scope.setPpm = function() {
      $scope.inputShown = true;
    };

    // $scope.findAllInboxes = function(){
    //   Inbox.query(function(response){
    //     $scope.inboxes = response.inboxes;
    //   })
    // };

    // $scope.findAllUsers = function(){
    //   User.query(function(response){
    //     $scope.users = response.users;
    //   })
    // };

    $scope.createInbox = function(){
      console.log($scope.$item);
      var newInbox = new Inbox({
        members: [$scope.$item._id]
      });

      this.member = ''
      newInbox.$save(function(inbox){
        $scope.userInboxes.push(inbox);
        $state.go('inbox.individual', {'inboxId': inbox._id});
        // figure how to go to specific inboxId
      })
    };
    // real time make inboxes populate on the side in real time
    // when we inject a child state, that tempalte will
    // have data-ng-controller="MessageController"
    // which will do data-ng-init="findMessages(the id of the state)"

    $scope.toInbox = function(inboxId){
      $state.go('inbox.individual', {'inboxId': inboxId});
      // figure how to go to specific inboxId
    };

    $scope.repoName = function(url){
      return url.split('/')[2];
    }
    $scope.showForm = false;

    $scope.editForm = function(url){
      $scope.showForm = !$scope.showForm;
    };


    $scope.repoAuthor = function(url){
      return url.split('/')[1];
    }

    $scope.setAppointment = function(){
      $state.go('profile.booking', {'userName': $stateParams.userName});
    }

    $scope.submitEdit = function(){
      $http({
        method: 'POST',
        url: '/updatePpm',
        params: {
          _id: $scope.user._id,
          ppm: $scope.user.ppm
        }
      });
      // var newEdit = new User({
      //   // name: $scope.cc.name,
      //   // number: $scope.cc.number,
      //   // expiration_month: $scope.cc.expiration_month,
      //   // expiration_year: $scope.cc.expiration_year,
      //   // cvv: $scope.cc.cvv,
      //   ppm: $scope.user.ppm
      //   // intro: $scope.intro
      // })
      // User.$update(function(data){
      //   $scope.user = data.user;
      // });
    };

    $scope.findOtherUser = function(inbox) {
      var otherUser = $scope.global.user._id;
      console.log(inbox.members)
      if(otherUser === inbox.members[0]._id){
        otherUser = inbox.members[1];
      } else{
        otherUser = inbox.members[0];
      }
      return otherUser;
    };

    $scope.findInbox = function(){
      $http({method: 'GET', url: '/user'}).
        success(function(data){
          var response = JSON.parse(data[0]);
          $scope.allUsers = response.allUsers;
          $scope.userInboxes = response.inboxes;
          console.log($scope.userInboxes);
          $scope.merchants = response.merchantAppointments;
          console.log($scope.merchants);
          $scope.customers = response.customerAppointments;
          console.log($scope.customers);
        })
    };

    // $scope.cc = {};

    $scope.cc = {
      name: "",
      number: "",
      expiration_month: "",
      expiration_year: "",
      cvv: ""
    };

    $scope.ba = {
      name: "",
      routing_number: "",
      account_type: "",
      account_number: ""
    };

    $scope.createCard = function() {
      $http.post('/create/cc', $scope.cc).success(function(response) {
        console.log('CREATE CARD SUCCESS', response);
        $scope.ccComplete = response;
      });
    };


    $scope.createBankAcct = function() {
      $http.post('/create/ba', $scope.ba).success(function(response) {
        console.log('CREATE BANK SUCCESS', response);
        $scope.baComplete = response;
      });
    };

  }
]);
