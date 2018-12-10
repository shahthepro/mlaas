(function () {
  'use strict';

  angular
    .module('datasets')
    .controller('DatasetsListController', DatasetsListController);

  DatasetsListController.$inject = ['DatasetsService'];

  function DatasetsListController(DatasetsService) {
    var vm = this;

    vm.datasets = DatasetsService.query();
  }
}());
