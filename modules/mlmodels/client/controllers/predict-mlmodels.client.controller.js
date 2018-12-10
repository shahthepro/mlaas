(function () {
  'use strict';

  // MLModels controller
  angular
    .module('mlmodels')
    .controller('PredictMLModelController', PredictMLModelController);

  PredictMLModelController.$inject = ['$scope', '$state', '$http', 'Authentication', 'mlmodelResolve'];

  function PredictMLModelController ($scope, $state, $http, Authentication, mlmodel) {
    var vm = this;

    vm.authentication = Authentication;
    vm.mlmodel = mlmodel;
    vm.error = null;
    vm.form = {};

    vm.isPredictButtonDisabled = true;
    vm.datasetChanged = datasetChanged;
    vm.predictModel = predictModel;
    vm.showMismatchError = false;
    vm.datasets = {};

    $http.get('/api/datasets')
    .success(function(data, status, headers, config) {
      vm.datasets = data;
      if (data.length === 0) {
        vm.error = 'You haven\'t uploaded any datasets';
      }
      // vm.selectedDataset = data[0].id;
    })
    .error(function(data, status, headers, config) {
      vm.error = 'Something wen\'t wrong. We cannot retrieve any uploaded datasets.';
    });

    // Train MLModel
    function predictModel(isValid) {
      vm.loadingText = 'Initiating prediction...';
      vm.isPredictButtonDisabled = true;
      if (!isValid) {
        vm.isPredictButtonDisabled = false;
        $scope.$broadcast('show-errors-check-validity', 'vm.form.mlmodelForm');
        return false;
      }
      $http.post('/api/models/' + vm.mlmodel._id + '/predict', {
        dataset: vm.selectedDataset._id,
        stringFeatures: vm.stringFeatures
      })
      .success(function(data, status, headers, config) {
        vm.loadingText = '';
        vm.isPredictButtonDisabled = false;
        $state.go('mlmodels.list');
        // console.log(data);
      })
      .error(function(data, status, headers, config) {
        vm.loadingText = '';
        vm.error = 'Something went wrong! Please try again';
        vm.isPredictButtonDisabled = false;
      });
      return false;
    }

    function datasetChanged() {
      vm.isPredictButtonDisabled = true;
      vm.loadingText = 'Preprocessing dataset...';
      vm.showMismatchError = false;
      if (vm.selectedDataset == null || vm.selectedDataset === undefined) { return false; }
      $http.get('/api/datasets/' + vm.selectedDataset._id + '/stringfeatures')
      .success(function(data, status, headers, config) {
        var t = data.message.split(',');
        vm.featuresCount = t[0];
        if (parseInt(vm.featuresCount, 10) === parseInt(vm.mlmodel.featuresCount - 1, 10)) {
          vm.isPredictButtonDisabled = false;
          vm.loadingText = '';
        }
        vm.loadingText = '';
      })
      .error(function(data, status, headers, config) {
        vm.loadingText = '';
        vm.error = 'Something went wrong!';
      });
      return false;
    }

  }
}());
