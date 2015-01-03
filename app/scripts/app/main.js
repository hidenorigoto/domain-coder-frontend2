(function(exports) {
'use strict';

/**
 * @module DomainCoder.App.Global
 */

var module = angular.module('DomainCoder.App.Main', ['DomainCoder.Core'])
.config(function () {
});

/**
 * ==================================================================
 * classes
 * ==================================================================
 */

var AppContext = function($location, $route, $log) {
};


/**
 * ==================================================================
 * services
 * ==================================================================
 */

module.factory('AppContext', ['$location', '$route', '$log', function ($location, $route, $log) {
    return new AppContext($location, $route, $log);
}]);


/**
 * ==================================================================
 * controllers
 * ==================================================================
 */
module.controller('MainCtrl', [
    '$rootScope', '$scope',
    'AppContext',
    '$injector',
function($rootScope, $scope, AppContext, $injector) {
}]);

})(this);