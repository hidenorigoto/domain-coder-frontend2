(function(exports) {
'use strict';

var module = angular.module('DomainCoder.Project', [])
.config(function () {
});

// require lodash
//

module.run(['$rootScope', '$state', '$log',
    function($rootScope, $state, $log){
}]);

/**
 * ==================================================================
 * classes
 * ==================================================================
 */

/**
 * @namespace DomainCoder
 */
var DomainCoder = exports.DomainCoder || {};

(function (Project) {

    Project.Project = function() {
        /** @type {string} */
        this.name = '';
        /** @type {string} */
        this.directory = '';
    };

})(DomainCoder.Project = DomainCoder.Project || {});

/**
 * ==================================================================
 * services
 * ==================================================================
 */
module.factory('dcore_Project', [
function () {
    return new DomainCoder.Project.Project();
}]);

exports.DomainCoder = DomainCoder;
})(this);