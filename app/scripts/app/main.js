(function(exports) {
'use strict';

/**
 * @module DomainCoder.App.Global
 */

var module = angular.module('DomainCoder.App.Main', ['DomainCoder.Core'])
.config(function () {
});

/**
 * ==================================================================
 * classes
 * ==================================================================
 */

var AppContext = function($location, $route, $log) {
    this.$location = $location;
    this.$route = $route;
    this.$log = $log;

    this.setting = {
        url: ''
    };

    this.targetContext = null;
    this.targetConcept = null;
    this.targetEntity = null;
};

AppContext.prototype = {
    goHome: function () {
        this.$location.path('/');
    },

    toBreadCrumb: function () {
        if (this.isData()) {
            var text = 'データ > ' + this.targetData.name;
            if (this.targetData.tableName !== '') {
                text += ' (' + this.targetData.tableName + ')';
            }
            return text;
        }

        return 'トップ';
    },

    changeByUrl: function ($rootScope) {
        if (angular.isDefined(this.$route.current)) {
            if (angular.isDefined(this.$route.current.params.dataId)) {
                this.targetData = _.find(DataCollection, {'id': this.$route.current.params.dataId});
                if (angular.isDefined($rootScope)) {
                    $rootScope.$broadcast('data.select.after', this.targetData);
                }
            }
        }
    },

    selectEntity: function (data) {
        this.$location.path('entity/' + data.id);
    }
};


/**
 * ==================================================================
 * services
 * ==================================================================
 */

module.factory('AppContext', ['$location', '$route', '$log', function ($location, $route, $log) {
    return new AppContext($location, $route, $log);
}]);


/**
 * ==================================================================
 * controllers
 * ==================================================================
 */
module.controller('MainCtrl', [
    '$rootScope', '$scope',
    'AppContext',
    '$injector',
function($rootScope, $scope, AppContext, $injector) {
    var $controller = $injector.get('$controller');
    /**
     * データの選択
     */
    $scope.$on('data.select', function(event, data) {
        AppContext.selectData(data);
    });
}]);

})(this);