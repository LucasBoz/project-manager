(function() {
  'use strict';

  angular
    .module('frontEnd')
    .controller('MainController', MainController);

  /** @ngInject */



  function MainController($location, $mdDialog, $rootScope, $log, dataService, $mdSidenav, $http, $httpParamSerializer) {

    var vm = this;

    $rootScope.server = "http://localhost:8080";
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


    // dataService.findProject().success(function(data){
    //   vm.project = data;
    // }).error(function(message){
    //   $log.debug(message);
    // });
    dataService.listAllProjects()
      .success(function(data){
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

    vm.openProject = function(projectId){
      $location.path('project/' + projectId);
      $log.debug("project " + projectId);
    };
    

    vm.changeToListProject = function(){
      $location.path('/');
    };

    


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
        .then(function( project ) {
          console.log("hur dur")
          vm.projects.push ( project );

          }, function() {
            vm.status = 'You cancelled the dialog.';
          });
    };


    function ProjectController(projects, $rootScope){
      $log.debug('MembersController');

      var vm = this;
      loadProjectManagers();

      vm.hide = function() {
        $mdDialog.hide();
      };

      vm.closeOk = function ( project ) {
        insertProject( project );
      }

      vm.cancel = function() {
        $mdDialog.cancel();
      };

      function insertProject ( project ) {
        $http.post( $rootScope.server + '/insertProject',project )
          .success(function( data )
          {
            
            $mdDialog.hide( data );
          }).error(function(data){
            //TODO toast. :)
            if ( data.message && data.message.indexOf("org.hibernate.exception.ConstraintViolationException" > -1 )) {
              $log.debug( "TOAST COM A MENSAGEM DE NOME INVALIDO QUE NAO E UNICO TODODODODODODODODODODODODODOD" );  
            } else {
              $log.debug( data.message );  
            }
            
            
          });
      }

      function loadProjectManagers () {
        $http.get( $rootScope.server + "/listAllUsers")
          .success( function ( data )  {
            vm.projectManagers = data;
          })
          .error ( function (data ){
            $log.debug ( data.message );
          })
      }
    }

  }


})();
