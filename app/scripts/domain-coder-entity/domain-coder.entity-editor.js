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
    };

    Object.defineProperty(EntityEditor.Context.prototype, 'inSingleMode', {
        get: function () {
            return this.$state.current.name === 'entity';
        }
    });

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
    'dcore_ContextCollection',
    '$timeout',
    '$log',
function($scope, $rootScope, EditorContext, ContextCollection, $timeout, $log) {
    if (angular.isDefined($scope.EditorContext)) {
        EditorContext.current = $scope.EditorContext.selectedEntity;
    } else {
        EditorContext.initialize();
    }
    $scope.inSingleMode = EditorContext.inSingleMode;

    $scope.current = EditorContext.current;
    $scope.ContextCollection = ContextCollection;

    $scope.entityTypes = [
        {type:'normal', label:''},
        {type:'resource', label:'リソース'},
        {type:'event', label:'イベント'}
    ];

    $scope.$on('change.entity', function(event, entity) {
        EditorContext.current = entity;
        $scope.current = EditorContext.current;
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

    $scope.fieldAdd = function() {
        $scope.$emit('entity.field.add.request', $scope.current);
    };

    $scope.$watchCollection('fields', function(newVal) {
        $scope.$emit('entity.update', $scope.current);
    });
}]);

/**
 * EntityEditor_FieldCtrl
 * 個々のフィールド
 */
module.controller('EntityEditor_FieldCtrl', [
    '$scope',
    '$rootScope',
    '$log',
function($scope, $rootScope, $log) {

    $scope.dataTypes = [
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

    $scope.fieldRemove = function(fieldObject) {
        $scope.$emit('entity.field.remove.request', {entity:$scope.current, field:fieldObject});
    };

    $scope.$watch('field.name', function(newVal) {
        $scope.$emit('entity.update', $scope.current);
    });
    $scope.$watch('field.primary', function(newVal) {
        $scope.$emit('entity.update', $scope.current);
    });
    $scope.$watch('field.notNull', function(newVal) {
        $scope.$emit('entity.update', $scope.current);
    });
}]);

/**
 * EntityEditor/RelationsCtrl
 * リレーション一覧
 */
module.controller('EntityEditor_RelationsCtrl', [
    '$scope',
    '$rootScope',
    '$log',
function($scope, $rootScope, $log) {
    //$scope.relations = $scope.current.relations;

    $scope.relationAdd = function() {
        $scope.$emit('entity.relation.add.request', $scope.current);
    };

    /*
    $scope.$watchCollection('relations', function(newVal) {
        $scope.$emit('entity.update', $scope.current);
    });
    */
}]);

/**
 * EntityEditor_RelationCtrl
 * 個々のリレーション
 */
module.controller('EntityEditor_RelationCtrl', [
    '$scope',
    '$rootScope',
    'emodel_EntityCollection',
    '$log',
function($scope, $rootScope, EntityCollection, $log) {
    $scope.targetEntities = EntityCollection;
    $scope.oneOrMany = [
        {label: '１', value: false},
        {label: '多', value: true}
    ];

    $scope.relationRemove = function(relationViewObject) {
        $scope.$emit('entity.relation.remove.request', {relation:relationViewObject.model});
    };

    $scope.$watch('relationView.to.entityObject', function(newVal) {
        $scope.$emit('relation.update', $scope.relationView);
    });
    $scope.$watch('relationView.to.cardinalityObject.isMany', function(newVal) {
        $scope.$emit('relation.update', $scope.relationView);
    });
    $scope.$watch('relationView.from.cardinalityObject.isMany', function(newVal) {
        $scope.$emit('relation.update', $scope.relationView);
    });
}]);


    exports.DomainCoder = DomainCoder;
})(this);