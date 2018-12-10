(function () {
  'use strict';

  angular
    .module('datasets')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Datasets',
      state: 'datasets',
      type: 'dropdown',
      roles: ['user']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'datasets', {
      title: 'List Datasets',
      state: 'datasets.list',
      roles: ['user']
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'datasets', {
      title: 'Upload Dataset',
      state: 'datasets.upload',
      roles: ['user']
    });
  }
}());
