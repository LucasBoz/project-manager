(function() {
  'use strict';

  angular
    .module('frontEnd')
    .controller('ProjectController', ProjectController);

  /** @ngInject */
  function ProjectController($routeParams, $mdDialog) {

    var vm = this;

    vm.id = $routeParams.id;

    console.log($routeParams.id);




    // ------------------
    // Functions
    //------------------



    vm.manageMembers = function(ev){


      $mdDialog.show({
          controller: MembersController,
          controllerAs : 'members',
          templateUrl: 'app/project/project-dialog/members-dialog.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:true

        })
        .then(function(answer) {
          vm.status = 'You said the information was "' + answer + '".';
        }, function() {
          vm.status = 'You cancelled the dialog.';
        });


    };

    vm.manageMembers(null);

    //------------
    //  DIALOG CONTROLLER
    //------------
    function MembersController(){
      vm = this;

      vm.modal = "TEST";

      console.log('MembersController');

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


    //toast
    vm.showToastr = showToastr;
    function showToastr() {
      toastr.info('Fork <a href="https://github.com/Swiip/generator-gulp-angular" target="_blank"><b>generator-gulp-angular</b></a>');
      vm.classAnimation = '';
    }

  }
})();
