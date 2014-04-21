angular.module('githelp.controllers.modal', [])
  .controller('ModalController', [
    '$scope',
    '$location',
    '$http',
    '$modal',
    'Global',
    function($scope, $location, $http, $modal, Global) {
      $scope.global = Global;

      var ModalInstanceController = function($scope, Global, $modalInstance) {
        $scope.global = Global;
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
          console.log(bankAccount)
          if(bankAccount.errors){
            console.log(bankAccount.errors);
            throw bankAccount.errors;
          }
          balancedBank = bankAccount.bank_accounts[0].id;
          $http.post('/create/ba', {balancedBank: balancedBank})
            .success(function(user){
              $scope.global.user = user;
              $modalInstance.close(user);
            })
            .error(function(err){
              console.log(err);
            })
        };

        $scope.logout = function() {
          $modalInstance.dismiss('cancel');
        };

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
    }
  ]);
// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.
