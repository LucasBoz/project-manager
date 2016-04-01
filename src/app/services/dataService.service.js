(function () {
  'use strict';

  angular
    .module('frontEnd')
    .service('dataService', dataService);

  /** @ngInject */
  function dataService($http, $httpParamSerializer) {

    //var endPoint = '/api/';
    //var endPoint = 'http://192.168.20.53:4000/';
    var endPoint = 'http://localhost:3000/app/projects.json';



      return {

        get : function(id, table, page) {
          if(id){
            return $http.get(endPoint + table + '/' + id);
          }
          return $http({
              url: endPoint + table,
              method: 'GET',
              params: {
                page: page,
                limit: 10
              }
            }
          );
        },

        find : function(table, args) {
          if(args == undefined)
            args = [];

          return $http({
              url: endPoint + table,
              method: 'GET',
              params: args
            }
          );
        },
        findProject : function() {

          return $http({
              url: "http://localhost:3000/app/project.json",
              method: 'GET'
            }
          );
        },

        save : function(data, table) {
          return $http({
            method: 'POST',
            url: endPoint + table,
            headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
            data: $httpParamSerializer(data)
          });
        },


        update: function(id, data, table) {
          return $http({
            method: 'PUT',
            url: endPoint + table + '/' + id,
            headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
            data: $httpParamSerializer(data)
          });
        },


        destroy : function(id, table) {
          return $http.delete(endPoint + table + '/' + id);
        }
      };
      //return resource;
    }


})();
