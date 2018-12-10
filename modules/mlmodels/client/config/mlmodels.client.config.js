(function () {
  'use strict';

  angular
    .module('mlmodels')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Models',
      state: 'mlmodels',
      type: 'dropdown',
      roles: ['user']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'mlmodels', {
      title: 'List Models',
      state: 'mlmodels.list',
      roles: ['user']
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'mlmodels', {
      title: 'Create Model',
      state: 'mlmodels.create',
      roles: ['user']
    });
  }
}());
