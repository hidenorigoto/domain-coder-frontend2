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
        this.id = id;
        this.name = name;
        this.description = '';

        this.refs = {
            entity: []
        };

        this.diagrams = {
            entity: []
        };
    };

    Core.Context.prototype.equals = function(target) {
        return this.id === target.id;
    };
    Core.Context.prototype.registerEntity = function(entity) {
        this.refs.entity.push(entity);
    };
    Core.Context.prototype.hasEntity = function(entity) {
        return angular.isDefined(_.find(this.refs.entity, {'id': entity.id}));
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
    Core.ContextFactory.prototype.create = function (name) {
        // angular 依存
        if (!angular.isDefined(name)) {
            name = '新規コンテキスト';
        }
        var context = new DomainCoder.Core.Context(this._uuid4.generate(), name);
        this._ContextCollection.push(context);

        return context;
    };

    /**
     * class ContextCollection
     *
     * @constructor
     */
    Core.ContextCollection = function() {};
    Core.ContextCollection.prototype = new Array;
    Core.ContextCollection.prototype.get = function(id) {
        return _.find(this, {'id': id});
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