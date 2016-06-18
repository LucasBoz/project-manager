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
      .when('/project/:id', {
        templateUrl: 'app/project/project-index.html',
        controller: 'ProjectController',
        controllerAs: 'project'
      })
      .when('/users', {
        templateUrl: 'app/user/users.html',
        controller: 'UserController',
        controllerAs: 'userController'
      })
      .when('/authentication', {
        templateUrl: 'app/authentication/authentication.html',
        controller: 'AuthenticationController',
        controllerAs: 'authenticationController'
      })
      .otherwise({
        redirectTo: '/'
      });
  }

})();
