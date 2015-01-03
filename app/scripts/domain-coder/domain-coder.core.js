(function(exports) {
'use strict';

var module = angular.module('DomainCoder.Core', [])
.config(function () {
});

// require lodash
//

module.run(['$rootScope', '$state', '$log', 'dcore_ContextFactory',
    function($rootScope, $state, $log, ContextFactory){
    $rootScope.$on('context.add.request', function(event) {
        var context = ContextFactory.create();
        $rootScope.$broadcast('context.add.after', context);
        $state.go('context', {contextId: context.id});
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

(function (Core) {
    /**
     * class Context
     *
     * @param id
     * @param name
     * @constructor
     */
    Core.Context = function(id, name) {
        /** @type {string} */
        this.id = id;
        /** @type {string} */
        this.name = name;
        /** @type {string} */
        this.description = '';
        /** @type {string} */
        this.purpose = '';

        /** @type {Object} */
        this.refs = {
            /** @type {Array} of {DomainCoder.Model.Entity.Entity} */
            entity: []
        };

        /** @type {Object} */
        this.diagrams = {
            /** @type {Array} */
            entity: [],
            /** @type {string} */
            entityMemo: ''
        };
    };

    /**
     * @param {DomainCoder.Core.Context} target
     * @returns {boolean}
     */
    Core.Context.prototype.equals = function(target) {
        return this.id === target.id;
    };
    /**
     * @param {DomainCoder.Model.Entity.Entity} entityObject
     */
    Core.Context.prototype.registerEntity = function(entityObject) {
        if (!angular.isDefined(entityObject)) return;
        entityObject.refs.contextId.push(this.id);
        this.refs.entity.push(entityObject);
    };
    /**
     * @param {DomainCoder.Model.Entity.Entity} entityObject
     * @returns {boolean}
     */
    Core.Context.prototype.hasEntity = function(entityObject) {
        if (entityObject === undefined) return false;
        if (entityObject === null) return false;
        return angular.isDefined(_.find(this.refs.entity, {'id': entityObject.id}));
    };


    /**
     * class ContextFactory
     *
     * @param uuid4
     * @param ContextCollection
     * @constructor
     */
    Core.ContextFactory = function(uuid4, ContextCollection) {
        this._uuid4 = uuid4;
        this._ContextCollection = ContextCollection;
    };
    /**
     * @param {string} name
     * @returns {DomainCoder.Core.Context}
     */
    Core.ContextFactory.prototype.create = function (name) {
        // angular 依存
        if (!angular.isDefined(name)) {
            name = '新規コンテキスト';
        }
        var context = new DomainCoder.Core.Context(this._uuid4.generate(), name);
        this._ContextCollection.add(context);

        return context;
    };

    /**
     * class ContextCollection
     *
     * @constructor
     */
    Core.ContextCollection = function() {};
    Core.ContextCollection.prototype.add = function(context) {
        this[context.id] = context;
    };

    /**
     * @param {string} id
     * @returns {DomainCoder.Core.Context}
     */
    Core.ContextCollection.prototype.get = function(id) {
        return this[id];
    };

})(DomainCoder.Core = DomainCoder.Core || {});

/**
 * ==================================================================
 * services
 * ==================================================================
 */

module.factory('dcore_ContextFactory', ['uuid4','dcore_ContextCollection', function(uuid4, ContextCollection) {
    return new DomainCoder.Core.ContextFactory(uuid4, ContextCollection);
}]);

module.factory('dcore_ContextCollection', function () {
    return new DomainCoder.Core.ContextCollection();
});


exports.DomainCoder = DomainCoder;
})(this);