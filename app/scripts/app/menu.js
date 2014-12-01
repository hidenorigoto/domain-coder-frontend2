(function(exports) {
'use strict';

/**
 * @module DomainCoder.App.Menu
 */

var module = angular.module('DomainCoder.App.Menu', ['DomainCoder.ng.ui'])
.config(function () {
});

 /**
 * @ngdoc function
 * @name TopNavCtrl
 */
module.controller('TopNavCtrl',[
    '$scope',
    '$log',
function ($scope, $log) {
    $scope.toggleLeftMenu = function() {
    };

    $scope.showSetting = angular.bind(this, function() {
    });

    $scope.showMenu = function($event) {
    };
}]);

/**
 * @ngdoc function
 * @name LeftMenuCtrl
 */
module.controller('LeftMenuCtrl', [
    '$scope',
    '$rootScope',
    '$log',
function($scope, $rootScope, $log) {

}]);

/**
 * @ngdoc function
 * @name LeftMenuContextCtrl
 */
module.controller('LeftMenuContextCtrl', [
    '$scope',
    '$rootScope',
    'dcore_ContextCollection',
    '$log',
function($scope, $rootScope, ContextCollection, $log) {
    $scope.ContextCollection = ContextCollection;
}]);

/**
 * @ngdoc function
 * @name LeftMenuEntityCtrl
 */
module.controller('LeftMenuEntityCtrl', [
    '$scope',
    '$rootScope',
    'emodel_EntityCollection',
    '$log',
function($scope, $rootScope, EntityCollection, $log) {
    $scope.EntityCollection = EntityCollection;
}]);


})(this);