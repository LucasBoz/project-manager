(function() {
  'use strict';

  angular
    .module('frontEnd')
    .controller('ProjectController', ProjectController);

  /** @ngInject */
  function ProjectController($routeParams, $mdDialog, $log) {

    var vm = this;

    vm.id = $routeParams.id;

    $log.debug($routeParams.id);




    // ------------------
    // Functions
    //------------------



    vm.manageMembers = function(ev, project){

      //var project = angular.copy(vm.project);
      $log.debug(project);

      $mdDialog.show({
          controller: MembersController,
          controllerAs : 'members',
          templateUrl: 'app/project/project-dialog/members-dialog.html',
          //parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:true,
          locals: { project : project}

        })
        .then(function(answer) {
          vm.status = 'You said the information was "' + answer + '".';
        }, function() {
          vm.status = 'You cancelled the dialog.';
        });


    };

    //------------
    //  DIALOG CONTROLLER
    //------------
    function MembersController(project){
      $log.debug('MembersController');

      var vm = this;

      vm.project = project;

      vm.modal = "TEST";

      vm.hide = function() {
        $mdDialog.hide();
      };
      vm.cancel = function() {
        $mdDialog.cancel();
      };
      vm.answer = function(answer) {
        $mdDialog.hide(answer);
      };
    }



  }
})();
