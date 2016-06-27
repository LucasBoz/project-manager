(function () {
  'use strict';

  angular
    .module('frontEnd')
    .controller('ProjectController', ProjectController);

  /** @ngInject */
  function ProjectController($routeParams, $mdDialog, $log, $filter, $rootScope, $http,
    $scope, $compile, $timeout, uiCalendarConfig) {

    var vm = this;

    findProjectById($routeParams.id);
    findMilestoneByProjectId($routeParams.id);
    loadUsers();
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

    vm.info = false;

    vm.milestones = [];

    vm.userLogged = {
      id : 1
    };

    vm.newAnnotation = {
      note : ""
    };

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
          vm.project.oldStatus = vm.project.status;
        })
        .error(function (data) {
          $log.debug(data.message);
        })
    }

    vm.updateProjectStatus = function (project) {


      var requestParams = {
        data : project,
        user : $rootScope.userLogged
      };

      $http.post($rootScope.server + "/updateProjectStatus", requestParams)
        .success(function (data) {
          $log.debug(data);
          project.oldStatus = project.status;
          $log.debug("salvou")
        })
        .error(function (data) {
          $rootScope.toast(data.message);
          project.status = project.oldStatus;
          $log.debug(data)
        })
    };


    vm.removeAnnotation = function (annotation) {
      annotation.edit = false;
      $http.post($rootScope.server + "/removeAnnotation", annotation.id)
        .success(function (data) {
          $log.debug(data);
          vm.showInfo( vm.activityId );
        })
        .error(function (data) {
          $log.debug(data);
          $log.debug("deu pau")
        });

    };

    vm.saveAnnotation = function (annotation) {

      if(annotation.note){
        annotation = {
          id: annotation.id,
          note : annotation.note,
          activity : { id : vm.activityId},
          createdBy : {id : vm.userLogged.id}
        };




        if( !annotation.id){
          $http.post($rootScope.server + "/insertAnnotation", annotation)
            .success(function (data) {
              $log.debug(data);
              vm.showInfo( vm.activityId );
            })
            .error(function (data) {
              $log.debug(data);
              $log.debug("deu pau")
            });

        } else {
          $http.post($rootScope.server + "/updateAnnotation", annotation)
            .success(function (data) {
              $log.debug(data);
              vm.showInfo( vm.activityId );
            })
            .error(function (data) {
              $log.debug(data);
              $log.debug("deu pau")
            });
          annotation.edit = false;
        }


      } else {
        $rootScope.toast("Digite uma mensagem");
      }



    };


    vm.showInfo = function (activityId) {

      vm.newAnnotation.note = "";

      $http.get($rootScope.server + "/listAnnotationByActivityId", {params: {'id': activityId}})
        .success(function (data) {

          vm.activityId = activityId;

          vm.annotations = data;

          vm.info = true;

        })
        .error(function (data) {
          $log.debug(data.message);
        })


    };

    vm.closeInfo = function () {
      vm.info = false;
      vm.activityId = null;
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

    vm.removeActivity = function (ev, project, activity) {
      var confirm = $mdDialog.confirm()
        .title('Excluir Atividade')
        .content("Você realmente deseja excluir a atividade " + activity.name + "?")
        .targetEvent(ev)
        .ok('Remover')
        .cancel('Cancelar');
      $mdDialog.show(confirm).then(function () {
        $http.post($rootScope.server + "/removeActivity", activity.id)
          .success(function (data) {
           $log.debug(data);
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

        var requestParams = {
          data : milestone,
          user : $rootScope.userLogged
        };

        $http.post($rootScope.server + "/removeMilestone", requestParams)
          .success(function (data) {
           $log.debug(data);
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
         $log.debug(activity);
        });
    };

    vm.updateActivity = function (activity) {

      if (!activity.milestone || !activity.milestone.id) {
        activity.milestone = null;
        activity.project = {id: vm.project.id, name: vm.project.name};
      }

      var requestParams = {
        data : activity,
        user : $rootScope.userLogged
      };

     $log.debug(activity);
      $http.post($rootScope.server + "/updateActivity", requestParams)
        .success(function (data) {
         $log.debug(data);
          // findProjectById( vm.project.id );
         $log.debug("Update")
        })
        .error(function (data) {
          $log.debug(data.message);
        })
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
         $log.debug(answer);

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
         $log.debug(answer);
          // findProjectById( vm.project.id );
        });
    };

    vm.showProjectLog = function (ev, project) {

      $mdDialog.show({
          controller: LogController,
          controllerAs: 'logController',
          templateUrl: 'app/project/log-dialog/log-dialog.html',
          //parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          locals: {project: project}

        })
        .then(function (answer) {
         $log.debug(answer);

        });
    };

    function LogController(project) {

      var vm = this;

      vm.project = project;

      $http.get($rootScope.server + "/log", {params: {'id':  vm.project.id}})
        .success(function (data) {
          vm.log = data;
        })
        .error(function (data) {
          $log.debug(data.message);
        });

      vm.close = function () {
        $mdDialog.hide();
      };


    }


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
          var requestParams = {
            data : project,
            user : $rootScope.userLogged
          };
          $http.post($rootScope.server + "/updateProject", requestParams)
            .success(function (data) {
              vm.project = data;
             $log.debug("salvou")
            })
            .error(function (data) {
             $log.debug("deu pau");
             $log.debug(data);
            });
        } else {
          $rootScope.toast("O usuário é o gerente desse projeto");
          $log.debug("O usuário é o gerente desse projeto");
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
        var requestParams = {
          data : project,
          user : $rootScope.userLogged
        };
        $http.post($rootScope.server + "/updateProject",requestParams)
          .success(function (data) {
            vm.project = data;
           $log.debug("salvou")
          })
          .error(function (data) {
           $log.debug(data);
           $log.debug("deu pau")
          })
      };
    }

    function ActivityController(project, activity, milestones) {
      $log.debug('ActivityController');

      var vm = this;

      loadUsers();
      vm.activity = activity;
      if(!vm.activity){
        vm.activity = {
          activityType : 'ACTION'
        }
      }
      vm.project = project;
      vm.project.finalDate = new Date( vm.project.finalDate );
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
           $log.debug(activity);
            updateActivity(activity);

          } else {
           $log.debug(activity);
            insertActivity(activity);
          }

        } else {
          $log.debug("Atividade nula");
        }

      };

      function insertActivity(activity) {

        var requestParams = {
          data : activity,
          user : $rootScope.userLogged
        };

        $http.post($rootScope.server + "/insertActivity", requestParams)
          .success(function (data) {
            $mdDialog.hide(data);
          })
          .error(function (data) {
            $log.debug(data.message);
          })
      }

      function updateActivity(activity) {

        var requestParams = {
          data : activity,
          user : $rootScope.userLogged
        };

        $http.post($rootScope.server + "/updateActivity", requestParams)
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

      vm.project.initialDate = new Date( vm.project.initialDate );
      vm.project.finalDate = new Date( vm.project.finalDate );

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

         $log.debug(milestone.activities);

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
         $log.debug("Milestone null");
        }


      };

      function saveActivities(data) {

        $log.debug('saveActivities');

        angular.forEach(vm.project.activities, function (activity) {
          if (activity.selected) {
            activity.selected = false;
            activity.project = null;
            activity.milestone = {id: data.id};
            var requestParams = {
              data : activity,
              user : $rootScope.userLogged
            };
            $http.post($rootScope.server + "/updateActivity", requestParams)
              .success(function (data) {
               $log.debug(data);

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

              var requestParams = {
                data : activity,
                user : $rootScope.userLogged
              };

              $http.post($rootScope.server + "/updateActivity", requestParams)
                .success(function (data) {
                 $log.debug(data);

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

        var requestParams = {
          data : milestone,
          user : $rootScope.userLogged
        };

        $http.post($rootScope.server + "/insertMilestone", requestParams)
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


        var requestParams = {
          data : milestone,
          user : $rootScope.userLogged
        };

        $log.debug(milestone);

        $log.debug(angular.toJson(milestone));

        $http.post($rootScope.server + "/updateMilestone", requestParams)
          .success(function (data) {
            $mdDialog.hide(data);

            saveActivities(data);

            findProjectById(milestone.project.id);

          })
          .error(function (data) {

            $mdDialog.hide(data);
            $log.debug(data.message);
          })
      }
    }

    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $scope.changeTo = 'Hungarian';
    /* event source that pulls from google.com */
    $scope.eventSource = {

    };

$scope.manageMilestones = function () {
  for( var k=0; k < vm.milestones.length; k++) {
    var event = {
      title : vm.milestones[k].name,
      start : new Date (vm.milestones[k].initialDate),
      end: new Date (vm.milestones[k].finalDate),
      stick: true
    }
    $scope.events.push ( event );
  }
}


    /* event source that contains custom events on the scope */
    $scope.events = [

    ];
    /* event source that calls a function on every view switch */
    $scope.eventsF = function (start, end, timezone, callback) {
      var s = new Date(start).getTime() / 1000;
      var e = new Date(end).getTime() / 1000;
      var m = new Date(start).getMonth();
      var events = [{title: 'Feed Me ' + m,start: s + (50000),end: s + (100000),allDay: false, className: ['customFeed']}];
      callback(events);
    };

    $scope.calEventsExt = {

    };
    /* alert on eventClick */
    $scope.alertOnEventClick = function( date, jsEvent, view){
        $scope.alertMessage = (date.title + ' was clicked ');
    };
    /* alert on Drop */
     $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
       $scope.alertMessage = ('Event Dropped to make dayDelta ' + delta);
    };
    /* alert on Resize */
    $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
       $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
    };
    /* add and removes an event source of choice */
    $scope.addRemoveEventSource = function(sources,source) {
      var canAdd = 0;
      angular.forEach(sources,function(value, key){
        if(sources[key] === source){
          sources.splice(key,1);
          canAdd = 1;
        }
      });
      if(canAdd === 0){
        sources.push(source);
      }
    };
    /* add custom event*/
    $scope.addEvent = function() {
      $scope.events.push({
        title: 'Open Sesame',
        start: new Date(y, m, 28),
        end: new Date(y, m, 29),
        className: ['openSesame']
      });
    };
    /* remove event */
    $scope.remove = function(index) {
      $scope.events.splice(index,1);
    };
    /* Change View */
    $scope.changeView = function(view,calendar) {
      uiCalendarConfig.calendars[calendar].fullCalendar('changeView',view);
      console.log("mudou o view");
    };
    /* Change View */
    $scope.renderCalender = function(calendar) {
      $timeout(function() {
        console.log("renderizou o calendário");
        if(uiCalendarConfig.calendars[calendar]){
          uiCalendarConfig.calendars[calendar].fullCalendar('render');
        }
      });
    };
     /* Render Tooltip */
    $scope.eventRender = function( event, element, view ) {
        element.attr({'tooltip': event.title,
                      'tooltip-append-to-body': true});
        $compile(element)($scope);
    };
    /* config object */
    $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: true,
        header:{
          left: 'title',
          center: '',
          right: 'today prev,next'
        },
        eventClick: $scope.alertOnEventClick,
        eventDrop: $scope.alertOnDrop,
        eventResize: false,
        eventRender: $scope.eventRender
      }
    };

    $scope.changeLang = function() {
      if($scope.changeTo === 'Hungarian'){
        $scope.uiConfig.calendar.dayNames = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
        $scope.uiConfig.calendar.dayNamesShort = ["Vas", "Hét", "Kedd", "Sze", "Csüt", "Pén", "Szo"];
        $scope.changeTo= 'English';
      } else {
        $scope.uiConfig.calendar.dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        $scope.uiConfig.calendar.dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        $scope.changeTo = 'Hungarian';
      }
    };
    /* event sources array*/
    $scope.eventSources = [$scope.events];
    $scope.eventSources2 = [$scope.calEventsExt, $scope.eventsF, $scope.events];


  }
})();
