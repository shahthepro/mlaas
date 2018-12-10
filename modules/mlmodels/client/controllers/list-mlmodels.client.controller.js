(function () {
  'use strict';

  angular
    .module('mlmodels')
    .controller('MLModelsListController', MLModelsListController);

  MLModelsListController.$inject = ['MLModelsService', '$http'];

  function MLModelsListController(MLModelsService, $http) {
    var vm = this;
    vm.downloadFile = downloadFile;

    function downloadFile(modelID) {
      // console.log(modelID);
      $http.get('/api/models/' + modelID + '/download')
      .success(function (data, status, headers, config) {
        // success
      })
      .error(function (data, status, headers, config) {
        // error
      });
      return false;
    }

    vm.mlmodels = MLModelsService.query();
  }
}());
