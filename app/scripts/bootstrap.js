(function () {
'use strict';

/**
 * @ngdoc overview
 * @name DomainCoder.App
 * @description
 * # domainCoderApp
 *
 * Main module of the application.
 */
var module = angular.module('DomainCoder.App', [
    'ngAnimate', 'ngCookies', 'ngResource', 'ngRoute', 'ngSanitize', 'ngTouch',
    'ui.router', 'ui.grid', 'ui.grid.selection', 'ui.grid.edit', 'ui.bootstrap','ui.tree',

    // Domain Coder
    'DomainCoder.Core', 'DomainCoder.ng.ui', 'DomainCoder.App.Main', 'DomainCoder.App.Menu',
    'DomainCoder.ng.ContextEditor',
    'DomainCoder.Project',
    // Domain Coder Entity Model
    'DomainCoder.Model.Entity', 'DomainCoder.ng.EntityEditor', 'DomainCoder.ng.ContextEntityEditor',
    // Domain Coder Conceptual Form
    'ConceptualForm.Core', 'ConceptualForm.Mapper', 'DomainCoder.ng.ConceptualFormEditor',
    // other lib
    'uuid4', 'phpmentors.directives'
]);

module.run(['$log', '$rootScope', '$state', 'AppContext', function ($log, $rootScope, $state, AppContext) {
    /**
     * register scope globals
     */
    $rootScope.AppContext = AppContext;
}]);

module.config([
    '$stateProvider', '$urlRouterProvider',
function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: 'views/app/start.html'
        })
        .state('context', {
            url: '/context/{contextId}',
            templateUrl:  'views/domain-coder/context-editor.html',
            controller: 'ContextEditor_MainCtrl'
        })
        .state('context-entity', {
            url: '/context/{contextId}/entity',
            templateUrl:  'views/domain-coder-entity/context-entity-editor.html',
            controller: 'EntityEditor_ContextEntityEditorCtrl'
        })
        .state('entity', {
            url: '/entity/{entityId}',
            templateUrl:  'views/domain-coder-entity/entity-editor.html',
            controller: 'EntityEditor_MainCtrl'
        })
        .state('context-conceptual-form', {
            url: '/context/{contextId}/conceptual-form',
            templateUrl:  'views/domain-coder-conceptual-form/editor.html',
            controller: 'ConceptualFormEditor_MainCtrl'
        })
    ;
}]);

})();
