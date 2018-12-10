(function () {
  'use strict';

  angular
    .module('mlmodels')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('mlmodels', {
        abstract: true,
        url: '/models',
        template: '<ui-view/>'
      })
      .state('mlmodels.list', {
        url: '',
        templateUrl: 'modules/mlmodels/client/views/list-mlmodels.client.view.html',
        controller: 'MLModelsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Models List'
        }
      })
      .state('mlmodels.create', {
        url: '/create',
        templateUrl: 'modules/mlmodels/client/views/form-mlmodel.client.view.html',
        controller: 'MLModelsController',
        controllerAs: 'vm',
        resolve: {
          mlmodelResolve: newMLModel
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Models Create'
        }
      })
      .state('mlmodels.predict', {
        url: '/:mlmodelId/predict',
        templateUrl: 'modules/mlmodels/client/views/predict-mlmodel.client.view.html',
        controller: 'PredictMLModelController',
        controllerAs: 'vm',
        resolve: {
          mlmodelResolve: getMLModel
        },
        data: {
          pageTitle: 'Predict - {{ mlmodelResolve.name }}'
        }
      })
      .state('mlmodels.train', {
        url: '/:mlmodelId/train',
        templateUrl: 'modules/mlmodels/client/views/train-mlmodel.client.view.html',
        controller: 'TrainMLModelController',
        controllerAs: 'vm',
        resolve: {
          mlmodelResolve: getMLModel
        },
        data: {
          pageTitle: 'Train - {{ mlmodelResolve.name }}'
        }
      });
  }

  getMLModel.$inject = ['$stateParams', 'MLModelsService'];

  function getMLModel($stateParams, MLModelsService) {
    return MLModelsService.get({
      mlmodelId: $stateParams.mlmodelId
    }).$promise;
  }

  newMLModel.$inject = ['MLModelsService'];

  function newMLModel(MLModelsService) {
    return new MLModelsService();
  }
}());
