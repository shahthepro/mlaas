'use strict';

/**
 * Module dependencies
 */
var datasetsPolicy = require('../policies/datasets.server.policy'),
  datasets = require('../controllers/datasets.server.controller');

module.exports = function(app) {
  // Datasets Routes
  app.route('/api/datasets').all(datasetsPolicy.isAllowed)
    .get(datasets.list)
    .post(datasets.create);

  app.route('/api/datasets/upload').post(datasets.uploadDataset);

  app.route('/api/datasets/:datasetId').all(datasetsPolicy.isAllowed)
    .get(datasets.read)
    .put(datasets.update)
    .delete(datasets.delete);

  app.route('/api/datasets/:datasetId/stringfeatures').all(datasetsPolicy.isAllowed)
    .get(datasets.getStringFeatures);

  // Finish by binding the Dataset middleware
  app.param('datasetId', datasets.datasetByID);
};
