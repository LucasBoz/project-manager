(function () {
  'use strict';

  angular
    .module('frontEnd')
    .controller('ProjectController', ProjectController);

  /** @ngInject */
  function ProjectController($routeParams, $mdDialog, $log, dataService) {

    var vm = this;

    vm.status = [
      {
        id: 1,
        description: 'Aberto',
        color: 'green'
      },
      {
        id: 2,
        description: 'Em execução',
        color: 'yellow'
      },
      {
        id: 3,
        description: 'Parado',
        color: 'orange'
      },
      {
        id: 4,
        description: 'Concluido',
        color: 'blue'
      },
      {
        id: 5,
        description: 'Cancelado',
        color: 'red'
      }
    ];

    vm.id = $routeParams.id;

    vm.project = {activities: []};

    dataService.findProject("").success(function (data) {
      vm.project = data;
    }).error(function (message) {
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

    vm.removeActivity = function (ev, project, activity, milestone) {
      var confirm = $mdDialog.confirm()
        .title('Deseja remover essa atividade?')
        .targetEvent(ev)
        .ok('Remover')
        .cancel('Cancelar');
      $mdDialog.show(confirm).then(function() {
        if(milestone){
          milestone.activities.splice( milestone.activities.indexOf(activity), 1 );
        } else {
          project.activities.splice( project.activities.indexOf(activity), 1 );
        }
      });
    };

    vm.removeMilestone = function (ev, project, milestone) {
      var confirm = $mdDialog.confirm()
        .title('Deseja remover esse milestone?')
        .targetEvent(ev)
        .ok('Remover')
        .cancel('Cancelar');
      $mdDialog.show(confirm).then(function() {
        project.milestones.splice( project.milestones.indexOf(milestone), 1 );
      });
    };


    vm.manageActivity = function (ev, project, activity, milestone) {

      $mdDialog.show({
          controller: ActivityController,
          controllerAs: 'activity',
          templateUrl: 'app/project/activity-dialog/activity-dialog.html',
          targetEvent: ev,
          clickOutsideToClose: true,
          locals: {project: project, activity: activity, milestone: milestone}
        })
        .then(function (answer) {

        });
    };

    vm.manageMembers = function (ev, project) {
      //var project = angular.copy(vm.project);
      $log.debug(project);

      $mdDialog.show({
          controller: MembersController,
          controllerAs: 'members',
          templateUrl: 'app/project/members-dialog/members-dialog.html',
          //parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          locals: {project: project}
        })
        .then(function (answer) {

        });
    };

    vm.manageMilestone = function (ev, project, milestone) {


      $mdDialog.show({
          controller: MilestoneController,
          controllerAs: 'milestone',
          templateUrl: 'app/project/milestone-dialog/milestone-dialog.html',
          //parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          locals: {project: project, milestone: milestone}
        })
        .then(function (answer) {

        });
    };

    //------------
    //  DIALOG CONTROLLER
    //------------
    function MembersController() {
      $log.debug('MembersController');

      var vm = this;

      vm.project = project;

      vm.modal = "TEST";

      vm.hide = function () {
        $mdDialog.hide();
      };
      vm.cancel = function () {
        $mdDialog.cancel();
      };
      vm.answer = function (answer) {
        $mdDialog.hide(answer);

      };
    }

    function ActivityController(project, activity, milestone) {
      $log.debug('ActivityController');

      var vm = this;

      vm.newActivity = activity;

      vm.milestone = milestone;

      vm.oldMilestone = milestone;

      vm.milestones = project.milestones;

      vm.hide = function () {
        $mdDialog.hide();
      };
      vm.cancel = function () {
        $mdDialog.cancel();
      };
      vm.answer = function (answer) {
        $mdDialog.hide(answer);
        //TODO arrumar estrutura de IFs
        if (!activity || (vm.oldMilestone != vm.milestone)) {

          if(activity){
            if(vm.oldMilestone){
              vm.oldMilestone.activities.splice(vm.oldMilestone.activities.indexOf(activity), 1);
            } else{
              project.activities.splice(project.activities.indexOf(activity), 1);
            }
          }

          if (vm.milestone) {
            //TODO pegar o indice do milestone do select
            project.milestones[ 1 ].activities.push(vm.newActivity);
          } else {
            project.activities.push(vm.newActivity);
          }
        }

      };
    }

    function MilestoneController(project, milestone) {
      $log.debug('MembersController');

      var vm = this;

      vm.newMilestone = milestone;

      if (vm.newMilestone) {
        vm.newMilestone.initialDate = new Date(vm.newMilestone.initialDate);
        vm.newMilestone.finalDate = new Date(vm.newMilestone.finalDate);
      }

      vm.hide = function () {
        $mdDialog.hide();
      };
      vm.cancel = function () {
        $mdDialog.cancel();
      };

      vm.answer = function () {
        $mdDialog.hide();

        $log.debug(project);

        if(!vm.newMilestone.id){
          project.milestones.push(vm.newMilestone);
        }
        //TODO Backend here

      };
    }


  }
})();
