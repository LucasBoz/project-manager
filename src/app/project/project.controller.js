(function() {
  'use strict';

  angular
    .module('frontEnd')
    .controller('ProjectController', ProjectController);

  /** @ngInject */
  function ProjectController($routeParams, $mdDialog, $log, dataService) {

    var vm = this;

    vm.id = $routeParams.id;

    vm.project = { activities : [] };

    dataService.findProject("").success(function(data){
      vm.project = data;
    }).error(function(message){
      $log.debug(message);
    });

    $log.debug(vm.project);

    // dataService.findActivitiesByProject().success(function(data){
    //   vm.project.activities = data;
    // }).error(function(message){
    //   $log.debug(message);
    // });


    $log.debug($routeParams.id);




    // ------------------
    // Functions
    //------------------



  vm.addActivity = function(ev, project){

      $mdDialog.show({
          controller: ActivityController,
          controllerAs : 'activity',
          templateUrl: 'app/project/activity-dialog/activity-dialog.html',
          targetEvent: ev,
          clickOutsideToClose:true,
          locals : {project : project}
        })
        .then(function(answer) {
          vm.status = 'You said the information was "' + answer + '".';
        }, function() {
          vm.status = 'Yo diu cancelled thealog.';
        });
    };

    vm.manageMembers = function(ev, project){
      //var project = angular.copy(vm.project);
      $log.debug(project);

      $mdDialog.show({
          controller: MembersController,
          controllerAs : 'members',
          templateUrl: 'app/project/members-dialog/members-dialog.html',
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

    vm.manageMilestone = function(ev, project){


      $mdDialog.show({
          controller: MilestoneController,
          controllerAs : 'milestone',
          templateUrl: 'app/project/milestone-dialog/milestone-dialog.html',
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
    function MembersController(){
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
    function ActivityController(project){
      $log.debug('ActivityController');

      var vm = this;

      vm.milestones = project.milestones;

      vm.hide = function() {
        $mdDialog.hide();
      };
      vm.cancel = function() {
        $mdDialog.cancel();
      };
      vm.answer = function(answer) {
        $mdDialog.hide(answer);

        project.milestones[ project.milestones.indexOf(vm.activity.milestone)].activity.push(vm.activity);

      };
    }
    function MilestoneController(){
      $log.debug('MembersController');

      var vm = this;

      vm.modal = "TEST";

      vm.hide = function() {
        $mdDialog.hide();
      };
      vm.cancel = function() {
        $mdDialog.cancel();
      };
      vm.answer = function(answer) {
        $mdDialog.hide(answer);

        project.milestones.push();
        //TODO Backend here
        
      };
    }



  }
})();
