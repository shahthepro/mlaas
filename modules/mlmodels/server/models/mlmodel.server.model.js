'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * MLModel Schema
 */
var MLModelSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Model name',
    trim: true
  },
  modelType: {
    type: String,
    default: '',
    required: 'Please select the type of the model'
  },
  accuracy: {
    type: String,
    default: ''
  },
  featuresCount: {
    type: Number,
    default: 0
  },
  stringFeatures: {
    type: [String],
    default: []
  },
  trainingStatus: {
    type: String,
    default: 'Untrained'
  },
  predictionDownloadLink: {
    type: String
  },
  lastTrained: {
    type: Date
  },
  lastTrainingStatus: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('MLModel', MLModelSchema);
