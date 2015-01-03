(function (exports) {
'use strict';

/**
 * @module DomainCoder.ng.ui
 */

var module = angular.module('DomainCoder.ng.ConceptualFormEditor', ['DomainCoder.Core', 'DomainCoder.Model.Entity', 'DomainCoder.ng.ui', 'DomainCoder.ng.ContextEditor', 'ConceptualForm.Core', 'ConceptualForm.Mapper'])
.config(function () {
});

/**
 * ==================================================================
 * classes
 * ==================================================================
 */

/**
 * @namespace DomainCoder / DomainCoder.ConceptualFormEditor
 */
var DomainCoder = exports.DomainCoder || {};

(function (ConceptualFormEditor) {
    /**
     * class Context
     *
     * @param ContextCollection
     * @param $state
     * @param $stateParams
     * @param $log
     * @constructor
     */
    ConceptualFormEditor.Context = function(ContextCollection, $state, $stateParams, $log) {
        this.ContextCollection = ContextCollection;
        this.$state = $state;
        this.selectedEntity = null;
        this.$stateParams = $stateParams;
        this.$log = $log;
    };

    ConceptualFormEditor.Context.prototype = DomainCoder.ContextEditor.Context.prototype;

    ConceptualFormEditor.Context.prototype.selectEntity = function(entity) {
        this.selectedEntity = entity;
    };

})(DomainCoder.ConceptualFormEditor = DomainCoder.ConceptualFormEditor || {});

/**
 * ==================================================================
 * services
 * ==================================================================
 */

/**
 * ConceptualFormEditor_Context
 * コンテキストごと概念帳票 コンテキスト
 */
module.factory('ConceptualFormEditor_Context', ['dcore_ContextCollection', '$state', '$stateParams', '$log', function (ContextCollection, $state, $stateParams, $log) {
    return new DomainCoder.ConceptualFormEditor.Context(ContextCollection, $state, $stateParams, $log);
}]);

/**
 * ==================================================================
 * controllers
 * ==================================================================
 */

/**
 * ConceptualFormEditor/MainCtrl
 * 概念帳票エディタ メイン
 */
module.controller('ConceptualFormEditor_MainCtrl', [
    '$scope',
    '$rootScope',
    'ConceptualFormEditor_Context',
    '$timeout',
    '$log',
    '$modal',
function($scope, $rootScope, EditorContext, $timeout, $log, $modal) {
    EditorContext.initialize();

    $scope.EditorContext = EditorContext;
    $scope.currentContext = EditorContext.current;

    var mapper = new ConceptualForm.Mapper.DomainCoder();
    $scope.matrix = mapper.entitiesToMatrix(EditorContext.current.refs.entity);
}]);

/**
 * ConceptualFormEditor/SubFormsCtrl
 *
 */
module.controller('ConceptualFormEditor_SubFormsCtrl', [
    '$scope',
    '$rootScope',
    '$log',
function($scope, $rootScope, $log) {

    var walker = new ConceptualForm.Core.PathWalker($scope.matrix);
    $scope.error = walker.generateFormViews($scope.entity);
    $scope.errorMessage = walker.errorMessage;
    $scope.formViews = walker.formViews;

    $log.info($scope.formViews);
}]);


exports.DomainCoder = DomainCoder;
})(this);
