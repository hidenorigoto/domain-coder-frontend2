(function(exports) {
'use strict';

/**
 * @module DomainCoder.App.Menu
 */

var module = angular.module('DomainCoder.App.Menu', ['DomainCoder.ng.ui', 'DomainCoder.Project'])
.config(function () {
});

 /**
 * @ngdoc function
 * @name TopNavCtrl
 */
module.controller('TopNavCtrl',[
    '$scope',
    'dcore_Project',
    '$modal',
    '$log',
function ($scope, Project, $modal, $log) {
    $scope.Project = Project;

    /**
     * プロジェクト設定 ダイアログ
     */
    $scope.projectSettingDialog = function () {
        var modalInstance = $modal.open({
            templateUrl: 'views/app/project/setting.html',
            controller: 'TopNav_ProjectSettingCtrl',
            scope: $scope
        });

        modalInstance.result.then(function (name, directory) {
            Project.name = name;
            Project.directory = directory;
        });
    };


}]);

/**
 * TopNav_ProjectSettingCtrl
 */
module.controller('TopNav_ProjectSettingCtrl', ['$scope', '$modalInstance',
function($scope, $modalInstance) {
    $scope.ok = function() {
        $modalInstance.close($scope.name, $scope.directory);
    };
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}]);



/**
 * @ngdoc function
 * @name LeftMenuCtrl
 */
module.controller('LeftMenuCtrl', [
    '$scope',
    '$rootScope',
    '$log',
function($scope, $rootScope, $log) {

}]);

/**
 * @ngdoc function
 * @name LeftMenuContextCtrl
 */
module.controller('LeftMenuContextCtrl', [
    '$scope',
    '$rootScope',
    'dcore_ContextCollection',
    '$log',
function($scope, $rootScope, ContextCollection, $log) {
    $scope.ContextCollection = ContextCollection;
}]);

/**
 * @ngdoc function
 * @name LeftMenuEntityCtrl
 */
module.controller('LeftMenuEntityCtrl', [
    '$scope',
    '$rootScope',
    'emodel_EntityCollection',
    '$log',
function($scope, $rootScope, EntityCollection, $log) {
    $scope.EntityCollection = EntityCollection;
}]);


})(this);