(function () {
  'use strict';

  angular
    .module('frontEnd')
    .controller('ProjectController', ProjectController);

  /** @ngInject */
  function ProjectController($routeParams, $mdDialog, $log, $rootScope, $http, $httpParamSerializer, dataService) {

    var vm = this;

    findProjectById( $routeParams.id );
    findMilestoneByProjectId ( $routeParams.id );

    vm.status = [
      {
        name:'ABERTO',
        color:'green',
        label: "Aberto",
      },
      {
        name:'EM_EXECUCAO',
        color:'yellow',
        label: "Em execução"
      },
      {
        name:'PARADO',
        color:'orange',
        label: "Parado"
      },
      {
        name:'CONCLUIDO',
        color:'blue',
        label: "Concluido"
      },
      {
        name:'CANCELADO',
        color:'red',
        label: "Cancelado"
      }
    ];

    vm.milestones = []; 

    vm.project = {activities: []};

    function findMilestoneByProjectId ( id ) {
      $http.get( $rootScope.server + "/listMilestoneByProjectId", { params : { projectId : id }} )
        .success( function ( data )  {
          vm.milestones = data;
        })
        .error ( function (data ){
          $log.debug (data.message);
        })
    }

    function findProjectById ( id ) {
      $http.get( $rootScope.server + "/findFullProjectById", { params : { 'id' : id } } )
        .success( function ( data )  {
          vm.project = data;
        })
        .error ( function (data ){
          $log.debug (data.message);
        })
    }

    vm.updateProjectStatus = function ( project ) {
      console.log("maoe");
      $http.post( $rootScope.server + "/updateProject", project )
        .success( function ( data )  {
          console.log("salvou")
        })
        .error ( function (data ){
          console.log("deu pau")
        })
    }

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


    vm.manageActivity = function (ev, project, activity, milestones) {

      $mdDialog.show({
          controller: ActivityController,
          controllerAs: 'activity',
          templateUrl: 'app/project/activity-dialog/activity-dialog.html',
          targetEvent: ev,
          clickOutsideToClose: true,
          locals: {project: project, activity: activity, milestones: milestones}
        })
        .then(function ( activity ) {
          if ( activity ) {
            findProjectById( vm.project.id );
          }
          console.log ( activity );
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

    function ActivityController(project, activity, milestones) {
      $log.debug('ActivityController');

      var vm = this;

      loadUsers();
      vm.activity = activity;
      vm.project = project;
      vm.projectMilestones = milestones;

      vm.hide = function () {
        $mdDialog.hide();
      };
      vm.cancel = function () {
        $mdDialog.cancel();
      };
      vm.closeOk = function ( activity ) {
        if ( activity ) {

          if ( activity.milestone && activity.milestone.id ) {
            activity.project = null;
            var milestone = { id : activity.milestone.id , name : activity.milestone.name }
            activity.milestone = milestone;
          } else {
            activity.project = { id : project.id, name : project.name };
            activity.milestone = null;
          }

          if ( activity.id ) {
            console.log( activity ); 
            updateActivity ( activity );
            
          } else {
            console.log ( activity );
            insertActivity ( activity );
          }

        } else {
          $log.debug( "Atividade nula" );
        }        

      };

      function insertActivity ( activity ) {
        $http.post ( $rootScope.server + "/insertActivity", activity )
          .success( function ( data )  {
            $mdDialog.hide ( data );
          })
          .error ( function (data ){
            $log.debug ( data.message );
          })
      }

      function updateActivity ( activity ) {
        $http.post ( $rootScope.server + "/updateActivity", activity )
          .success( function ( data )  {
            $mdDialog.hide ( data );
          })
          .error ( function (data ){
            $log.debug ( data.message );
          })
      }
      //FIXME usar os membros do projeto
      function loadUsers () {
        $http.get( $rootScope.server + "/listAllUsers")
          .success( function ( data )  {
            vm.users = data;
          })
          .error ( function (data ){
            $log.debug ( data.message );
          })
      }

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
