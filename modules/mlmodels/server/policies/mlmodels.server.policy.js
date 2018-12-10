'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke MLModels Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/models',
      permissions: '*'
    }, {
      resources: '/api/models/:mlmodelId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/models',
      permissions: ['get', 'post']
    }, {
      resources: '/api/models/:mlmodelId',
      permissions: ['get', 'post']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/models',
      permissions: ['get', 'post']
    }, {
      resources: '/api/models/:mlmodelId',
      permissions: ['get', 'post']
    }, {
      resources: '/api/models/:mlmodelId/status',
      permissions: ['get', 'post']
    }]
  }]);
};

/**
 * Check If MLModels Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an MLModel is being processed and the current user created it then allow any manipulation
  if (req.mlmodel && req.user && req.mlmodel.user && req.mlmodel.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
