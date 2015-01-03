(function(exports) {
'use strict';

var module = angular.module('ConceptualForm.Mapper', [])
.config(function () {
});

/**
 * ==================================================================
 * classes
 * ==================================================================
 */

/**
 * @namespace ConceptualForm
 */
var ConceptualForm = exports.ConceptualForm || {};

(function (Mapper) {

    /**
     * Domain Coder ←→ ConceptualForm マッパー
     * @constructor
     */
    Mapper.DomainCoder = function() {
    };

    /**
     * @param {Array} entities
     */
    Mapper.DomainCoder.prototype.entitiesToMatrix = function(entities) {
        var length = entities.length;
        var matrix = new ConceptualForm.Core.PathWalkMatrix(entities);

        var row, col;
        var direction;
        var self = this;
        _.map(entities, function(entity) {
            _.map(entity.relations, function(relation) {
                row = matrix.entityToIndex(relation.targets[0].entityObject);
                col = matrix.entityToIndex(relation.targets[1].entityObject);

                if (row >= 0 && col >= 0) {
                    direction = self.relationToDirection(relation);
                    matrix.set(row, col, direction);
                    matrix.set(col, row, direction.createReverse());
                }
            });
        });

        return matrix;
    };

    /**
     * Domain Coder relation to ConceptualForm direction
     * @param relation
     */
    Mapper.DomainCoder.prototype.relationToDirection = function(relation) {
        var direction = new ConceptualForm.Core.Direction();
        direction.isZero = false;
        var targets = relation.targets;
        direction.from = targets[0].entityObject;
        direction.fromMany = targets[0].cardinalityObject.isMany;
        direction.to = targets[1].entityObject;
        direction.toMany = targets[1].cardinalityObject.isMany;

        return direction;
    };

})(ConceptualForm.Mapper = ConceptualForm.Mapper || {});

exports.ConceptualForm = ConceptualForm;
})(this);