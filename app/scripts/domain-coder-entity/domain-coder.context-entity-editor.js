(function (exports) {
'use strict';

/**
 * @module DomainCoder.ng.ui
 */

var module = angular.module('DomainCoder.ng.ContextEntityEditor', ['DomainCoder.Core', 'DomainCoder.Model.Entity', 'DomainCoder.ng.ui', 'ui.grid.selection'])
.config(function () {
});

/**
 * ==================================================================
 * classes
 * ==================================================================
 */

/**
 * @namespace DomainCoder / DomainCoder.ContextEntityEditor
 */
var DomainCoder = exports.DomainCoder || {};

(function (ContextEntityEditor) {
    /**
     * class Context
     *
     * @param ContextCollection
     * @param $state
     * @param $stateParams
     * @param $log
     * @constructor
     */
    ContextEntityEditor.Context = function(ContextCollection, $state, $stateParams, $log) {
        this.ContextCollection = ContextCollection;
        this.$state = $state;
        this.selectedEntity = null;
        this.$stateParams = $stateParams;
        this.$log = $log;
    };

    ContextEntityEditor.Context.prototype = DomainCoder.ContextEditor.Context.prototype;

    ContextEntityEditor.Context.prototype.selectEntity = function(entity) {
        this.selectedEntity = entity;
    }

})(DomainCoder.ContextEntityEditor = DomainCoder.ContextEntityEditor || {});

/**
 * ==================================================================
 * services
 * ==================================================================
 */

/**
 * EntityEditor_Context
 * コンテキストごとエンティティエディタ コンテキスト
 */
module.factory('ContextEntityEditor_Context', ['dcore_ContextCollection', '$state', '$stateParams', '$log', function (dcore_ContextCollection, $state, $stateParams, $log) {
    return new DomainCoder.ContextEntityEditor.Context(dcore_ContextCollection, $state, $stateParams, $log);
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
module.controller('EntityEditor_ContextEntityEditorCtrl', [
    '$scope',
    '$rootScope',
    'ContextEntityEditor_Context',
    '$timeout',
    '$log',
    '$modal',
function($scope, $rootScope, EditorContext, $timeout, $log, $modal) {
    EditorContext.initialize();

    $scope.EditorContext = EditorContext;
    $scope.currentContext = EditorContext.current;
    $scope.snapPaper = Snap('#context-entity-diagram');
    $scope.diagramObjects = [];
    $scope.activeFlag = false;  // よくわからないがスコープが２つできてしまうため、有効側を判定するためのフラグ

    $timeout(function() {
        $scope.render();
    });

    /**
     * エンティティ追加ダイアログ
     */
    $scope.entityAddDialog = function () {
        var modalInstance = $modal.open({
            templateUrl: 'views/domain-coder-entity/context-entity-add.html',
            controller: 'EntityEditor_ContextEntityAddCtrl',
            scope: $scope
        });

        modalInstance.result.then(function (selectedItem) {
            if (typeof selectedItem === 'string') {
                $rootScope.$broadcast('entity.add.request', [selectedItem, $scope.currentContext]);
            } else {
                $scope.currentContext.registerEntity(selectedItem);
                $rootScope.$broadcast('entity.add.after', selectedItem);
            }
        });
    };

    /**
     * エンティティ詳細表示
     *
     * @param entity
     */
    $scope.showEntityDetail = function(entity) {
        $scope.EditorContext.selectEntity(entity);
        $timeout(function() {
            $scope.$broadcast('change.entity', entity);
            $scope.$apply();
        });
    };

    /**
     * event entity.add.after
     */
    $scope.$on('entity.add.after', function(event, entity) {
        if ($scope.currentContext.hasEntity(entity) === true) {
            $scope.addEntityToDiagram(entity, null);
        }
    });

    /**
     * event $destroy
     */
    $scope.$on('$destroy', function(event) {
        if ($scope.activeFlag) {
            _.map($scope.diagramObjects, function (element) {
                element.saveTransform();
            });
            $scope.currentContext.diagrams.entity = $scope.diagramObjects;
        }
    });

    /**
     * 描画処理
     */
    $scope.render = function() {
        if ($scope.currentContext.diagrams.entity.length > 0) {
            _.map($scope.currentContext.diagrams.entity, function (element) {
                $scope.addEntityToDiagram(null, element);
            });
        }
        //snapPaper.clear();
    };

    /**
     * アイアグラムへのエンティティ追加処理
     *
     * @param entity
     * @param restoreEntity
     */
    $scope.addEntityToDiagram = function(entity, restoreEntity) {
        var e1;
        if (restoreEntity !== null) {
            e1 = restoreEntity;
            e1.setPaper($scope.snapPaper);
        } else {
            e1 = new DomainCoder.Diagram.Entity.Entity($scope.snapPaper, entity);
        }
        $scope.diagramObjects.push(e1);
        e1.render();
        e1.registerHover(angular.bind(this, function() {
            $scope.activeFlag = true;
        }), angular.bind(this, function() {
            //$log.info('hover out');
        }));
        e1.registerClick(function(element, x, y) {
            $scope.showEntityDetail(e1.entityObject);
        });
    };

    $scope.$on('entity.update', function(event, entity) {
        _.map($scope.diagramObjects, function(element) {
            element.update();
        });
    });
}]);

module.controller('EntityEditor_ContextEntityAddCtrl', ['$scope', '$modalInstance', 'emodel_EntityCollection',
function($scope, $modalInstance, EntityCollection) {
    $scope.EntityCollection = EntityCollection;
    $scope.ok = function() {
        if ($scope.existingEntity) {
            $modalInstance.close($scope.existingEntity);
        } else {
            $modalInstance.close($scope.name);
        }
    };
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}]);

exports.DomainCoder = DomainCoder;
})(this);