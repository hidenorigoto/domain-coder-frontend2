(function (exports) {
'use strict';

var module = angular.module('DomainCoder.ng.ContextEditor', ['DomainCoder.Core', 'DomainCoder.ng.ui', 'ui.grid.selection'])
.config(function () {
});

/**
 * ==================================================================
 * classes
 * ==================================================================
 */

/**
 * @namespace DomainCoder / DomainCoder.EntityEditor
 */
var DomainCoder = exports.DomainCoder || {};

(function (ContextEditor) {
    /**
     * class Context
     *
     * @param ContextCollection
     * @param $state
     * @param $stateParams
     * @param $log
     * @constructor
     */
    ContextEditor.Context = function(ContextCollection, $state, $stateParams, $log) {
        this.ContextCollection = ContextCollection;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$log = $log;
    };

    ContextEditor.Context.prototype.initialize = function() {
        this.current = this.ContextCollection.get(this.$stateParams.contextId);
        if (!angular.isDefined(this.current)) {
            this.$state.go('home');
        }
    }
})(DomainCoder.ContextEditor = DomainCoder.ContextEditor || {});

/**
 * ==================================================================
 * services
 * ==================================================================
 */

module.factory('ContextEditor_Context', ['dcore_ContextCollection', '$state', '$stateParams', '$log',
function(dcore_ContextCollection, $state, $stateParams, $log) {
    return new DomainCoder.ContextEditor.Context(dcore_ContextCollection, $state, $stateParams, $log);
}]);

/**
 * ==================================================================
 * controllers
 * ==================================================================
 */

/**
 * ContextEditor/MainCtrl
 * コンテキストエディタ メイン
 */
module.controller('ContextEditor_MainCtrl', [
    '$scope',
    '$rootScope',
    'ContextEditor_Context',
    '$timeout',
    '$log',
function($scope, $rootScope, EditorContext, $timeout, $log) {
    EditorContext.initialize();

    $scope.EditorContext = EditorContext;
    $scope.currentContext = EditorContext.current;
}]);


exports.DomainCoder = DomainCoder;
})(this);