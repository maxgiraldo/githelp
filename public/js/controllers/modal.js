angular.module('githelp.controllers.modal', [])
  .controller('ModalController', [
    '$scope',
    '$location',
    '$http',
    '$modal',
    '$log',
    'Global',
    function($scope, $location, $http, $modal, $log, Global) {
      $scope.global = Global;
      console.log($scope.$parent.$parent);
      $scope.alerts = {
        bank: []
      }

      var ModalInstanceController = function($scope, $stateParams, Global, $modalInstance) {
        $scope.global = Global;
        $scope.user = $scope.$parent.user;
        console.log($scope.user);
        $scope.userName = $stateParams.userName;
        $scope.alerts = {
          bank: []
        };



        $scope.resize = function(){
          angular.element("#message-modal").parent().css({'width': '40%', 'margin-right': 'auto', 'margin-left': 'auto'});
          return false;
        }


        var cardHandler = function(card){
          if(card.errors){
            console.log(card.errors);
          }
          if(card.cvv_match !== 'yes'){
            console.log('no cvv match and card should be rejected');
            throw "Invalid CVV";
          }
          balancedCard = card.cards[0].id;
          $http.post('/create/cc', {balancedCard: balancedCard})
            .success(function(user){
              $scope.global.user = user;
              $modalInstance.close(user);
            })
            .error(function(err){
              console.log(err);
            })
        };

        var bankAccountHandler = function(bankAccount){
          if(bankAccount.errors){
            var errorMsg = bankAccount.errors[0].description;
            console.log(errorMsg);
            $scope.alerts.bank.push({type: 'danger', msg: errorMsg });
            throw errorMsg;
          }
          balancedBank = bankAccount.bank_accounts[0].id;
          $http.post('/create/ba', {balancedBank: balancedBank})
            .success(function(user){
              $scope.global.user = user;
              // $scope.submittedValidBank = true;
              // $scope.alerts.bank.push({type: 'success', msg: 'Successfully linked bank account'});
              $modalInstance.close(user);
            })
            .error(function(err){
              console.log(err);
            })
        };

        $scope.logout = function() {
          $modalInstance.dismiss('cancel');
        };

        $scope.quickModal = function(){
          $http.get('/quickAppointment')
            .success(function(data){
              $scope.appointment = data;
            })
        }

        $scope.createBankAccount = function(){
          var payload = {
            name: this.name,
            account_number: this.account_number,
            routing_number: this.routing_number,
            account_type: this.account_type
          };

          balanced.bankAccount.create(payload, bankAccountHandler)
        };

        $scope.createCard = function(){
          var payload = {
            name: this.name,
            number: this.number,
            expiration_month: this.expiration_month,
            expiration_year: this.expiration_year,
            security_code: this.security_code
          };
          balanced.card.create(payload, cardHandler);
        };

        $scope.sendDirectMessage = function(){
          $http.post('/directMessage', {userName: $stateParams.userName, content: this.directMessage})
            .success(function(data){
              // chatroom
              $modalInstance.close();
            })
        };
      };

      $scope.openQuickModal = function() {
        var modalInstance = $modal.open({
          templateUrl: 'views/partials/quickModal.html',
          controller: ModalInstanceController
        });

        modalInstance.result.then(function(user){
          $scope.user = user;
        }, function(){
          $log.info('Modal dismissed at: ' + new Date());
        });
      };


      $scope.openAccountModal = function() {
        if(!$scope.global.user.contactEmail || !$scope.global.user.balancedAccount) {
          var modalInstance = $modal.open({
            templateUrl: 'views/partials/accountModal.html',
            controller: ModalInstanceController
          });

          modalInstance.result.then(function(user){
            $scope.user = user;
          }, function(){
            $log.info('Modal dismissed at: ' + new Date());
          });
        };
      };

      // send a 'sent' alert in green

      $scope.openMessageModal = function() {
        var modalInstance = $modal.open({
          templateUrl: 'views/partials/messageModal.html',
          controller: ModalInstanceController
        });

        modalInstance.result.then(function(user){
        }, function(){
          $log.info('Modal dismissed at: ' + new Date());
        });
      }
    }
  ]);
// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.
