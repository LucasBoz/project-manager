(function () {
  'use strict';

  angular
    .module('frontEnd')
    .service('dataService', dataService);

  /** @ngInject */
  function dataService($http, $httpParamSerializer) {

    var server = "http://localhost:8080";

    //var endPoint = '/api/';
    //var endPoint = 'http://192.168.20.53:4000/';
    var endPoint = 'http://localhost:3000/app/projects.json';



      return {

        saveProject : function (project) {
          if(project.id){
            

            // http.post($rootScope.server + "/updateProject", project)
            //   .success(function (data) {
            //     console.log("salvou")
            //   })
            //   .error(function (data) {
            //     console.log("deu pau")
            //   })

          } 
        },


        // VVVVVVV BASURA

        get : function(id, table, page) {
          if(id){
            return $http.get(endPoint);
          }
          return $http({
              url: endPoint,
              method: 'GET',
              params: {
                page: page,
                limit: 10
              }
            }
          );
        },

        listAllProjects : function () {
          return $http.get('http://localhost:8080/listAllProjects');
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
