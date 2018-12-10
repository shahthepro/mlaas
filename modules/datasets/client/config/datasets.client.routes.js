(function () {
  'use strict';

  angular
    .module('datasets')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('datasets', {
        abstract: true,
        url: '/datasets',
        template: '<ui-view/>'
      })
      .state('datasets.list', {
        url: '',
        templateUrl: 'modules/datasets/client/views/list-datasets.client.view.html',
        controller: 'DatasetsListController',
        controllerAs: 'vm',
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Datasets List'
        }
      })
      .state('datasets.upload', {
        url: '/upload',
        templateUrl: 'modules/datasets/client/views/form-dataset.client.view.html',
        controller: 'DatasetsController',
        controllerAs: 'vm',
        resolve: {
          datasetResolve: newDataset
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Upload Dataset'
        }
      });
  }

  getDataset.$inject = ['$stateParams', 'DatasetsService'];

  function getDataset($stateParams, DatasetsService) {
    return DatasetsService.get({
      datasetId: $stateParams.datasetId
    }).$promise;
  }

  newDataset.$inject = ['DatasetsService'];

  function newDataset(DatasetsService) {
    return new DatasetsService();
  }
}());
