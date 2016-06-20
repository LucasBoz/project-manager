(function () {
  'use strict';

  angular
    .module('frontEnd')
    .controller('MyAccountController', MyAccountController);

  /** @ngInject */



  function MyAccountController($location, $mdDialog, $rootScope, $log, dataService, $mdSidenav, $http, $mdToast) {

    var vm = this;

    if(localStorage.userLogged){
      vm.isUserLogged = true;

      vm.user = angular.fromJson(localStorage.userLogged);


    }

    vm.updateUser = function () {
      $http.post($rootScope.server + '/updateUser', user)
        .success(function (data) {

          $rootScope.userLogged = data;
          localStorage.setItem("userLogged", angular.toJson(vm.userLogged ) );

        })
        .error(function (data) {

          $log.debug(data.message);

        });
    }



  }


})();
