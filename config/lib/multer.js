'use strict';

module.exports.profileUploadFileFilter = function (req, file, cb) {
  if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/gif') {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

module.exports.datasetUploadFileFilter = function (req, file, cb) {
  if (file.mimetype !== 'application/csv' && file.mimetype !== 'text/csv') {
    return cb(new Error('Only CSV files are allowed!'), false);
  }
  cb(null, true);
};
