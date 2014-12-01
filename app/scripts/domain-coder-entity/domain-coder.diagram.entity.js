(function (exports) {
'use strict';

var module = angular.module('DomainCoder.Diagram.Entity', ['DomainCoder.Model.Entity'])
.config(function () {
});

// require snapsvg

/**
 * ==================================================================
 * classes
 * ==================================================================
 */
/**
 * @namespace DomainCoder / DomainCoder.Model
 */
var DomainCoder = exports.DomainCoder || {};
DomainCoder.Diagram = DomainCoder.Diagram || {};

(function (Entity) {

    Entity.Position = function (x,y) {
        this.x = x;
        this.y = y;
    };


    /**
     * class Entity
     *
     * @constructor
     */
    Entity.Entity = function (snapPaper, entityObject) {
        this.g = snapPaper;
        this.entityObject = entityObject;
        //this.id = entityObject.id;
        this.pos = new Entity.Position(0,0);

        this.group = this.g.group();
        this.baseRect = null;
        this.transform = ''
        this.elements = [];
    };

    Entity.Entity.prototype.setPaper = function (snapPaper) {
        this.g = snapPaper;
        this.group = this.g.group();
        this.group.transform(this.transform);
    };

    Entity.Entity.prototype.saveTransform = function() {
        this.transform = this.group.transform().string;
    };

    Entity.Entity.prototype.update = function () {
        _.map(this.elements, function(element) {
            element.remove();
        });
        this.renderTexts();
    };

    Entity.Entity.prototype.render = function () {
        this.renderFrames();
        this.renderTexts();
    };

    Entity.Entity.prototype.renderFrames = function () {
        var outerRect = this.g.rect(this.pos.x, this.pos.y, 200, 100);
        outerRect.attr({
            fill: '#fff',
            "fill-opacity": 0,
            stroke: '#000',
            strokeWidth: 1
        });
        this.group.add(outerRect);
        this.baserect = outerRect;

        this.group.drag(dragmove, dragstart, dragstop);
    };

    Entity.Entity.prototype.renderTexts = function () {
        var name = this.g.text((this.pos.x*2 + 200) / 2, this.pos.y + 18, this.entityObject.name);
        name.attr({
            textAnchor:"middle",
            dominantBaseline:"middle",
            "font-family": 'monospace',
            "font-size": '16px'
        });
        this.group.prepend(name);
        this.elements.push(name);

        var line = this.g.line(this.pos.x, this.pos.y + 28, this.pos.x + 200, this.pos.y + 28);
        line.attr({
            stroke: '#000',
            strokeWidth: 1
        });
        this.group.prepend(line);
        this.elements.push(line);
    };




    Entity.Entity.prototype.registerHover = function(f_in, f_out) {
        this.baserect.hover(f_in, f_out);
    };
    Entity.Entity.prototype.registerClick = function(click) {
        this.baserect.click(click);
    }

})(DomainCoder.Diagram.Entity = DomainCoder.Diagram.Entity || {});

exports.DomainCoder = DomainCoder;
})(this);