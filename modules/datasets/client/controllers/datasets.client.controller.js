(function () {
  'use strict';

  // Datasets controller
  angular
    .module('datasets')
    .controller('DatasetsController', DatasetsController);

  DatasetsController.$inject = ['$scope', '$timeout', '$window', '$state', 'Authentication', 'datasetResolve', 'FileUploader'];

  function DatasetsController ($scope, $timeout, $window, $state, Authentication, dataset, FileUploader) {
    var vm = this;

    vm.authentication = Authentication;
    vm.dataset = dataset;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.isAdmin = vm.authentication.user.roles.indexOf('admin');

    vm.uploadDataset = uploadDataset;
    vm.cancelUpload = cancelUpload;
    vm.clearUploaderQueue = clearUploaderQueue;
    vm.checkFileType = checkFileType;
    // Create file uploader instance
    vm.uploader = new FileUploader({
      url: 'api/datasets/upload',
      alias: 'newDataset',
      onAfterAddingFile: onAfterAddingFile,
      onSuccessItem: onSuccessItem,
      onErrorItem: onErrorItem,
      onBeforeUploadItem: onBeforeUploadItem,
      queueLimit: 1
    });

    // Remove existing Dataset
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.dataset.$remove($state.go('datasets.list'));
      }
    }

    // Save Dataset
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.datasetForm');
        return false;
      }

      // uploadDataset();

      // TODO: move create/update logic to service
      vm.dataset.$save(successCallback, errorCallback);

      function successCallback(res) {
        $state.go('datasets', {
          datasetId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }

    function deleteDataset() {
      // console.log('"triggered"');
      // dataset.$remove($state.go('datasets.list'));
    }

    /**
     * **************************
     * Uploader Functions
     * **************************
     */

    // Called after the user selected a new picture file
    function onAfterAddingFile(fileItem) {
      // if ($window.FileReader) {
      //   var fileReader = new FileReader();
      //   fileReader.readAsDataURL(fileItem._file);

      //   fileReader.onload = function (fileReaderEvent) {
      //     $timeout(function() {
      //       vm.dataset.datasetURL = fileReaderEvent.target.result;
      //     }, 0);
      //   };
      // }
    }

    // Called after the user has successfully uploaded a new picture
    function onSuccessItem(fileItem, response, status, headers) {
      // Show success message
      vm.success = true;
      // console.log(response);
      // vm.dataset.datasetURL = response.fileURL;
      // console.log(response, response.fileURL, "var: " + vm.dataset.datasetURL);
      // console.log(response.reqcont);
      // vm.dataset.$save(successCallback, errorCallback);

      // function successCallback(res) {
      //   $state.go('datasets.list');
      // }

      // function errorCallback(res) {
      //   vm.error = res.data.message;
      // }
      // Clear upload buttons
      vm.progressText = '';
      cancelUpload();
    }

    // Called after the user has failed to uploaded a new picture
    function onErrorItem(fileItem, response, status, headers) {
      // Clear upload buttons
      // cancelUpload();
      // Show error message
      vm.error = response.message;
      vm.progressText = '';
    }

    // Change user profile picture
    function uploadDataset() {
      if (vm.dataset.name === undefined) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.datasetForm');
        return false;
      }
      // Clear messages
      vm.success = vm.error = null;
      vm.progressText = 'Uploading...';
      // Start upload
      // console.log((vm.uploader.queue), vm.uploader.queue[0].file.type);
      vm.uploader.formData = { dataset: vm.dataset };
      vm.uploader.uploadAll();
    }

    function onBeforeUploadItem(item) {
      item.formData.push({ datasetName: vm.dataset.name });
    }

    // Cancel the upload process
    function cancelUpload() {
      clearUploaderQueue();
      vm.progressText = '';
      $state.go('datasets.list');
    }

    function clearUploaderQueue() {
      vm.uploader.clearQueue();
    }

    function checkFileType() {
      var x = vm.uploader.queue[0];
    }
  }
}());
