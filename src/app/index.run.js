(function() {
  'use strict';

  angular
    .module('frontEnd')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();
