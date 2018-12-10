'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Dataset = mongoose.model('Dataset'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash'),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  CircularJSON = require('circular-json'),
  firstline = require('first-line'),
  shelljs = require('shelljs');

/**
 * Create a Dataset
 */
exports.create = function(req, res) {
  var dataset = new Dataset(req.body);
  dataset.user = req.user;

  dataset.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(dataset);
    }
  });
};

/**
 * Show the current Dataset
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var dataset = req.dataset ? req.dataset.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  dataset.isCurrentUserOwner = req.user && dataset.user && dataset.user._id.toString() === req.user._id.toString();

  res.jsonp(dataset);
};

/**
 * Update a Dataset
 */
exports.update = function(req, res) {
  var dataset = req.dataset;

  dataset = _.extend(dataset, req.body);

  dataset.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(dataset);
    }
  });
};

/**
 * Delete an Dataset
 */
exports.delete = function(req, res) {
  var dataset = req.dataset;

  dataset.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(dataset);
    }
  });
};

/**
 * List of Datasets
 */
exports.list = function(req, res) {
  Dataset.find({ 'user': req.user._id }).sort('-created').populate('user', 'displayName').exec(function(err, datasets) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(datasets);
    }
  });
};

/**
 * Dataset middleware
 */
exports.datasetByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Dataset is invalid'
    });
  }

  Dataset.findById(id).populate('user', 'displayName').exec(function (err, dataset) {
    if (err) {
      return next(err);
    } else if (!dataset) {
      return res.status(404).send({
        message: 'No Dataset with that identifier has been found'
      });
    }
    req.dataset = dataset;
    next();
  });
};


/**
 * Update profile picture
 */
exports.uploadDataset = function (req, res) {

  // var dataset = req;
  var user = req.user;
  var upload = multer(config.uploads.datasetUpload).single('newDataset');
  var datasetUploadFileFilter = require(path.resolve('./config/lib/multer')).datasetUploadFileFilter;
  // Filtering to upload only images
  // upload.fileFilter = datasetUploadFileFilter;
  if (user) {
    upload(req, res, function (uploadError) {
      var datasetName = req.body.datasetName;
      var datasetURL = path.join(path.resolve(config.uploads.datasetUpload.dest), req.file.filename);
      var datasetFileID = req.file.filename;
      var dataset = new Dataset({ name: datasetName, datasetURL: datasetURL, datasetFileID: datasetFileID });
      dataset.user = req.user;

      if (uploadError) {
        return res.status(400).send({
          message: 'Error occurred while uploading dataset'
        });
      } else {

        dataset.save(function(err) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            res.jsonp(dataset);
          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};

exports.getStringFeatures = function(req, res) {
  var dataset = req.dataset;
  var filePath = path.resolve(config.uploads.datasetUpload.dest, dataset.datasetFileID);
  var scriptPath = path.resolve(config.scriptsFolder.dest, 'getStringFeatures.py');
  shelljs.exec('python "' + scriptPath + '" "' + filePath + '"', function(code, stdout, stderr) {
    res.status(200).send({ message: stdout });
  });

  // firstline(filePath, function(error, line) {
  //   if (error) {
  //     res.status(400).send({ message: error });
  //   } else {
  //   }
  // });
};
