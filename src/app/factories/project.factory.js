/**
 * Created by boz on 01/04/16.
 */

(function () {
  'use strict';

  angular
    .module('frontEnd')
    .factory('Project', Project);

  /** @ngInject */
  function Project($filter) {
    var projects = [{
      id: 1,
      name: 'proj asd'
    }, {
      id: 2,
      name: 'proj 123'
    }, {
      id: 3,
      name: 'proj asdasd'
    }];

    return {
      all: function () {
        return projects;
      },
      get: function (id) {
        return $filter('filter')(projects, {id: id});
      }
    };

  }
})();

