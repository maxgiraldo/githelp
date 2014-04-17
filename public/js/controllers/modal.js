angular.module('githelp.controllers.modal', [])
  .controller('ModalController', [
    '$scope',
    '$location',
    '$modal',
    'Global',
    function($scope, $location, $modal, Global) {
      $scope.global = Global;
      $scope.user = $scope.global.user;

      var ModalInstanceController = function($scope, $modalInstance, items) {
        $scope.submit = function() {
          $modalInstance.close($scope.selected.item);
        };

        $scope.logout = function() {
          $modalInstance.dismiss('cancel');
        };
      };

      $scope.open = function() {
        if($scope.user && ($scope.user.email ==="" || !$scope.user.email)) {
          var modalInstance = $modal.open({
            templateUrl: 'emailModalContent.html',
            controller: ModalInstanceController,
            resolve: {
              items: function () {
                return $scope.items;
              }
            }
          });
        }
      };
    }
  ]);
// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.
