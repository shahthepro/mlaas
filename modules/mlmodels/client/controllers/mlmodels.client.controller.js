(function () {
  'use strict';

  // MLModels controller
  angular
    .module('mlmodels')
    .controller('MLModelsController', MLModelsController);

  MLModelsController.$inject = ['$scope', '$state', 'Authentication', 'mlmodelResolve'];

  function MLModelsController ($scope, $state, Authentication, mlmodel) {
    var vm = this;

    vm.authentication = Authentication;
    vm.mlmodel = mlmodel;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    vm.trainModel = trainModel;

    $scope.data = {
      modelTypes: [
        { id: 0, name: 'Linear Regression' },
        { id: 1, name: 'Support Vector Machines' },
        { id: 2, name: 'Perceptron' }
      ]
    };

    // Remove existing MLModel
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.mlmodel.$remove($state.go('mlmodels.list'));
      }
    }

    // Train MLModel
    function trainModel() {
      // trainModel
      return false;
    }

    // Save MLModel
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.mlmodelForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.mlmodel._id) {
        vm.mlmodel.$update(successCallback, errorCallback);
      } else {
        vm.mlmodel.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('mlmodels.list');
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
