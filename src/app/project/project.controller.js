(function () {
  'use strict';

  angular
    .module('frontEnd')
    .controller('ProjectController', ProjectController);

  /** @ngInject */
  function ProjectController($routeParams, $mdDialog, $log, $filter, $rootScope, $http, $httpParamSerializer, dataService) {

    var vm = this;

    findProjectById($routeParams.id);
    findMilestoneByProjectId($routeParams.id);
    loadUsers();
    vm.status = [
      {
        name: 'ABERTO',
        color: 'green',
        label: "Aberto",
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

    vm.milestones = [];

    vm.project = {activities: []};

    function findMilestoneByProjectId(id) {
      $http.get($rootScope.server + "/listMilestoneByProjectId", {params: {projectId: id}})
        .success(function (data) {
          vm.milestones = data;
        })
        .error(function (data) {
          $log.debug(data.message);
        })
    }

    function loadUsers() {
      $http.get($rootScope.server + "/listAllUsers")
        .success(function (data) {
          vm.users = data;
        })
        .error(function (data) {
          $log.debug(data.message);
        })
    }




    function findProjectById(id) {
      $http.get($rootScope.server + "/findFullProjectById", {params: {'id': id}})
        .success(function (data) {
          vm.project = data;
        })
        .error(function (data) {
          $log.debug(data.message);
        })
    }

    vm.updateProjectStatus = function (project) {

      $http.post($rootScope.server + "/updateProject", project)
        .success(function (data) {
          console.log("salvou")
        })
        .error(function (data) {
          console.log("deu pau")
        })
    };


    vm.insertAnnotation = function (newAnnotation) {

      $http.get($rootScope.server + "/insertAnnotation", {params: {'annotation': newAnnotation}})
        .success(function (data) {

          vm.annotations.push(data);

        })
        .error(function (data) {
          $log.debug(data.message);
        })


    };


    vm.showInfo = function (activityId) {

       activityId = 1;

      $http.get($rootScope.server + "/listAnnotationByActivityId", {params: {'id': activityId}})
        .success(function (data) {

          vm.annotations = data;

          vm.info = true;

        })
        .error(function (data) {
          $log.debug(data.message);
        })


    };

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
        .title('Excluir Atividade')
        .content("Você realmente deseja excluir a atividade " + activity.name + "?")
        .targetEvent(ev)
        .ok('Remover')
        .cancel('Cancelar');
      $mdDialog.show(confirm).then(function () {
        $http.post($rootScope.server + "/removeActivity", activity.id)
          .success(function (data) {
            findProjectById(vm.project.id);

          })
          .error(function (data) {
            $log.debug(data.message);
          })


      });
    };

    vm.removeMilestone = function (ev, project, milestone) {
      var confirm = $mdDialog.confirm()
        .title('Excluir Milestone')
        .targetEvent(ev)
        .content('Você realmente deseja excluir o milestone ' + milestone.name + '? A exclusão apagará todas as atividades associadas.')
        .ok('Remover')
        .cancel('Cancelar');
      $mdDialog.show(confirm).then(function () {
        $http.post($rootScope.server + "/removeMilestone", milestone.id)
          .success(function (data) {
            findProjectById(project.id);
          })
          .error(function (data) {
            $log.debug(data.message);
          })

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
        .then(function (activity) {
          findProjectById(vm.project.id);
          console.log(activity);
        });
    };

    vm.updateActivity = function (activity) {

      if (!activity.milestone || !activity.milestone.id) {
        activity.milestone = null;
        activity.project = {id: vm.project.id, name: vm.project.name};
      }


      console.log(activity);
      $http.post($rootScope.server + "/updateActivity", activity)
        .success(function (data) {
          // findProjectById( vm.project.id );
          console.log("Update")
        })
        .error(function (data) {
          $log.debug(data.message);
        })
    }

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
          controllerAs: 'milestoneController',
          templateUrl: 'app/project/milestone-dialog/milestone-dialog.html',
          //parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          locals: {project: project, milestone: milestone}
        })
        .then(function (answer) {
          // findProjectById( vm.project.id );
        });
    };

    //------------
    //  DIALOG CONTROLLER
    //------------
    function MembersController(project) {
      $log.debug('MembersController');

      var vm = this;

      vm.project = project;

      vm.members = project.members;

      if (!project.members) {
        project.members = [];
      }

      listAllUsers();

      function listAllUsers() {
        $http.get($rootScope.server + "/listAllUsers")
          .success(function (data) {
            vm.users = [];
            angular.forEach(data, function (user) {

             if (!$filter('filter')(vm.members, {id: user.id})[0]) {
                vm.users.push(user);
              }

            });

          })
          .error(function (data) {
            $log.debug(data.message);
          })
      }

      vm.disabledMember = function (member) {

        if (member.id != vm.project.projectManager.id) {

          member.selected = false;

          vm.users.push(member);

          vm.members.splice(vm.members.indexOf(member), 1);

          $http.post($rootScope.server + "/updateProject", project)
            .success(function (data) {
              vm.project = data;
              console.log("salvou")
            })
            .error(function (data) {
              console.log("deu pau");
              console.log(data);
            });
        } else {
          console.log("O USUÀRIO È ADM DO SISTEMA");
        }
      };

      vm.hide = function () {
        $mdDialog.hide();
      };
      vm.cancel = function () {
        $mdDialog.cancel();
      };
      vm.answer = function () {
        $mdDialog.hide();

        angular.forEach(vm.users, function (user) {
          if (user.selected) {
            project.members.push(user);
          }
        });

        // dataService.saveProject(vm.project)
        //   .success(function (data) {
        //     vm.project = data;
        //   }).error(function (message) {
        //   $log.debug(message);
        // });

        $http.post($rootScope.server + "/updateProject", project)
          .success(function (data) {
            vm.project = data;
            console.log("salvou")
          })
          .error(function (data) {
            console.log("deu pau")
          })
      };
    }

    function ActivityController(project, activity, milestones) {
      $log.debug('ActivityController');

      var vm = this;

      loadUsers();
      vm.activity = activity;
      vm.project = project;
      vm.members = project.members;
      vm.projectMilestones = milestones;

      vm.hide = function () {
        $mdDialog.hide();
      };
      vm.cancel = function () {
        $mdDialog.cancel();
      };
      vm.closeOk = function (activity) {
        if (activity) {

          if (activity.milestone && activity.milestone.id) {
            activity.project = null;
            activity.milestone = {id: activity.milestone.id, name: activity.milestone.name};
          } else {
            activity.project = {id: project.id, name: project.name};
            activity.milestone = null;
          }

          if (activity.id) {
            console.log(activity);
            updateActivity(activity);

          } else {
            console.log(activity);
            insertActivity(activity);
          }

        } else {
          $log.debug("Atividade nula");
        }

      };

      function insertActivity(activity) {
        $http.post($rootScope.server + "/insertActivity", activity)
          .success(function (data) {
            $mdDialog.hide(data);
          })
          .error(function (data) {
            $log.debug(data.message);
          })
      }

      function updateActivity(activity) {
        $http.post($rootScope.server + "/updateActivity", activity)
          .success(function (data) {
            $mdDialog.hide(data);
          })
          .error(function (data) {
            $log.debug(data.message);
          })
      }

      //FIXME usar os membros do projeto
      function loadUsers() {
        $http.get($rootScope.server + "/listAllUsers")
          .success(function (data) {
            vm.users = data;
          })
          .error(function (data) {
            $log.debug(data.message);
          })
      }

    }

    function MilestoneController(project, milestone) {

      var vm = this;

      vm.project = {activities: []};

      vm.project = project;

      vm.milestone = milestone;

      if (milestone && milestone.id) {
        milestone.initialDate = new Date(milestone.initialDate);
        milestone.finalDate = new Date(milestone.finalDate);

      }


      vm.hide = function () {
        $mdDialog.hide();
      };
      vm.cancel = function () {
        $mdDialog.cancel();
      };

      vm.closeOk = function (milestone) {

        if (milestone) {

          milestone.project = {id: project.id, name: project.name};

          console.log(milestone.activities);

          milestone.activities = null;

          angular.forEach(vm.project.activities, function (activity) {
            if (activity.selected) {
              activity.milestone = vm.milestone;
            }
          });

          angular.forEach(vm.project.milestones, function (milestone) {
            angular.forEach(milestone.activities, function (activity) {
              if (activity.selected) {
                activity.milestone = vm.milestone;
              }
            });
          });


          if (milestone.id) {
            // update
            updateMilestone(milestone);

          } else {
            // insert
            insertMilestone(milestone);
          }

        } else {
          console.log("Milestone null");
        }


      };

      function saveActivities(data) {

        $log.debug('saveActivities');

        angular.forEach(vm.project.activities, function (activity) {
          if (activity.selected) {
            activity.selected = false;
            activity.project = null;
            activity.milestone = {id: data.id};

            $http.post($rootScope.server + "/updateActivity", activity)
              .success(function (data) {

                findProjectById(vm.project.id);

              })
              .error(function (data) {
                $log.debug(data.message);
              })
          }
        });

        angular.forEach(vm.project.milestones, function (milestone) {
          angular.forEach(milestone.activities, function (activity) {
            if (activity.selected) {
              activity.selected = false;
              activity.project = null;
              activity.milestone = {id: data.id};

              $http.post($rootScope.server + "/updateActivity", activity)
                .success(function (data) {

                  findProjectById(milestone.project.id);

                })
                .error(function (data) {
                  $log.debug(data.message);
                })

            }
          });
        });

      }

      function insertMilestone(milestone) {

        $log.debug(milestone);

        $http.post($rootScope.server + "/insertMilestone", milestone)
          .success(function (data) {
            $mdDialog.hide(data);

            saveActivities(data);

            findProjectById(data.project.id);
          })
          .error(function (data) {
            $log.debug(data.message);
          })
      }

      function updateMilestone(milestone) {

        $log.debug(milestone);

        $log.debug(angular.toJson(milestone));

        $http.post($rootScope.server + "/updateMilestone", milestone)
          .success(function (data) {
            $mdDialog.hide(data);

            saveActivities(data);

            findProjectById(milestone.project.id);

          })
          .error(function (data) {
            $log.debug(data.message);
          })
      }
    }


  }
})();
