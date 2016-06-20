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

    vm.updateUser = function (user) {
      $http.post($rootScope.server + '/updateUser', user)
        .success(function (data) {

          vm.user = user;
          $rootScope.userLogged = data;
          localStorage.setItem("userLogged", angular.toJson( vm.user ) );

        })
        .error(function (data) {

          $log.debug(data.message);

        });
    }



  }


})();
