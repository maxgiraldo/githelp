angular.module('githelp.controllers.user', [])
  .controller('UserController', ['$scope', '$state', '$http', '$stateParams', 'Global', 'User', 'Inbox', 'Appointment', '$location', '$timeout',
    function ($scope, $state, $http, $stateParams, Global, User, Inbox, Appointment, $location, $timeout) {
    $scope.global = Global;

    // $scope.user = $scope.global.user;
    $scope.user;
    $scope.placeholder = function() {
      if(user && user.contactEmail) {
        return user.contactEmail;
      } else {
        return "E-mail address";
      }
    }
    // $scope.placeholder = user.contactEmail || "E-mail Address";
    $scope.banners = [];

    $scope.alerts = {
      card: [],
      bank: []
    };

    $scope.members = [];
    $scope.userName = $stateParams.userName;
    $scope.emailInfo = {
      address: "",
      userName: $stateParams.userName
    };

    $scope.submittedEmail = false;

    $scope.findAppointments = function(){
      $scope.pendingA = [];
      $scope.confirmedA = [];
      $scope.completedA = [];
      Appointment.get(function(data){
        data.appointments.forEach(function(appointment){
          appointment.status === 'pending' && $scope.pendingA.push(appointment);
          appointment.status === 'confirmed' && $scope.confirmedA.push(appointment);
          appointment.status === 'completed' && $scope.completedA.push(appointment);
        })
        console.log('pending', $scope.pendingA);
        console.log('confirm', $scope.confirmedA);
        console.log('complete', $scope.completedA);
      });
    };

    $scope.value = "";

    $scope.required = {
      bank: "Bank account required to offer githelp and get paid!",
      card: "Credit card required to request githelp sessions",
      email: "E-mail required to request githelp sessions"
    };

    $scope.eligibleMerchant = function() {
      // console.log('scope.user in eligMerchant', $scope.user);
      console.log('scope.user.balancedBank in eligMerchant', $scope.user.balancedBank === undefined);
      if($scope.user.balancedBank && $scope.user.contactEmail) {
        return true;
      } else {
        return false;
      }
    };

    $scope.eligible = {
      merchant: "Your profile is complete and you can now offer merchant services",
      customer: "You can now request githelp sessions"
    }

    $scope.ineligible = {
      merchant: "You are not yet allowed to offer githelp sessions",
      customer: "Your profile is missing necessary information"
    }

    $scope.eligibleCustomer = function() {
      if($scope.user.balancedCard && $scope.user.contactEmail) {
        return true;
      } else {
        return false;
      }
    };

    $scope.findOne = function(){ // sets $scope.user to be :userName param
      User.get({
        userName: $stateParams.userName
        // look for the github.login and then get the githubId sequence
      }, function(response){
        $scope.repoList = response.repoList;
        $scope.user = response.user;
        $scope.conList = response.conList;
        // console.log('user', $scope.user);
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
    };
    $scope.showForm = false;

    $scope.editForm = function(url){
      $scope.showForm = !$scope.showForm;
    };


    $scope.repoAuthor = function(url){
      return url.split('/')[1];
    };

    $scope.setAppointment = function(){
      // if($scope.global.user.email === "" || !$scope.global.user.email) {
      //   console.log('no submitted email');
      //   $state.go('profile.settings');
      // } else {
        $state.go('profile.booking', {'userName': $stateParams.userName});
      // }
    };

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
      userName: $scope.userName,
      name: "",
      number: "",
      expiration_month: "",
      expiration_year: "",
      cvv: ""
    };

    $scope.savedCard = {
      brand: "",
      expirationYear: "",
      lastFourDigits: ""
    };

    $scope.savedBank = {
      bank_name: "",
      lastFourDigits: ""
    };

    $scope.ba = {
      userName: $scope.userName,
      name: "",
      routing_number: "",
      account_type: "",
      account_number: ""
    };

    // $scope.submittedCard = false;
    $scope.submittedValidCard = false;
    $scope.submittedDeleteCard = false;

    $scope.submittedCreateBank = false;
    $scope.submittedValidBank = false;

    var cardHandler = function(card){
      console.log(card);
      if(card.errors){
        console.log(card.errors);
      }
      balancedCard = card.cards[0].id;
      $http.post('/create/cc', {balancedCard: balancedCard})
        .success(function(user){
          $scope.global.user = user;
          $scope.submittedValidCard = true;
          $scope.alerts.card.push({type: 'success', msg: 'Successfully added credit card'});
        })
        .error(function(err){
          console.log(err);
          // $scope.banners.push({type: 'danger', msg: err});
          $scope.alerts.card.push({type: 'danger', msg: err});
        });
    };

    // $scope.closeAlert = function(index) {
    //   $scope.banners.splice(index, 1);
    // };

    $scope.createCard = function(){
      var payload = {
        name: $scope.cc.name,
        number: $scope.cc.number,
        expiration_month: $scope.cc.expiration_month,
        expiration_year: $scope.cc.expiration_year,
        cvv: $scope.cc.cvv
      };
      balanced.card.create(payload, cardHandler);
    };

    var bankAccountHandler = function(bankAccount){
      console.log(bankAccount)
      if(bankAccount.errors){
        var errorMsg = bankAccount.errors[0].description;
        console.log(errorMsg);
        // add error message banner
        $scope.alerts.bank.push({type: 'danger', msg: errorMsg });
        throw errorMsg;
      }
      balancedBank = bankAccount.bank_accounts[0].id;
      $http.post('/create/ba', {balancedBank: balancedBank})
        .success(function(user){
          $scope.global.user = user;
          $scope.submittedValidBank = true;
          $scope.alerts.bank.push({type: 'success', msg: 'Successfully linked bank account'});
        })
        .error(function(err){
          console.log(err);
        })
    };

    $scope.closeCardAlert = function(index) {
      $scope.alerts.card.splice(index, 1);
    };

    $scope.closeBankAlert = function(index) {
      $scope.alerts.bank.splice(index, 1);
    };


    $scope.createBankAccount = function(){
      var payload = {
        name: $scope.ba.name,
        account_number: $scope.ba.account_number,
        routing_number: $scope.ba.routing_number,
        account_type: $scope.ba.account_type
      };

      balanced.bankAccount.create(payload, bankAccountHandler)
    };

    $scope.deleteCard = function() {
      console.log('in deleteCard');
      $http.delete('/delete/cc/' + $scope.global.user.balancedCard).success(function(response) {
        console.log('DELETE CARD SUCCESS', response.card);
        $scope.global.user = response.user;
        $scope.submittedDeleteCard = true;
        $scope.alerts.card.push({type: 'success', msg: 'Successfully deleted credit card'});
      });
    };

    $scope.deleteBank = function() {
      console.log('in deleteBank');
      $http.delete('/delete/ba/' + $scope.global.user.balancedBank).success(function(response) {
        console.log('DELETE BANK SUCCESS', response.bank);
        $scope.global.user = response.user;
        $scope.alerts.bank.push({type: 'success', msg: "Successfully deleted bank account"});
        // $scope.banners.push({type: 'success', msg: "Successfully deleted bank account"});
        // $scope.banner.bank = "Successfully deleted bank account";
        $scope.submittedDeleteBank = true;
        $scope.ba.name = "";
        $scope.ba.routing_number = "";
        $scope.ba.account_type = "";
        $scope.ba.account_number = "";
      });
    };

    $scope.showCard = function() {
      console.log('balancedCard?', $scope.global.user.balancedCard);
      $http.get('/show/cc/' + $scope.global.user.balancedCard).success(function(card) {
        console.log('card', card);
        $scope.savedCard.brand = card.brand;
        $scope.savedCard.expiration_year = card.expiration_year;
        $scope.savedCard.lastFourDigits = card.number.slice(-5);
      });
    };

    $scope.showBank = function() {
      $http.get('/show/ba/' + $scope.global.user.balancedBank).success(function(bank) {
        $scope.savedBank.bank_name = bank.bank_name;
        $scope.savedBank.lastFourDigits = bank.account_number.slice(-5);
      });
    }

    $scope.onRequiredEmail = function() {
      return $state.is('profile.requiredEmail');
    };

    $scope.submitEmail = function() {
      console.log('emailInfo', $scope.emailInfo);
      $http.post('/submitEmail', $scope.emailInfo).success(function(user) {
        console.log('successfully submitted email');
        console.log(user);
        $scope.global.user = user; // refreshes the global user for submitted email
        $scope.tempAddress = user.contactEmail;
        $scope.submittedEmail = true;
        $scope.banner.email = "Thank you for submitting your email";
        console.log($location.path());
        if($state.is('profile.requiredEmail')) { // redirect from omni-signup after auth
        // if($location.path() === '/' + user.userName + '/emailrequired') { // redirect from omni-signup after auth
          $timeout(function() {
            $location.path('/'); }, 750);
        }
      });
    };

    // $scope.signOut = function() {
    //   $http.get('/signout').success(function(response) {
    //     console.log('logged out!');
    //     $location.url('http://172.18.73.218:3000/signout');
    //   });
    // };
    $scope.redirectIfEmail = function() { // if state is profile.emailRequired && user.contactEmail
      if($state.is('profile.requiredEmail') && user && user.contactEmail) {
        $location.path('/');
      }
    }
  }
]);
