(function(exports) {
'use strict';

var module = angular.module('ConceptualForm.Core', [])
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

(function (Core) {

    /**
     * class Matrix
     *
     * @param rows
     * @param cols
     * @constructor
     */
    Core.Matrix = function(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.data = new Array(rows * cols);
        this.initializeAll();
    };
    Core.Matrix.prototype.rowColToIndex = function(row, col) {
        return row * this.cols + col;
    };
    Core.Matrix.prototype.initializeAll = function() {
        var self = this;
        this.data = _.map(this.data, function(element){return self.initialize(element); });
    };
    Core.Matrix.prototype.initialize = function(element) {
        return 0;
    };

    Core.Matrix.prototype.get = function(row, col) {
        return this.data[this.rowColToIndex(row, col)];
    };

    Core.Matrix.prototype.set = function(row, col, data) {
        this.data[this.rowColToIndex(row, col)] = data;
    };
    Core.Matrix.prototype.isZero = function() {

    };

    Object.defineProperty(Core.Matrix.prototype, 'isZero', {
        get: function() {
            return _.reduce(this.data, function (carry, element) {
                return carry && element.isZero
            }, true);
        }
    });


    /**
     * class TypedMatrix
     *
     * @param rows
     * @param cols
     * @param {string} className
     * @constructor
     */
    Core.TypedMatrix = function(rows, cols, className) {
        this.className = className;
        Core.Matrix.call(this, rows, cols);
    };
    inherits(Core.TypedMatrix, Core.Matrix);

    Core.TypedMatrix.prototype.initialize = function() {
        return eval("new "+this.className+"()");
    };

    /**
     * class Direction
     * @constructor
     */
    Core.Direction = function() {
        /** @type {boolean} */
        this.isZero = true;
        /** @type {DomainCoder.Model.Entity.Entity} */
        this.from = null;
        /** @type {boolean} */
        this.fromMany = false;
        /** @type {DomainCoder.Model.Entity.Entity} */
        this.to = null;
        /** @type {boolean} */
        this.toMany = false;

        /** @type {ConceptualForm.Core.Direction} */
        this.reverse = null;
    };

    Core.Direction.prototype.createReverse = function() {
        var direction = new Core.Direction();
        direction.isZero = this.isZero;
        direction.from = this.to;
        direction.fromMany = this.toMany;
        direction.to = this.from;
        direction.toMany = this.fromMany;

        direction.reverse = this;
        this.reverse = direction;

        return direction;
    };
    Core.Direction.prototype.toString = function() {
        if (this.isZero) return '0';

        var sign = 'ー';

        if (this.toMany && this.fromMany) sign = '←→';
        if (this.toMany) sign = '→';
        if (this.fromMany) sign = '←';

        return this.from.name + sign + this.to.name;
    };


    /**
     * class PathWalkMatrix
     *
     * @param {Array} entities
     * @constructor
     */
    Core.PathWalkMatrix = function(entities) {
        this.entities = entities;
        Core.TypedMatrix.call(this, entities.length, entities.length, 'ConceptualForm.Core.Direction');
    };
    inherits(Core.PathWalkMatrix, Core.TypedMatrix);

    Core.PathWalkMatrix.prototype.entityToIndex = function(targetEntity) {
        return _.findIndex(this.entities, function(entity) {
            return entity.equals(targetEntity);
        });
    };

    Core.PathWalkMatrix.prototype.getByEntity = function(rowEntity, colEntity) {
        var row = this.entityToIndex(rowEntity);
        var col = this.entityToIndex(colEntity);

        return this.get(row, col);
    };

    Core.PathWalkMatrix.prototype.directionsByEntity = function(entity) {
        var rowIndex = this.entityToIndex(entity);
        var i;
        var direction;
        var directions = [];
        for (i = 0; i < this.rows; i++) {
            direction = this.get(rowIndex, i);
            if (!direction.isZero) {
                directions.push(direction);
            }
        }

        return directions;
    };


    /**
     * class PathWalker
     *
     * @param {ConceptualForm.Core.PathWalkMatrix} matrix
     * @constructor
     */
    Core.PathWalker = function(matrix) {
        /** @type {ConceptualForm.Core.PathWalkMatrix} */
        this.matrix = angular.copy(matrix);
        /** @type {boolean} */
        this.error = false;
        /** @type {string} */
        this.errorMessage = '';
        /** @type {Array} */
        this.formViews = [];
        /** @type {Array} */
        this.checkedEntities = [];

    };

    /**
     * generate FormViews
     *
     * @param {DomainCoder.Model.Entity.Entity} startEntity
     * @returns {boolean}
     */
    Core.PathWalker.prototype.generateFormViews = function(startEntity) {

        var currentFormView = new Core.FormView();
        this.checkedEntities = [];
        this.formViews = [currentFormView];

        this._generateFormViews(startEntity, currentFormView);

        if (!this.matrix.isZero) {
            this.error = true;
            this.errorMessage = 'divided';
        }

        return this.error;
    };

    /**
     * @param startEntity
     * @param currentFormView
     * @returns {*}
     * @private
     */
    Core.PathWalker.prototype._generateFormViews = function(startEntity, currentFormView) {

        if (this.error) return;

        if (angular.isDefined(_.find(this.checkedEntities, function(entity) {return entity.equals(startEntity);}))) {
            this.error = true;
            this.errorMessage = 'loop';
            return;
        }

        var directions;
        var self = this;
        var newView;

        currentFormView.entities.push(startEntity);
        this.checkedEntities.push(startEntity);

        directions = this.matrix.directionsByEntity(startEntity);
        _.map(directions, function(direction) {
            if (direction.isZero) return;
            direction.isZero = true;
            if (direction.reverse.isZero) {
                return;
            }

            if (direction.toMany) {
                currentFormView.childDirections.push(direction);

                // 新しいフォームビュー
                newView = new Core.FormView();
                newView.parentDirection = direction.reverse;
                self.formViews.push(newView);
                self._generateFormViews(direction.to, newView);
            } else {
                // 現在のフォームビューのまま成長させる
                self._generateFormViews(direction.to, currentFormView);
            }
        });
    };

    /**
     * class FormView
     *
     * @constructor
     */
    Core.FormView = function() {
        /** @type {ConceptualForm.Core.Direction} */
        this.parentDirection = null;
        /** @type {Array} */
        this.entities = [];
        /** @type {Array} */
        this.childDirections = [];
    };

    /**
     * return text expression of its form view
     * @returns {string}
     */
    Core.FormView.prototype.toString = function() {
        var str = '';

        if (this.parentDirection !== null) {
            str += 'ある' + this.parentDirection.to.name + 'に属する';
        }

        str += _.reduce(this.entities, function(current, entity) {
            if (current != '') {current += '・';}
            return current + entity.name;
        }, '') + 'のリスト';

        return str;
    };


})(ConceptualForm.Core = ConceptualForm.Core || {});

exports.ConceptualForm = ConceptualForm;
})(this);