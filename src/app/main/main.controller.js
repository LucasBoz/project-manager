(function() {
  'use strict';

  angular
    .module('frontEnd')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($location, Project, $log, dataService) {
    var vm = this;

    dataService.find("").success(function(data){
      vm.projects = data;
    }).error(function(message){
      $log.debug(message);
    });

    //vm.projects = Project.all();

    vm.openProject = function(id){
      $location.path('project/' + id);
      $log.debug("project " + id);
    };

  }
})();
