'use strict';

/**
 * Module dependencies
 */
var mlmodelsPolicy = require('../policies/mlmodels.server.policy'),
  mlmodels = require('../controllers/mlmodels.server.controller');

module.exports = function(app) {
  // MLModels Routes
  app.route('/api/models').all(mlmodelsPolicy.isAllowed)
    .get(mlmodels.listByUser)
    .post(mlmodels.create);

  app.route('/api/models/:mlmodelId').all(mlmodelsPolicy.isAllowed)
    .get(mlmodels.read)
    .put(mlmodels.update)
    .delete(mlmodels.delete);

  app.route('/api/models/:mlmodelId/predict').all(mlmodelsPolicy.isAllowed)
    .post(mlmodels.predict);

  app.route('/api/models/:mlmodelId/train').all(mlmodelsPolicy.isAllowed)
    .post(mlmodels.train);

  app.route('/api/models/:mlmodelId/download').all(mlmodelsPolicy.isAllowed)
    .get(mlmodels.download);

  app.route('/api/models/:mlmodelId/status').all(mlmodelsPolicy.isAllowed)
    .get(mlmodels.getStatus)
    .post(mlmodels.postStatus);

  // Finish by binding the MLModel middleware
  app.param('mlmodelId', mlmodels.mlmodelByID);
};
