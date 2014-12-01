(function(exports) {
'use strict';

var module = angular.module('phpmentors.directives', [])
.config(function () {
});

/**
 * ==================================================================
 * directives
 * ==================================================================
 */

/**
 *  focus-on
 */
module.directive('focusOn', [
    '$timeout',
    '$log',
function($timeout, $log) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            scope.$on(attrs.focusOn, function(event) {
                $timeout(function() {
                    // TODO: なぜかフォーカスがあたらない
                    element.focus();
                });
            });
        }
    };
}]);

/**
 * raise-event
 */
module.directive('raiseEvent', [
    '$rootScope',
    '$timeout',
    '$log',
function($rootScope, $timeout, $log) {
    return {
        restrict: 'A',
        scope: {
            name: '@raiseEvent',
            argument: '=eventArg'
        },
        link: function(scope, element, attrs) {
            element.on('click', function (event) {
                $rootScope.$broadcast(scope.name, scope.argument);
            });
        }
    };
}]);

})(this);