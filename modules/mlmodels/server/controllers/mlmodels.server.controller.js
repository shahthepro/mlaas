'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  MLModel = mongoose.model('MLModel'),
  Dataset = mongoose.model('Dataset'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash'),
  config = require(path.resolve('./config/config')),
  CircularJSON = require('circular-json'),
  spawn = require('child_process').spawn,
  fs = require('fs');

/**
 * Create a MLModel
 */
exports.create = function(req, res) {
  var mlmodel = new MLModel(req.body);
  mlmodel.user = req.user;

  mlmodel.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mlmodel);
    }
  });
};

/**
 * Show the current MLModel
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var mlmodel = req.mlmodel ? req.mlmodel.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  mlmodel.isCurrentUserOwner = req.user && mlmodel.user && mlmodel.user._id.toString() === req.user._id.toString();

  res.jsonp(mlmodel);
};

/**
 * Update a MLModel
 */
exports.update = function(req, res) {
  var mlmodel = req.mlmodel;

  mlmodel = _.extend(mlmodel, req.body);

  mlmodel.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mlmodel);
    }
  });
};

/**
 * Delete an MLModel
 */
exports.delete = function(req, res) {
  var mlmodel = req.mlmodel;

  mlmodel.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mlmodel);
    }
  });
};

/**
 * List of MLModels
 */
exports.list = function(req, res) {
  MLModel.find().sort('-created').populate('user', 'displayName').exec(function(err, mlmodels) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mlmodels);
    }
  });
};

exports.listByUser = function(req, res) {
  // { '_user': req.user._id }
  MLModel.find({ 'user': req.user._id }).sort('-created').populate('user', 'displayName').exec(function(err, mlmodels) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mlmodels);
    }
  });
};

/**
 * MLModel middleware
 */
exports.mlmodelByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Model is invalid'
    });
  }

  MLModel.findById(id).populate('user', 'displayName').exec(function (err, mlmodel) {
    if (err) {
      return next(err);
    } else if (!mlmodel) {
      return res.status(404).send({
        message: 'No Model with that identifier has been found'
      });
    }
    req.mlmodel = mlmodel;
    next();
  });
};

/**
 * *********************
 * MLModel API Endpoints
 * *********************
 */

/**
 * MLModel Prediction Endpoint
 */
exports.predict = function(req, res, next) {
  var mlmodel = req.mlmodel;
  var datasetID = req.body.dataset;
  var strFeat = mlmodel.stringFeatures;

  if (mlmodel.trainingStatus !== 'Idle' && mlmodel.trainingStatus !== 'Untrained') {
    res.status(400).send({ message: 'You cannot perform training or predictions on this model now.' });
  }

  Dataset.findOne({ _id: datasetID }).exec(function(err, obj) {
    if (err) {
      res.status(404).send({ message: 'Dataset not found' });
    }
    var dataset = obj;
    var filePath = path.resolve(config.uploads.datasetUpload.dest, dataset.datasetFileID);
    var scriptPath = path.resolve(config.scriptsFolder.dest, 'predictModel.py');
    var modelDataFolder = path.resolve(config.modelsDataFolder.dest, mlmodel.id);

    mlmodel.trainingStatus = 'Predicting';
    var paramList = [scriptPath, filePath, modelDataFolder, mlmodel.id, strFeat.join(',')];
    var query = 'python "' + paramList.join('" "') + '"';
    res.jsonp(query);
    spawn('python', paramList, {
      detached: true,
      stdio: 'ignore'
    }).unref();

    mlmodel.save(function(err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(mlmodel);
      }
    });
  });
};

/**
 * MLModel Train Endpoint
 */
exports.train = function(req, res, next) {

  var mlmodel = req.mlmodel;
  var datasetID = req.body.dataset;
  var strFeat = req.body.stringFeatures;
  var featuresCount = req.body.featuresCount;
  var modelType = mlmodel.modelType;

  if (mlmodel.trainingStatus !== 'Idle' && mlmodel.trainingStatus !== 'Untrained') {
    res.status(400).send({ message: 'You cannot perform training or predictions on this model now.' });
  }

  Dataset.findOne({ _id: datasetID }).exec(function(err, obj) {
    if (err) {
      res.status(404).send({ message: 'Dataset not found' });
    }
    var dataset = obj;
    var filePath = path.resolve(config.uploads.datasetUpload.dest, dataset.datasetFileID);
    var scriptPath = path.resolve(config.scriptsFolder.dest, 'trainModel.py');
    var modelDataFolder = path.resolve(config.modelsDataFolder.dest, mlmodel.id);

    if ((strFeat === undefined || strFeat == null) && mlmodel.stringFeatures != null) {
      strFeat = mlmodel.stringFeatures;
    }
    mlmodel.trainingStatus = 'Training';
    var paramList = [scriptPath, filePath, modelDataFolder, modelType, mlmodel.id, strFeat.join(',')];
    var query = 'python "' + paramList.join('" "') + '"';

    spawn('python', paramList, {
      detached: true,
      stdio: 'ignore'
    }).unref();
    // console.log(query);
    // res.jsonp(query);

    mlmodel.save(function(err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(mlmodel);
      }
    });
    res.status(200).send({
      // query: query,
      message: 'Model is under training!'
    });
  });
};

/**
 * MLModel Test Endpoint
 */
exports.download = function(req, res, next) {
  var mlmodel = req.mlmodel;
  res.download(mlmodel.predictionDownloadLink);
};

/**
 * MLModel Status Endpoint
 */
exports.getStatus = function(req, res, next) {
};

exports.postStatus = function(req, res, next) {
  var mlmodel = req.mlmodel;
  mlmodel.trainingStatus = req.body.trainingStatus;
  mlmodel.lastTrained = new Date().getTime();
  mlmodel.lastTrainingStatus = req.body.lastTrainingStatus;
  if (req.body.stringFeatures !== undefined) {
    mlmodel.stringFeatures = req.body.stringFeatures.split(',');
  }
  if (req.body.featuresCount !== undefined) {
    mlmodel.featuresCount = req.body.featuresCount;
  }
  if (req.body.predictionDownloadLink !== undefined) {
    mlmodel.predictionDownloadLink = req.body.predictionDownloadLink;
  }
  mlmodel.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mlmodel);
    }
  });
  // console.log("from python >>>>>> ", req.body);
};
