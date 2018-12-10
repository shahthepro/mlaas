(function () {
  'use strict';

  // MLModels controller
  angular
    .module('mlmodels')
    .controller('TrainMLModelController', TrainMLModelController);

  TrainMLModelController.$inject = ['$scope', '$state', '$http', 'Authentication', 'mlmodelResolve'];

  function TrainMLModelController ($scope, $state, $http, Authentication, mlmodel) {
    var vm = this;

    vm.authentication = Authentication;
    vm.mlmodel = mlmodel;
    vm.error = null;
    vm.form = {};

    vm.isTrainButtonDisabled = true;
    vm.datasetChanged = datasetChanged;
    vm.trainModel = trainModel;
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
    function trainModel(isValid) {
      vm.loadingText = 'Initiating training...';
      vm.isTrainButtonDisabled = true;
      if (!isValid) {
        vm.isTrainButtonDisabled = false;
        $scope.$broadcast('show-errors-check-validity', 'vm.form.mlmodelForm');
        return false;
      }
      $http.post('/api/models/' + vm.mlmodel._id + '/train', {
        dataset: vm.selectedDataset._id,
        stringFeatures: vm.stringFeatures,
        featuresCount: vm.featuresCount
      })
      .success(function(data, status, headers, config) {
        vm.loadingText = '';
        vm.isTrainButtonDisabled = false;
        $state.go('mlmodels.list');
        // console.log(data);
      })
      .error(function(data, status, headers, config) {
        vm.loadingText = '';
        vm.error = 'Something went wrong! Please try again';
        vm.isTrainButtonDisabled = false;
      });
      return false;
    }

    function datasetChanged() {
      vm.isTrainButtonDisabled = true;
      vm.loadingText = 'Preprocessing dataset...';
      vm.showMismatchError = false;
      if (vm.selectedDataset == null || vm.selectedDataset === undefined) { return false; }
      $http.get('/api/datasets/' + vm.selectedDataset._id + '/stringfeatures')
      .success(function(data, status, headers, config) {
        var t = data.message.split(',');
        vm.featuresCount = t[0];
        t.shift();
        t = t.map(function(i) {
          return (parseInt(i, 10) + 1);
        });
        vm.stringFeaturesCols = t;
        if (vm.mlmodel.stringFeatures.length) {
          vm.stringFeatures = vm.mlmodel.stringFeatures;
        }
        vm.isTrainButtonDisabled = false;
        vm.loadingText = '';
      })
      .error(function(data, status, headers, config) {
        vm.loadingText = '';
        vm.error = 'Something went wrong!';
      });
      if (vm.mlmodel.featuresCount !== 0) {
        if (vm.featuresCount !== vm.mlmodel.featuresCount) {
          vm.showMismatchError = true;
          return false;
        }
        vm.isTrainButtonDisabled = false;
        return false;
      }
      return false;
    }

  }
}());
