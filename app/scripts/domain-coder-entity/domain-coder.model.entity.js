(function (exports) {
'use strict';

var module = angular.module('DomainCoder.Model.Entity', [])
.config(function () {
});

module.run(['$rootScope', '$state', '$log', 'emodel_EntityFactory', 'emodel_FieldFactory',
function($rootScope, $state, $log, EntityFactory, FieldFactory){
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
        this.id = id;
        this.name = name;
        this.type = {};
        this.tableName = '';
        this.description = '';
        this.keys = [];
        this.fields = [];
    };

    Entity.Entity.prototype = {
        equals: function (target) {
            return this.id === target.id;
        },
        addField: function (field) {
            field.belongs = this;
            this.fields.push(field);
        }
    };

    /**
     * class EntityFactory
     *
     * @param uuid4
     * @param EntityCollection
     * @param $log
     * @constructor
     */
    Entity.EntityFactory = function(uuid4, EntityCollection, $log) {
        this._uuid4 = uuid4;
        this._EntityCollection = EntityCollection;
        this._$log = $log;
    };
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
        this.id = id;
        this.name = name;
        this.dbName = '';
        this.programName = '';
        this.primary = false;
        this.type = {};
        this.size = null;
        this.notNull = false;
        this.description = '';

        this.referenceField = null;
        this.belongTo = null;
    };

    Entity.Field.prototype = {
        equals: function (target) {
            return this.id === target.id;
        }
    };

    /**
     * class FieldFactory
     *
     * @param uuid4
     * @param $log
     * @constructor
     */
    Entity.FieldFactory = function(uuid4, $log) {
        this._uuid4 = uuid4;
        this._$log = $log;
    };
    Entity.FieldFactory.prototype.create = function(entity, name, context) {
        if (!angular.isDefined(name)) {
            name = '新規フィールド';
        }
        var field = new DomainCoder.Model.Entity.Field(this._uuid4.generate(), name);

        entity.fields.push(field);
        field.belongTo = entity;

        return field;
    };


})(DomainCoder.Model.Entity = DomainCoder.Model.Entity || {});


/**
 * ==================================================================
 * services
 * ==================================================================
 */

module.factory('emodel_EntityFactory', ['emodel_EntityCollection', 'uuid4', '$log',
function (EntityCollection, uuid4, $log) {
    return new DomainCoder.Model.Entity.EntityFactory(uuid4, EntityCollection, $log);
}]);

module.factory('emodel_EntityCollection', function () {
    return new DomainCoder.Model.Entity.EntityCollection();
});

module.factory('emodel_FieldFactory', ['uuid4', '$log',
function (uuid4, $log) {
    return new DomainCoder.Model.Entity.FieldFactory(uuid4, $log);
}]);

exports.DomainCoder = DomainCoder;
})(this);