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
      $rootScope.userLogged = {
        id : localStorage.userLogged,
        email : "eeee",
        password : "123"
      };

    } else {
      vm.isUserLogged = false;
      $rootScope.userLogged = {
        email : "",
        password : ""
      };
    }

    $rootScope.server = "http://localhost:8080";

    $rootScope.showSimpleToast = function (text) {
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


    vm.updateProjectStatus = function (project) {
      $log.debug("maoe");
      $http.post($rootScope.server + "/updateProject", project)
        .success(function (data) {
          $log.debug(data);
          $log.debug("salvou")
        })
        .error(function (data) {
          $log.debug(data)
        })
    };



    vm.signinHandler = function () {
      if (vm.userLogged.email && vm.userLogged.password ){

        $http.post($rootScope.server + "/userLogged", vm.userLogged)
          .success(function (data) {
            vm.userLogged = data;
            localStorage.setItem("userLogged", vm.userLogged.id);
            vm.isUserLogged = true;
            $location.path('/');

          })
          .error(function (data) {
           $rootScope.showSimpleToast(data.message);
          })

      } else {
        $rootScope.showSimpleToast("Email ou senha inválidos");
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
          vm.projects.push(project);

        }, function () {
          vm.status = 'You cancelled the dialog.';
        });
    };


    function ProjectController(projects, $rootScope) {
      $log.debug('MembersController');

      var vm = this;
      loadProjectManagers();

      vm.hide = function () {
        $mdDialog.hide();
      };

      vm.closeOk = function (project) {
        if ( !project.members ) {
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
          $http.post($rootScope.server + '/insertProject', project)
            .success(function (data) {

              $mdDialog.hide(data);
            }).error(function (data) {
              $rootScope.showSimpleToast(data.message);
              $log.debug(data.message);

            // if (data.message && data.message.indexOf("org.hibernate.exception.ConstraintViolationException" > -1)) {
            //   $log.debug("TOAST COM A MENSAGEM DE NOME INVALIDO QUE NAO E UNICO TODODODODODODODODODODODODODOD");
            //   $rootScope.showSimpleToast("Já existe um projeto com esse nome");
            // } else {
            //   $log.debug(data.message);
            // }
          });
        } else {
          $rootScope.showSimpleToast("O projeto precisa de um gerente");
        }

      }

      function loadProjectManagers() {
        $http.get($rootScope.server + "/listAllUsers")
          .success(function (data) {
            vm.projectManagers = data;
          })
          .error(function (data) {
            $log.debug(data.message);
          })
      }

    }



  }


})();
