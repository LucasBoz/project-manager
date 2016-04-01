(function() {
  'use strict';

  angular
    .module('frontEnd')
    .config(routeConfig);

  function routeConfig($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'app/main/main.html',
        controller: 'MainController',
        controllerAs: 'main'
      })
      //.when('/project', {
      //  templateUrl: 'app/project/project.html',
      //  controller: 'ProjectController',
      //  controllerAs: 'projectController'
      //})
      .when('/project/:id', {
        templateUrl: 'app/project/project.html',
        controller: 'ProjectController',
        controllerAs: 'project'
      })
      .when('/user', {
        templateUrl: 'app/user/user.html',
        controller: 'UserController',
        controllerAs: 'user'
      })
      .otherwise({
        redirectTo: '/'
      });
  }

})();
