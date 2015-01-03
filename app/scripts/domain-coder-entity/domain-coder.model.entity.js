(function (exports) {
'use strict';

var module = angular.module('DomainCoder.Model.Entity', [])
.config(function () {
});

module.run(['$rootScope', '$state', '$log', 'emodel_EntityFactory', 'emodel_FieldFactory', 'emodel_RelationFactory',
function($rootScope, $state, $log, EntityFactory, FieldFactory, RelationFactory){
    $rootScope.$on('entity.add.request', function(event, param) {
        var entity;
        if (angular.isDefined(param)) {
            entity = EntityFactory.create(param[0], param[1]);
        } else {
            entity = EntityFactory.create(); // (1)
            $state.go('entity', {entityId: entity.id});
            $rootScope.$apply();
        }
        $rootScope.$broadcast('entity.add.after', entity);
    });
    $rootScope.$on('entity.field.add.request', function(event, param) {
        var field = FieldFactory.create(param);
        $rootScope.$broadcast('entity.field.add.after', [field.belongTo, field]);
    });
    $rootScope.$on('entity.field.remove.request', function(event, param) {
        param.entity.removeField(param.field);
    });
    $rootScope.$on('entity.relation.add.request', function(event, param) {
        var relation = RelationFactory.create(param, false, null ,false);
        $rootScope.$broadcast('entity.relation.add.after', [relation.fromEntity, relation]);
    });
    $rootScope.$on('entity.relation.remove.request', function(event, param) {
        var relation = param.relation;
        $rootScope.$broadcast('entity.relation.remove.before', [relation]);
        relation.remove();
    });
}]);


/**
 * ==================================================================
 * classes
 * ==================================================================
 */
/**
 * @namespace DomainCoder / DomainCoder.Model
 */
var DomainCoder = exports.DomainCoder || {};
DomainCoder.Model = DomainCoder.Model || {};

(function (Entity) {
    /**
     * class Entity
     *
     * @param id
     * @param name
     * @constructor
     */
    Entity.Entity = function (id, name) {
        /** @type {string} */
        this.id = id;
        /** @type {string} */
        this.name = name;
        /** @type {string} */
        this.type = {};
        /** @type {string} */
        this.tableName = '';
        /** @type {string} */
        this.description = '';
        /** @type {Array} */
        this.keys = [];
        /** @type {Array} */
        this.fields = [];
        /** @type {Array} */
        this.relations = [];
        /** @type {Array} */
        this.relationViews = [];

        this.refs = {
            contextId: []
        };
    };

    /**
     * @param {DomainCoder.Model.Entity.Entity} target
     * @returns {boolean}
     */
    Entity.Entity.prototype.equals = function (target) {
        return this.id === target.id;
    };
    /**
     * @param {DomainCoder.Model.Entity.Field} fieldObject
     */
    Entity.Entity.prototype.addField = function (fieldObject) {
        fieldObject.belongs = this;
        this.fields.push(fieldObject);
    };
    /**
     * @param {DomainCoder.Model.Entity.Field} fieldObject
     */
    Entity.Entity.prototype.removeField = function (fieldObject) {
        _.remove(this.fields, function(field) {
            return field.equals(fieldObject);
        });
    };

    /**
     * @param {DomainCoder.Model.Entity.Relation} relationObject
     */
    Entity.Entity.prototype.addRelation = function (relationObject) {
        if (angular.isDefined(_.find(this.relations, function (relation) {
                return relation.equals(relationObject)
            }))) {
            return;
        } else {
            this.relations.push(relationObject);
            this.updateRelationViews();
        }
    };
    /**
     * @param {DomainCoder.Model.Entity.Relation} relationObject
     */
    Entity.Entity.prototype.removeRelation = function(relationObject) {
        _.remove(this.relations, function (relation) {
            return relation.equals(relationObject);
        });
        this.updateRelationViews();
    };

    Entity.Entity.prototype.updateRelationViews = function() {
        var self = this;
        this.relationViews = _.map(this.relations, function (relation) {
            return relation.createView(self);
        });
    };

    /**
     * class EntityFactory
     *
     * @param uuid4
     * @param EntityCollection
     * @constructor
     */
    Entity.EntityFactory = function(uuid4, EntityCollection) {
        this._uuid4 = uuid4;
        this._EntityCollection = EntityCollection;
    };
    /**
     * @param {string} name
     * @param {DomainCoder.Core.Context} context
     * @returns {DomainCoder.Model.Entity.Entity}
     */
    Entity.EntityFactory.prototype.create = function(name, context) {
        if (!angular.isDefined(name)) {
            name = '新規エンティティ';
        }
        var entity = new DomainCoder.Model.Entity.Entity(this._uuid4.generate(), name);

        this._EntityCollection.push(entity);

        if (angular.isDefined(context)) {
            context.registerEntity(entity);
        }

        return entity;
    };

    /**
     * class EntityCollection
     * @constructor
     */
    Entity.EntityCollection = function() {};
    Entity.EntityCollection.prototype = new Array;
    /**
     * @param {string} id
     * @returns {DomainCoder.Model.Entity.Entity}
     */
    Entity.EntityCollection.prototype.get = function(id) {
        return _.find(this, {'id': id});
    };


    /**
     * class Field
     *
     * @param id
     * @param name
     * @constructor
     */
    Entity.Field = function (id, name) {
        /** @type {string} */
        this.id = id;
        /** @type {string} */
        this.name = name;
        /** @type {string} */
        this.dbName = '';
        /** @type {string} */
        this.programName = '';
        /** @type {boolean} */
        this.primary = false;
        /** @type {string} */
        this.type = {};
        /** @type {int} */
        this.size = null;
        /** @type {boolean} */
        this.notNull = false;
        /** @type {string} */
        this.description = '';

        /** @type {DomainCoder.Model.Entity.Entity} */
        this.belongTo = null;
    };

    /**
     * @param {DomainCoder.Model.Entity.Field} target
     * @returns {boolean}
     */
    Entity.Field.prototype.equals = function(target) {
        return this.id === target.id;
    };

    /**
     * class FieldFactory
     *
     * @param {string} uuid4
     * @param $log
     * @constructor
     */
    Entity.FieldFactory = function(uuid4, $log) {
        this._uuid4 = uuid4;
        this._$log = $log;
    };
    /**
     * @param {DomainCoder.Model.Entity.Entity} entity
     * @param {string} name
     * @param {DomainCoder.Core.Context} context
     * @returns {DomainCoder.Model.Entity.Field}
     */
    Entity.FieldFactory.prototype.create = function(entity, name, context) {
        if (!angular.isDefined(name)) {
            name = '新規フィールド';
        }
        var field = new DomainCoder.Model.Entity.Field(this._uuid4.generate(), name);

        entity.fields.push(field);
        field.belongTo = entity;

        return field;
    };

    /**
     * class Relation
     *
     * @param {string} id
     * @param {DomainCoder.Model.Entity.RelationTarget} relationTarget1
     * @param {DomainCoder.Model.Entity.RelationTarget} relationTarget2
     * @constructor
     */
    Entity.Relation = function (id, relationTarget1, relationTarget2) {
        /** @type {string} */
        this.id = id;
        /** @type {DomainCoder.Model.Entity.RelationTarget} */
        this._relationTarget1 = relationTarget1;
        /** @type {DomainCoder.Model.Entity.RelationTarget} */
        this._relationTarget2 = relationTarget2;
    };
    /**
     * @param {DomainCoder.Model.Entity.Relation} target
     * @returns {boolean}
     */
    Entity.Relation.prototype.equals = function (target) {
        return this.id === target.id;
    };
    /**
     * @returns {boolean}
     */
    Entity.Relation.prototype.valid = function() {
        return angular.isDefined(this._relationTarget1) && angular.isDefined(this._relationTarget2);
    };

    /**
     *
     */
    Entity.Relation.prototype.remove = function() {
        this._relationTarget1.entityObject.removeRelation(this);
        this._relationTarget2.entityObject.removeRelation(this);
    };

    /**
     * @param {DomainCoder.Model.Entity.Entity} rootEntityObject
     * @return {{from: *, to: *}}
     */
    Entity.Relation.prototype.createView = function (rootEntityObject) {
        if (rootEntityObject.equals(this._relationTarget1.entityObject)) {
            return this._createView(this._relationTarget1, this._relationTarget2);
        } else {
            return this._createView(this._relationTarget2, this._relationTarget1);
        }
    };
    /**
     *
     * @param {DomainCoder.Model.Entity.RelationTarget} from
     * @param {DomainCoder.Model.Entity.RelationTarget} to
     * @returns {{from: *, to: *}} RelationViewObject
     * @private
     */
    Entity.Relation.prototype._createView = function (from, to) {
        return {
            from: from,
            to: to,
            model: this
        };
    };
    Object.defineProperty(Entity.Relation.prototype, 'targets', {
        get: function() {
            return [this._relationTarget1, this._relationTarget2];
        }
    });

    /**
     * class RelationFactory
     *
     * @param uuid4
     * @param $log
     * @constructor
     */
    Entity.RelationFactory = function(uuid4, $log) {
        this._uuid4 = uuid4;
        this._$log = $log;
    };
    /**
     * @param {DomainCoder.Model.Entity.Entity} fromEntity
     * @param {boolean} fromMany
     * @param {DomainCoder.Model.Entity.Entity} toEntity
     * @param {boolean} toMany
     * @returns {DomainCoder.Model.Entity.Relation}
     */
    Entity.RelationFactory.prototype.create = function(fromEntity, fromMany, toEntity, toMany) {
        var target1 = new DomainCoder.Model.Entity.RelationTarget(this._uuid4.generate(),
            new DomainCoder.Model.Entity.Cardinality(this._uuid4.generate(), fromMany)
        );
        var target2 = new DomainCoder.Model.Entity.RelationTarget(this._uuid4.generate(),
            new DomainCoder.Model.Entity.Cardinality(this._uuid4.generate(), toMany)
        );
        var relation = new DomainCoder.Model.Entity.Relation(this._uuid4.generate(),
            target1, target2
        );

        target1.belongsTo = relation;
        target1.entityObject = fromEntity;
        target2.belongsTo = relation;
        target2.entityObject = toEntity;

        return relation;
    };


    /**
     * class Cardinality
     *
     * @param id
     * @param isMany
     * @constructor
     */
    Entity.Cardinality = function(id, isMany) {
        /** @type {string} */
        this.id = id;
        /** @type {boolean} */
        this.isMany = isMany = false;
    };

    /**
     * class RelationTarget
     *
     * @param {string} id
     * @param {DomainCoder.Model.Entity.Cardinality} cardinalityObject
     * @constructor
     */
    Entity.RelationTarget = function (id, cardinalityObject) {
        /** @type {string} */
        this.id = id;
        /** @type {DomainCoder.Model.Entity.Entity} @private */
        this._entityObject = null;
        /** @type {DomainCoder.Model.Entity.Cardinality} */
        this.cardinalityObject = cardinalityObject;
        /** @type {DomainCoder.Model.Entity.Relation} @private */
        this._belongsTo = null;
    };


    Object.defineProperty(Entity.RelationTarget.prototype, 'entityObject', {
        get: function() {
            return this._entityObject;
        },
        set: function(newEntityObject) {
            if (this._entityObject != null) {
                this._entityObject.removeRelation(this._belongsTo);
            }
            this._entityObject = newEntityObject;
            if (angular.isDefined(newEntityObject) && (newEntityObject !== null)) {
                newEntityObject.addRelation(this._belongsTo);
            }
        }
    });

    Object.defineProperty(Entity.RelationTarget.prototype, 'belongsTo', {
        get: function() {
            return this._belongsTo;
        },
        set: function(newRelationObject) {
            this._belongsTo = newRelationObject;
        }
    });


})(DomainCoder.Model.Entity = DomainCoder.Model.Entity || {});


/**
 * ==================================================================
 * services
 * ==================================================================
 */

module.factory('emodel_EntityFactory', ['emodel_EntityCollection', 'uuid4',
function (EntityCollection, uuid4) {
    return new DomainCoder.Model.Entity.EntityFactory(uuid4, EntityCollection);
}]);

module.factory('emodel_EntityCollection', function () {
    return new DomainCoder.Model.Entity.EntityCollection();
});

module.factory('emodel_FieldFactory', ['uuid4', '$log',
function (uuid4, $log) {
    return new DomainCoder.Model.Entity.FieldFactory(uuid4, $log);
}]);

module.factory('emodel_RelationFactory', ['uuid4', '$log',
function (uuid4, $log) {
    return new DomainCoder.Model.Entity.RelationFactory(uuid4, $log);
}]);

exports.DomainCoder = DomainCoder;
})(this);