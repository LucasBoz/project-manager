(function () {
  'use strict';

  angular
    .module('frontEnd')
    .controller('UserController', UserController);

  /** @ngInject */
  function UserController($routeParams, $mdDialog, $log, $rootScope, $http) {

    var vm = this;


    vm.listAllUsers = function () {
      $http.get($rootScope.server + "/listAllUsers")
        .success(function (data) {
          vm.users = data;
        })
        .error(function (data) {
          $log.debug(data.message);
        })
    }

    vm.listAllUsers();




    vm.removeUser = function ( user ) {

      $http.post($rootScope.server + '/removeUser', user.id)
        .success(function (data) {

          $rootScope.toast("Usuário removido com sucesso");
          $log.debug(data);

          vm.listAllUsers();


        })
        .error(function (data) {

          $rootScope.toast(data.message);

        });
    }

    vm.manageUser = function (ev, user) {

      $mdDialog.show({
          controller: InsertUserController,
          controllerAs: 'insertUserController',
          templateUrl: 'app/user/user-dialog/user-dialog.html',
          targetEvent: ev,
          clickOutsideToClose: true,
          locals: {user: angular.copy(user)}
        })
        .then(function (answer) {
          vm.listAllUsers();
        });
    };

    function InsertUserController(user) {

      var vm = this;

      vm.user = user;

      vm.hide = function () {
        $mdDialog.hide();
      };
      vm.cancel = function () {
        $mdDialog.cancel();
      };

      vm.closeOk = function (user) {
        $mdDialog.hide();
        vm.saveUser(user);

      };

      vm.saveUser = function (user) {
        if(user.id){
          vm.updateUser(user);
        }else{
          vm.insertUser(user);
        }
      };

      vm.updateUser = function (user) {
        $http.post($rootScope.server + '/updateUser', user)
          .success(function (data) {
            $rootScope.toast ("Usuário atualizado com sucesso!")
            $log.debug(data);
            vm.user = {};
            vm.listAllUsers();

          })
          .error(function (data) {
            $rootScope.toast(data.message);
            $log.debug(data.message);

          });
      };

      vm.listAllUsers = function () {
        $http.get($rootScope.server + "/listAllUsers")
          .success(function (data) {
            vm.users = data;
          })
          .error(function (data) {
            $rootScope.toast(data.message);
            $log.debug(data.message);
          })
      }

      vm.insertUser = function (newUser) {

        $http.post($rootScope.server + '/insertUser', newUser)
          .success(function (data) {
            vm.listAllUsers();
            $rootScope.toast ("Usuário cadastrado com sucesso");
            $log.debug(data);
            
            vm.newUser = {};

          })
          .error(function (data) {
            //TODO toast. :)
            $rootScope.toast( data.exception )

            $log.debug(data.message);

          });
      }

    }

  }

})();
