(function() {
  'use strict';

  angular
    .module('frontEnd')
    .controller('MembersController', MembersController);

  /** @ngInject */
  function MembersController($routeParams) {
    var vm = this;


    vm.modal = "BATATA";
  }
})();
