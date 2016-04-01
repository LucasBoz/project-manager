(function() {
  'use strict';

  angular
    .module('frontEnd')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($timeout, webDevTec, toastr, $location) {
    var vm = this;

    vm.openProject = function(id){
      $location.path('project/' + id);
      console.log("project " + id);
    };


  }
})();
