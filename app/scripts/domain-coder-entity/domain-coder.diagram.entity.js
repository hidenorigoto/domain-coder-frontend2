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

    /**
     * 座標型
     *
     * @param x
     * @param y
     * @constructor
     */
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
        //this.pos = new Entity.Position(0,0);

        this.group = this.g.group();
        this.group.drag();

        this.baseRect = null;
        this.transform = ''
        this.elements = [];
    };

    /**
     * Paperオブジェクトを設定
     *
     * @param snapPaper
     */
    Entity.Entity.prototype.setPaper = function (snapPaper) {
        this.g = snapPaper;
        this.group = this.g.group();
        this.group.drag();
        this.group.transform(this.transform);
    };

    /**
     * 座標の保存
     */
    Entity.Entity.prototype.saveTransform = function() {
        this.transform = this.group.transform().string;
    };

    /**
     * 更新
     */
    Entity.Entity.prototype.update = function () {
        _.map(this.elements, function(element) {
            element.remove();
        });
        this.render();
    };

    /**
     *  描画
     */
    Entity.Entity.prototype.render = function () {
        var height = this.calcHeight();

        var filterRep = Snap.filter.shadow(4,4,3,"gray",0.7);
        var dropShadowFilter = this.g.filter(filterRep);

        // 背景の矩形
        var backRect = this.g.rect(0, 0, 200, height);
        backRect.attr({
            fill: '#fff',
            'fill-opacity': 1,
            stroke: '#000',
            strokeWidth: 1,
            filter: dropShadowFilter
        });
        this.group.add(backRect);
        this.elements.push(backRect);


        // エンティティ名
        var name = this.g.text(100, 17, this.entityObject.name);
        name.attr({
            textAnchor: 'middle',
            dominantBaseline:'middle',
            'font-family': 'sans-serif',
            'font-size': '16px',
            'font-weight': 'bold'
        });
        this.group.add(name);
        this.elements.push(name);

        // 区切り線
        var line = this.g.line(0, 28, 200, 28);
        line.attr({
            stroke: '#000',
            strokeWidth: 1
        });
        this.group.add(line);
        this.elements.push(line);


        // フィールド
        var y = 36;
        this.entityObject.fields.forEach(function(fieldObject) {
            var name = (fieldObject.notNull == true) ? '● ' : '◯ ';
            name += fieldObject.name;
            var field = this.g.text(5, y, name);
            field.attr({
                textAnchor: 'start',
                dominantBaseline: 'hanging',
                'font-family': 'sans-serif',
                'font-size': '12px'
            });
            if (fieldObject.primary) {
                field.attr({
                    'font-weight': 'bold',
                    'text-decoration': 'underline'
                });
            }
            this.group.add(field);
            this.elements.push(field);
            y += 20;
        }, this);

        // 一番手前に表示する矩形
        var outerRect = this.g.rect(0, 0, 200, height);
        outerRect.attr({
            fill: '#fff',
            'fill-opacity': 0,
            stroke: '#000',
            strokeWidth: 0
        });
        this.group.add(outerRect);
        this.elements.push(outerRect);

        this.baserect = outerRect;
    };


    /**
     * 親エンティティオブジェクトが同じか？
     * @param entity
     * @returns {*}
     */
    Entity.Entity.prototype.sameParent = function(entity) {
        return this.entityObject.equals(entity);
    };

    /**
     * ホバーイベントの登録
     *
     * @param f_in
     * @param f_out
     */
    Entity.Entity.prototype.registerHover = function(f_in, f_out) {
        this.baserect.hover(f_in, f_out);
    };

    /**
     * クリックイベントの登録
     *
     * @param click
     */
    Entity.Entity.prototype.registerClick = function(click) {
        this.baserect.click(click);
    };

    Entity.Entity.prototype.registerDrag = function(drag) {
        this.group.drag(drag, function(){}, function(){});
    };

    Entity.Entity.prototype.registerMouseDown = function(mousedown) {
        this.group.mousedown(mousedown);
    };
    Entity.Entity.prototype.registerMouseMove = function(mousemove) {
        this.group.mousemove(mousemove);
    };
    Entity.Entity.prototype.registerMouseUp = function(mouseup) {
        this.group.mouseup(mouseup);
    };

    /**
     * 図形に必要な高さを計算する
     */
    Entity.Entity.prototype.calcHeight = function() {
        var fieldCount = this.entityObject.fields.length;
        var height = fieldCount * 20 + 30;

        if (height < 100) {
            height = 100;
        }

        return height;
    };

    Entity.Entity.prototype.getBBox = function() {
        return this.group.getBBox();
    };


    /**
     * class Relation
     *
     * @constructor
     */
    Entity.Relation = function (relationObject, fromEntityElement, toEntityElement) {
        this.relationObject = relationObject;
        this.g = fromEntityElement.g;

        this.updateTarget(fromEntityElement, toEntityElement);

    };

    Entity.Relation.prototype.updateTarget = function(fromElement, toElement) {
        if (angular.isDefined(this.snapConnection)) this.snapConnection.remove();

        // マーカー
        if (!angular.isDefined(this.g)) return;

        var markerShapeStartMany = this.g.path("M0,0L10,5L0,10M10,5L0,5").attr({fill: 'none', stroke: 'black', strokeWidth: 0.5});
        var markerShapeEndMany = this.g.path("M10,0L0,5L10,10M00,5L100,5").attr({fill: 'none', stroke: 'black', strokeWidth: 0.5});
        var markerShapeOne = this.g.path("M0,5L10,5").attr({fill: 'none', stroke: 'black', strokeWidth: 0.5});

        this.markerStartMany = markerShapeStartMany.marker(0,0,10,10,10,5).attr({
            markerUnits: "userSpaceOnUse",
            markerWidth: 20,
            markerHeight: 20
        });
        this.markerStartOne = markerShapeOne.marker(0,0,10,10,10,5).attr({
            markerUnits: "userSpaceOnUse",
            markerWidth: 20,
            markerHeight: 20
        });
        this.markerEndMany = markerShapeEndMany.marker(0,0,10,10,0,5).attr({
            markerUnits: "userSpaceOnUse",
            markerWidth: 20,
            markerHeight: 20
        });
        this.markerEndOne = markerShapeOne.clone().marker(0,0,10,10,0,5).attr({
            markerUnits: "userSpaceOnUse",
            markerWidth: 20,
            markerHeight: 20
        });

        this.fromEntityElement = fromElement;
        this.toEntityElement = toElement;
        if (this.relationObject.valid() === true) {
            this.snapConnection = this.g.connection(this.fromEntityElement, this.toEntityElement);
        }

        this.update();
    };

    Entity.Relation.prototype.update = function() {
        this.g.connection(this.snapConnection);

        var fromMany = this.relationObject.createView(this.fromEntityElement.entityObject).from.cardinalityObject.isMany;
        var toMany = this.relationObject.createView(this.fromEntityElement.entityObject).to.cardinalityObject.isMany;

        if (fromMany === true) {
            this.snapConnection.line.attr({markerStart: this.markerStartMany});
        } else {
            this.snapConnection.line.attr({markerStart: this.markerStartOne});
        }
        if (toMany === true) {
            this.snapConnection.line.attr({markerEnd: this.markerEndMany});
        } else {
            this.snapConnection.line.attr({markerEnd: this.markerEndOne});
        }
    };

    Entity.Relation.prototype.remove = function() {
        this.snapConnection.line.remove();
    };

    /**
     * Paperオブジェクトを設定
     *
     * @param snapPaper
     */
    Entity.Relation.prototype.setPaper = function (snapPaper) {
        this.g = snapPaper;
    };

    /**
     * 座標の保存
     */
    Entity.Relation.prototype.saveTransform = function() {
    };

})(DomainCoder.Diagram.Entity = DomainCoder.Diagram.Entity || {});

exports.DomainCoder = DomainCoder;
})(this);