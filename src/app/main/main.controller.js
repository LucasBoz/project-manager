(function () {
  'use strict';

  angular
    .module('frontEnd')
    .controller('MainController', MainController);

  /** @ngInject */



  function MainController($location, $mdDialog, $rootScope, $log, dataService, $mdSidenav, $http, $mdToast) {

    var vm = this;

    if(localStorage.userLogged){
      vm.isUserLogged = true;
      $rootScope.userLogged = angular.fromJson(localStorage.userLogged);

    } else {
      vm.isUserLogged = false;
      $rootScope.userLogged = {
        email : "",
        password : ""
      };
    }

    $rootScope.server = "http://localhost:8080";

    $rootScope.toast = function (text) {

      if( text.length > 1){
        var position = {
          bottom: false,
          top: true,
          left: false,
          right: true
        };
        var toastPosition = angular.extend({},position);
        var getToastPosition = function() {
          return Object.keys(toastPosition)
            .filter(function(pos) { return toastPosition[pos]; })
            .join(' ');
        };

        var pinTo = getToastPosition();
        $mdToast.show(
          $mdToast.simple()
            .textContent(text)
            .position( pinTo )
            .hideDelay(3000)
        );
      }

    };


    vm.status = [
      {
        name: 'ABERTO',
        color: 'green',
        label: "Aberto"
      },
      {
        name: 'EM_EXECUCAO',
        color: 'yellow',
        label: "Em execução"
      },
      {
        name: 'PARADO',
        color: 'orange',
        label: "Parado"
      },
      {
        name: 'CONCLUIDO',
        color: 'blue',
        label: "Concluido"
      },
      {
        name: 'CANCELADO',
        color: 'red',
        label: "Cancelado"
      }
    ];


    // dataService.findProject().success(function(data){
    //   vm.project = data;
    // }).error(function(message){
    //   $log.debug(message);
    // });
    dataService.listAllProjects()
      .success(function (data) {
        vm.projects = data;
      }).error(function (message) {
      $log.debug(message);
    });

    //vm.projects = Project.all();

    vm.openSidenav = function () {
      $log.debug("OPEN SIDENAVEE");
      $mdSidenav('left')
        .toggle();
    };

    vm.openProject = function (projectId) {
      $location.path('project/' + projectId);
      $log.debug("project " + projectId);
    };


    vm.changeToListProject = function () {
      $location.path('/');
    };

    vm.changeToListUsers = function () {
      $location.path('/users');
    };
    vm.changeToMyAccount = function () {
      $location.path('/myAccount');
    };


    vm.updateProjectStatus = function (project) {

      var oldStatus = project.status;

      var requestParams = {
        data : project,
        user : $rootScope.userLogged
      };

      $log.debug("maoe");
      console.log(project);
      $http.post($rootScope.server + "/updateProjectStatus", requestParams)
        .success(function (data) {
          $log.debug(data);
          $log.debug("salvou")
        })
        .error(function (data) {
          project.status = oldStatus;
          $rootScope.toast(data.message);
          $log.debug(data)
        })
    };



    vm.signinHandler = function () {
      if (vm.userLogged.email && vm.userLogged.password ){

        $http.post($rootScope.server + "/userLogged", vm.userLogged)
          .success(function (data) {
            vm.userLogged = data;
            localStorage.setItem("userLogged", angular.toJson(vm.userLogged));
            vm.isUserLogged = true;
            $location.path('/');

          })
          .error(function (data) {
           $rootScope.toast(data.message);
          })

      } else {
        $rootScope.toast("Email ou senha inválidos");
      }

    };

    vm.logout = function () {

      vm.isUserLogged = false;
      vm.userLogged = null;
      localStorage.removeItem("userLogged");

    };



    vm.newProjectModal = function (ev, projects) {

      $mdDialog.show({
          controller: ProjectController,
          controllerAs: 'project',
          templateUrl: 'app/main/project-dialog/project-dialog.html',
          //parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          locals: {projects: projects}
        })
        .then(function (project) {
          $log.debug("hur dur")
          if ( project != null )
          {
            vm.projects.push(project);
          }
          

        }, function () {
          vm.status = 'You cancelled the dialog.';
        });
    };


    function ProjectController(projects, $rootScope) {
      $log.debug('MembersController');

      var vm = this;

      vm.newProject = {
        projectManager : null
      }
      loadProjectManagers();

      vm.close = function () {
        $mdDialog.hide();
      };

      vm.closeOk = function (project) {
        if ( project.projectManager && !project.members || project.members == [] ) {
          project.members = [];
          if(!project.members.length){
            project.members.push(project.projectManager);
          }
        }
        insertProject(project);
      };

      vm.cancel = function () {
        $mdDialog.cancel();
      };

      function insertProject(project) {
        if(project.projectManager){

          var asd = {
            data : project,
            user : $rootScope.userLogged
          };

          $http.post($rootScope.server + '/insertProject', asd)
            .success(function (data) {

              $mdDialog.hide(data);
            }).error(function (data) {
            $rootScope.toast(data.message);
              $log.debug(data.message);

            // if (data.message && data.message.indexOf("org.hibernate.exception.ConstraintViolationException" > -1)) {
            //   $log.debug("TOAST COM A MENSAGEM DE NOME INVALIDO QUE NAO E UNICO TODODODODODODODODODODODODODOD");
            //   $rootScope.toast("Já existe um projeto com esse nome");
            // } else {
            //   $log.debug(data.message);
            // }
          });
        } else {
          $rootScope.toast("O projeto precisa de um gerente");
        }


      }

      function loadProjectManagers() {
        $http.get($rootScope.server + "/listAllUsers")
          .success(function (data) {
            vm.projectManagers = data;
            for ( var k=0; k < data.length; k++ )
            {
              if ( data[k].id == $rootScope.userLogged.id ) {
                vm.newProject.projectManager = data[k];
              }
             
            }
          })
          .error(function (data) {
            $log.debug(data.message);
          })
      }

    }



  }


})();
