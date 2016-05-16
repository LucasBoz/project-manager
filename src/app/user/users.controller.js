(function () {
  'use strict';

  angular
    .module('frontEnd')
    .controller('UserController', UserController);

  /** @ngInject */
  function UserController($routeParams, $mdDialog, $log, $rootScope, $http, dataService) {

    var vm = this;
    listAllUsers();

    function listAllUsers() {
      $http.get($rootScope.server + "/listAllUsers")
        .success(function (data) {
          vm.users = data;
        })
        .error(function (data) {
          $log.debug(data.message);
        })
    }

    vm.insertUser = function (newUser) {

      $log.debug(angular.toJson(newUser));

      $http.post($rootScope.server + '/insertUser', newUser)
        .success(function (data) {

          vm.users.push(data);

          vm.newUser = {};

        })
        .error(function (data) {
          //TODO toast. :)

          $log.debug(data.message);

        });
    }

    vm.removeUser = function ( user ) {

      $http.post($rootScope.server + '/removeUser', user)
        .success(function (data) {

          listAllUsers();

        })
        .error(function (data) {

          $log.debug(data.message);

        });
    }


  }

})();
