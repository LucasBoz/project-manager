(function() {
  'use strict';

  angular
    .module('frontEnd')
    .controller('MainController', MainController);

  /** @ngInject */



  function MainController($location, $mdDialog, $log, dataService, $mdSidenav) {

    var vm = this;


    // dataService.findProject().success(function(data){
    //   vm.project = data;
    // }).error(function(message){
    //   $log.debug(message);
    // });

    dataService.get().success(function(data){
      vm.projects = data;
    }).error(function(message){
      $log.debug(message);
    });

    //vm.projects = Project.all();

    vm.openSidenav = function(){
      $log.debug("OPEN SIDENAVEE");
      $mdSidenav('left')
        .toggle();
    };

    vm.openProject = function(project){
      $location.path('project/' + project.id);
      $log.debug("project " + project.id);
    };

    vm.newProjectModal = function(ev, projects){

      $mdDialog.show({
          controller: ProjectController,
          controllerAs : 'project',
          templateUrl: 'app/main/project-dialog/project-dialog.html',
          //parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:true,
          locals: { projects : projects}
        })
        .then(function(answer) {
          vm.status = 'You said the information was "' + answer + '".';
        }, function() {
          vm.status = 'You cancelled the dialog.';
        });
    };

    function ProjectController(projects){
      $log.debug('MembersController');

      var vm = this;

      vm.hide = function() {
        $mdDialog.hide();
      };
      vm.cancel = function() {
        $mdDialog.cancel();
      };
      vm.answer = function(newProject) {

        projects.push(newProject);
        //TODO Backend here

        $mdDialog.hide();

      };
    }

  }


})();
