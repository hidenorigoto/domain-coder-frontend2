(function (exports) {
'use strict';

/**
 * @module DomainCoder.ng.ui
 */

var module = angular.module('DomainCoder.ng.ContextEntityEditor', ['DomainCoder.Core', 'DomainCoder.Model.Entity', 'DomainCoder.ng.ui', 'DomainCoder.ng.ContextEditor'])
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
    $scope.relationObjects = [];
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
     * 描画処理
     */
    $scope.render = function() {
        if ($scope.currentContext.diagrams.entity.length > 0) {
            _.map($scope.currentContext.diagrams.entity, function (element) {
                $scope.addEntityToDiagram(null, element);
            });

            _.map($scope.currentContext.diagrams.relation, function (element) {
                $scope.addRelationToDiagram(null, element);
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
        });

        e1.registerMouseDown(function(element, x, y) {
            $scope.updateRelationStart();
        });
        e1.registerMouseMove(function(element, x, y) {
            $scope.updateRelations();
        });
        e1.registerMouseUp(function(element, x, y) {
            $scope.updateRelationEnd();
            $scope.showEntityDetail(e1.entityObject);
        });
    };

    /**
     * 接続（リレーション）を追加する
     *
     * @param {DomainCoder.Model.Entity.Relation} relationObject
     * @param {DomainCoder.Diagram.Entity.Relation} restoreElement
     */
    $scope.addRelationToDiagram = function(relationObject, restoreElement) {
        var relationElement;
        var relationTargets;
        if (restoreElement != null) {

            relationElement = restoreElement;
            relationElement.setPaper($scope.snapPaper);
            relationTargets = restoreElement.relationObject.targets;
            $scope.relationObjects.push(relationElement);
        } else {
            relationElement = $scope.findRelation(relationObject);
            relationTargets = relationObject.targets;
        }

        var entityElement1 = $scope.findEntityElement(relationTargets[0].entityObject);
        var entityElement2 = $scope.findEntityElement(relationTargets[1].entityObject);

        if (angular.isDefined(relationElement)) {
            // リレーションを更新
            relationElement.updateTarget(entityElement1, entityElement2);
            //$scope.updateRelations();
        } else {
            if (!angular.isDefined(entityElement1) || !angular.isDefined(entityElement2)) return;
            $scope.relationObjects.push(
                new DomainCoder.Diagram.Entity.Relation(relationObject, entityElement1, entityElement2)
            );
        }
    };

    /**
     * リレーションを探す
     *
     * @param {DomainCoder.Model.Entity.Relation} relationObject
     * @returns {*}
     */
    $scope.findRelation = function(relationObject) {
        return _.find(this.relationObjects, function(element) {
            return element.relationObject.equals(relationObject);
        });
    };

    $scope.removeRelation = function(relationObject) {
        var removed = _.remove(this.relationObjects, function(element) {
            return element.relationObject.equals(relationObject);
        });
        _.map(removed, function(element) {
            element.remove();
        });
    };

    $scope.updateRelations = function(force) {
        if ($scope.update === true || force === true) {
            _.map($scope.relationObjects, function (relation) {
                relation.update();
            });
        }
    };
    $scope.updateRelationStart = function() {
        $scope.update = true;
    };
    $scope.updateRelationEnd = function() {
        $scope.update = false;
    };


    /**
     * エンティティオブジェクトのView要素を探す
     *
     * @param {DomainCoder.Model.Entity.Entity} entity
     * @returns {*}
     */
    $scope.findEntityElement = function(entity) {
        return _.find($scope.diagramObjects, function(viewElement) {
            return viewElement.sameParent(entity);
        });
    };

    //-----------------------------------------------------
    // event handler
    //-----------------------------------------------------

    /**
     * event entity.add.after
     */
    $scope.$on('entity.add.after', function(event, entity) {
        if ($scope.currentContext.hasEntity(entity) === true) {
            $scope.addEntityToDiagram(entity, null);
        }
    });

    /**
     * event entity.relation.add.after
     */
    $scope.$on('entity.relation.add.after', function(event, param) {
        var relation = param[1];
        var entity = param[0];
        if (($scope.currentContext.hasEntity(entity) === true) &&
            ($scope.currentContext.hasEntity(relation.toEntity) === true)
        ) {
            $scope.addRelationToDiagram(relation);
        }
    });
    /**
     * event entity.relation.remove.before
     */
    $scope.$on('entity.relation.remove.before', function(event, param) {
        $scope.removeRelation(param[0]);
        $timeout(function() {
            $scope.updateRelations(true);
        });
    });

    $scope.$on('relation.update', function(event, relationView) {
        if (!angular.isDefined(relationView)) return;
        if (($scope.currentContext.hasEntity(relationView.to.entityObject) === true) &&
            ($scope.currentContext.hasEntity(relationView.from.entityObject) === true)
        ) {
            $scope.addRelationToDiagram(relationView.model);
        } else {
            $scope.updateRelations(true);
        }
    });


    /**
     * event entity.update
     */
    $scope.$on('entity.update', function(event, entity) {
        _.map($scope.diagramObjects, function(element) {
            element.update();
        });
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
            _.map($scope.relationObjects, function (element) {
                element.saveTransform();
            });
            $scope.currentContext.diagrams.relation = $scope.relationObjects;
        }
    });

}]);

/**
 * EntityEditor_ContextEntityAddCtrl
 */
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
