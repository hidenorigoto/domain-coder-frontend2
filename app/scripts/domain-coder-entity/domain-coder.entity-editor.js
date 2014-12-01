(function (exports) {
'use strict';

/**
 * @module DomainCoder.ng.ui
 */

var module = angular.module('DomainCoder.ng.EntityEditor', ['DomainCoder.Core', 'DomainCoder.Model.Entity', 'DomainCoder.ng.ui', 'ui.grid', 'ui.grid.selection', 'ui.grid.edit'])
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

(function (EntityEditor) {
    /**
     * class Context
     *
     * @param EntityCollection
     * @param $state
     * @param $stateParams
     * @param $log
     * @constructor
     */
    EntityEditor.Context = function(EntityCollection, $state, $stateParams, $log) {
        this.EntityCollection = EntityCollection;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$log = $log;
    };

    EntityEditor.Context.prototype.initialize = function() {
        var entityId = this.$stateParams.entityId;
        this.current = null;
        if (angular.isDefined(entityId)) {
            this.current = this.EntityCollection.get(this.$stateParams.entityId);
            if (!angular.isDefined(this.current)) {
                this.$state.go('home');
            }
        }
    }

})(DomainCoder.EntityEditor = DomainCoder.EntityEditor || {});

/**
 * ==================================================================
 * services
 * ==================================================================
 */

/**
 * EntityEditor_Context
 * エンティティエディタ コンテキスト
 */
module.factory('EntityEditor_Context', ['emodel_EntityCollection', '$state', '$stateParams', '$log', function (EntityCollection, $state, $stateParams, $log) {
    return new DomainCoder.EntityEditor.Context(EntityCollection, $state, $stateParams, $log);
}]);

/**
 * ==================================================================
 * controllers
 * ==================================================================
 */

/**
 * EntityEditor/MainCtrl
 * エンティティエディタ メイン
 */
module.controller('EntityEditor_MainCtrl', [
    '$scope',
    '$rootScope',
    'EntityEditor_Context',
    '$timeout',
    '$log',
function($scope, $rootScope, Context, $timeout, $log) {
    if (angular.isDefined($scope.EditorContext)) {
        Context.current = $scope.EditorContext.selectedEntity;
    } else {
        Context.initialize();
    }
    $scope.current = Context.current;

    $scope.entityTypes = [
        {type:'normal', label:''},
        {type:'resource', label:'リソース'},
        {type:'event', label:'イベント'}
    ];

    $scope.$on('change.entity', function(event, entity) {
        Context.current = entity;
        $scope.current = Context.current;
        $scope.$apply();
    });

    $scope.$watch('current.name', function(newVal) {
        $scope.$emit('entity.update', $scope.current);
    });
}]);

/**
 * EntityEditor/FieldsCtrl
 * フィールド一覧
 */
module.controller('EntityEditor_FieldsCtrl', [
    '$scope',
    '$rootScope',
    '$log',
function($scope, $rootScope, $log) {
    $scope.fields = $scope.current.fields;

    $scope.dataTypes = [
        {type:'reference', label:'参照'},
        {type:'string', label:'文字列 (string)'},
        {type:'int', label:'整数 (int)'},
        {type:'date', label:'日付 (date)'},
        {type:'time', label:'時刻 (time)'},
        {type:'datetime', label:'日時 (datetime)'},
        {type:'boolean', label:'真偽値 (boolean)'},
        {type:'decimal', label:'decimal'},
        {type:'smallint', label:'整数 (smallint)'},
        {type:'float', label:'float'},
        {type:'binary', label:'binary'},
        {type:'blob', label:'blob'}
    ];

    $scope.fieldAdd = function() {
        $scope.$emit('entity.field.add.request', $scope.current);
    };
}]);


exports.DomainCoder = DomainCoder;
})(this);