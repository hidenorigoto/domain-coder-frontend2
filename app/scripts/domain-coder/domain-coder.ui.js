(function(exports) {
'use strict';

var module = angular.module('DomainCoder.ng.ui', ['DomainCoder.Core'])
.config(function () {
});

/**
 * ==================================================================
 * controllers
 * ==================================================================
 */

/**
 * DomainCoderUiCtrl
 * メイン コントローラ
 */
module.controller('DomainCoderUiCtrl', [
    '$scope',
    '$rootScope',
    'AppContext',
    '$log',
function($scope, $rootScope, AppContext, $log) {

    $scope.$on('data.new', function(ev) {
        //$rootScope.$broadcast('entity.select', entity);
    });

    $scope.$on('field.new', function(ev) {
        //$rootScope.$broadcast('field.select', field);
    });

    $scope.show = function(ev) {
    };
}]);

})(this);