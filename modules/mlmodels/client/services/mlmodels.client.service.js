// MLModels service used to communicate MLModels REST endpoints
(function () {
  'use strict';

  angular
    .module('mlmodels')
    .factory('MLModelsService', MLModelsService);

  MLModelsService.$inject = ['$resource'];

  function MLModelsService($resource) {
    return $resource('api/models/:mlmodelId', {
      mlmodelId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
