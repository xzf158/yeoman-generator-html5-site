/**
 * @author Terry
 */
define(["jquery", "libs/class", "TweenMax"], function($, Class) {

    var _defaultIndex = 1, //just for loop
    _idPrefix = undefined, isSpringback = false;
    var Slider = Class.extend({
        el : undefined,
        ul : undefined,
        viewPort : undefined,
        lis : undefined,
        liW : 0,
        liCount : 0,
        _defaultIndex : 1,
        _idPrefix : undefined,
        isSpringback : false,
        isSeek : false,
        options : {
            onceShow : 2,
            autoResize : false,
            itemWidth : -1,
            itemMargin : 0,
            animationLoop : false,
            direction : "v", //h: horizontal,v:vertical
            viewPortPosition : "relative",
            bound : false,
            start : undefined,
            ended : undefined,
            update : undefined,
            _loop : false,
            touch : true
        },
        _index : 0,
        currentIndex : 0,
        prevIndex : -1,
        currentPosition : 0,
        _prevPosition : 0,
        animating : false,
        startX : 0,
        startY : 0,
        indexChange : 0,
        _liCache : {},
        fillObj : undefined,
        init : function(el, options) {
            this.options = $.extend({}, this.options, options);
            this._idPrefix = (el.attr("id") ? el.attr("id") : "slider-" + Math.round(Math.random() * 1000)) + "-li-";
            var scope = this;
            if (this.options.autoResize) {
                $(window).resize(function() {
                    scope.resize();
                });
            }
            this.el = el;
            this.ul = this.el.children("ul");
            this.lis = this.ul.children("li").each(function(i) {
                $(this).data({
                    index : i
                }).addClass(scope._idPrefix + "item").addClass(scope._idPrefix + i).css("-webkit-backface-visibility", "hidden");
            });
            this.liCount = this.lis.length;
            this.ul.css({
                "-webkit-transform" : "translate3d(0,0,0)",
                "position" : "absolute",
                "-webkit-backface-visibility" : "hidden",
                "width" : this.liCount + "00%"
            });
            this.viewport = $("<div class='silder-holder' style='position: " + this.options.viewPortPosition + ";overflow:hidden;width:100%;top:0px;'></div>");
            this.viewport.append(this.ul).appendTo(this.el);
            if (this.options.animationLoop && this.liCount > 2 && this.options.onceShow == 1) {
                if (this.liCount >= 5) {
                    this._defaultIndex = 2;
                }
                for (var i = 0; i < this._defaultIndex; i++) {
                    this.ul.prepend(this.ul.find("." + this._idPrefix + "item:last-child"));
                }
                this.options._loop = true;
                this._seekTo(this._defaultIndex, -1);
            }
            var scope = this;
            setTimeout(function() {
                scope.resize();
            }, 100);

            var touch = ("ontouchstart" in window) || window.DocumentTouch && document instanceof DocumentTouch;
            if (touch && this.options.touch) {
                this.el.bind("touchstart", function(e) {
                    scope.touchStart(e.originalEvent);
                });
            }
        },
        getLiByIndex : function(index) {
            return this.ul.find("." + this._idPrefix + index);
        },
        resize : function() {
            if (this.options.fillObj) {
                this.viewport.height(this.options.fillObj.height());
                this.options.itemWidth = this.options.fillObj.width();
            } else if (this.el.height() > 0) {
                this.viewport.height(this.el.height());
                this.options.itemWidth = this.el.width();
            } else {
                this.viewport.height(this.ul.height());
                this.options.itemWidth = this.ul.width();
            }
            if (this.options.itemWidth > 0) {
                this.liW = this.options.itemWidth;
            } else {
                this.liW = this.el.width() / this.options.onceShow;
            }

            var scope = this;
            this.lis.each(function() {
                $(this).css({
                    width : scope.liW,
                    height : scope.viewport.height()
                });
            });
            this.currentPosition = -this._index * (this.liW + this.options.itemMargin);
            this.ul.css({
                width : this.liCount * (this.liW + this.options.itemMargin),
                left : this.currentPosition
            });
            this._prevPosition = this.currentPosition;
        },
        prev : function(t, easing) {
            if (this.animating)
                return;
            if (this.options._loop) {
                this.indexChange = -1;
                this.prevIndex = this.currentIndex;
                console.log(this.currentIndex);
                this.currentIndex--;
                //this.getLiByIndex(this.currentIndex).prev().data("index");
                // console.log(this.getLiByIndex(this.currentIndex).prev())
                if (this.currentIndex < 0) {
                    this.currentIndex = this.liCount - 1;
                }
                this._seekTo(this._defaultIndex - 1, t, easing);
            } else {
                if (this._index != 0) {
                    var seek = this.options.onceShow - this._index;
                    seek = seek < 0 ? -this.options.onceShow : -this._index;
                    this._index += seek;
                    this.currentPosition -= seek * (this.liW + this.options.itemMargin);
                    this.prevIndex = this.currentIndex;
                    this.currentIndex = this._index;
                    this.run(t, easing);
                    return;
                }
                if (this.options.animationLoop) {
                    this._index = this.liCount - this.options.onceShow;
                    this.currentPosition = -this._index * (this.liW + this.options.itemMargin);
                    this.prevIndex = this.currentIndex;
                    this.currentIndex = this._index;
                    this.run(t, easing);
                }
            }
        },
        next : function(t, easing) {
            if (this.animating)
                return;
            if (this.options._loop) {
                this.indexChange = 1;
                this.prevIndex = this.currentIndex;
                this.currentIndex++;
                if (this.currentIndex >= this.liCount) {
                    this.currentIndex = 0;
                }
                //this.getLiByIndex(this.currentIndex).next().data("index");
                this._seekTo(this._defaultIndex + 1, t, easing);
            } else {
                var seek = this.liCount - (this._index + this.options.onceShow);
                seek = seek > this.options.onceShow ? this.options.onceShow : seek;
                if (seek != 0) {
                    this._index += seek;
                    this.currentPosition -= seek * (this.liW + this.options.itemMargin);
                    this.prevIndex = this.currentIndex;
                    this.currentIndex = this._index;
                    this.run(t, easing);
                    return;
                }
                if (this.options.animationLoop) {
                    this._index = 0;
                    this.currentPosition = 0;
                    this.prevIndex = this.currentIndex;
                    this.currentIndex = this._index;
                    this.run(t, easing);
                }
            }
        },
        _seekTo : function(index, t, easing) {
            if (this.animating || this._index == index || index > this.liCount - 1)
                return;
            this.currentPosition += (this._index - index) * (this.liW + this.options.itemMargin);
            this._index = index;
            if (!this.options._loop) {
                this.prevIndex = this.currentIndex;
                this.currentIndex = index;
            }
            this.run(t, easing);
        },
        seekTo : function(index, t, easing) {
            if (!this.options._loop) {
                this._seekTo(index, t, easing);
            } else {
                this.isSeek = true;
                for (var i = 0; i < this.liCount; i++) {
                    this.ul.append(this.getLiByIndex(i));
                }
                this.ul.css("left", -this.currentIndex * (this.liW + this.options.itemMargin));
                this.currentIndex = this._index = index;
                this.currentPosition = -this.currentIndex * (this.liW + this.options.itemMargin);
                this.run(t, easing);

            }
        },
        run : function(t, easing) {
            if (t != 0) {
                t = t ? t : .8;
            }
            this.animating = true;
            var scope = this;
            if (t >= 0 && typeof this.options.start === "function") {
                this.options.start.call(this, this.currentIndex, this.prevIndex);
            }
            if (t <= 0) {
                this.ul.css("left", this.currentPosition);
                this._prevPosition = this.currentPosition;

                scope.animating = false;
                if (t == 0) {
                    if ( typeof scope.options.ended === "function") {
                        scope.options.ended.call(scope, scope.currentIndex, scope.prevIndex);
                    }
                }
                return;
            }
            var startLeft = parseFloat(this.ul.css("left"));
            TweenMax.to(this.ul[0], t, {
                left : this.currentPosition,
                ease : easing ? easing : Quad.easeInOut,
                onUpdate : function() {
                    if ( typeof scope.options.update === "function") {
                        var now = parseFloat(this.ul.css("left"));
                        var rate = Math.abs((now - scope._prevPosition) / (scope.liW + scope.options.itemMargin));
                        if (scope.isSpringback) {
                            rate = 1 - rate;
                        }
                        scope.options.update.call(scope, scope.currentIndex, scope.prevIndex, rate);
                    }
                },
                onComplete : function() {
                    scope.animating = false;
                    scope._prevPosition = scope.currentPosition;
                    if (scope.options._loop) {
                        if (!scope.isSeek) {
                            if (scope.indexChange < 0) {
                                scope.ul.prepend(scope.ul.find("." + scope._idPrefix + "item:last-child"));
                            } else if (scope.indexChange > 0) {
                                scope.ul.append(scope.ul.find("." + scope._idPrefix + "item:first-child"));
                            }
                            scope._seekTo(scope._defaultIndex, -1);
                        } else {
                            for (var i = 0; i < scope._defaultIndex; i++) {
                                scope.ul.prepend(scope.ul.find("." + scope._idPrefix + "item:last-child"));
                            }
                            for (var i = 0; i < scope.currentIndex; i++) {
                                scope.ul.append(scope.ul.find("." + scope._idPrefix + "item:first-child"));
                            }
                            scope._seekTo(scope._defaultIndex, -1);
                            scope.isSeek = false;
                        }
                    }
                    if ( typeof scope.options.ended === "function") {
                        scope.options.ended.call(scope, scope.currentIndex, scope.prevIndex);
                    }
                    scope.isSpringback = false;
                }
            });
        },
        touchStart : function(e) {
            var scope = this;
            this.startX = e.touches[0].pageX;
            this.startY = e.touches[0].pageY;
            this.el.bind("touchmove", onTouchMove);
            this.el.bind("touchend", onTouchEnd);
            var isScroll = true;
            var boundW = this.options.bound ? this.liW / 4 : 0;
            var lastDistanse;
            function onTouchMove(e) {
                if (isScroll && Math.abs(e.originalEvent.touches[0].pageY - scope.startY) > 5) {
                    onTouchEnd();
                    return true;
                }
                if (scope.animating) {
                    // onTouchEnd();
                    return;
                }

                isScroll = false;
                lastDistanse = e.originalEvent.touches[0].pageX - scope.startX;
                scope.currentPosition += lastDistanse;
                if (scope.currentPosition > boundW) {
                    scope.currentPosition = boundW;
                } else if (scope.currentPosition < -(scope.liW + scope.options.itemMargin) * (scope.liCount - scope.options.onceShow) - boundW) {
                    scope.currentPosition = -(scope.liW + scope.options.itemMargin) * (scope.liCount - scope.options.onceShow) - boundW;
                }
                scope.ul.css("left", scope.currentPosition);
                scope.startX = e.originalEvent.touches[0].pageX;
                scope.startY = e.originalEvent.touches[0].pageY;

                if ( typeof scope.options.update === "function") {
                    var index = -scope.currentPosition / (scope.liW + scope.options.itemMargin);
                    var rate = Math.abs(scope._index - index);
                    if (rate > 0) {
                        index += .5 * (index - scope._index > 0 ? 1 : -1);
                    }
                    index = scope.currentIndex + (Math.round(index) - scope._defaultIndex);
                    if (index < 0) {
                        index = index + scope.liCount;
                    } else if (index > scope.liCount - 1) {
                        index = scope.liCount - 1;
                    }
                    scope.options.update.call(scope, index, scope.currentIndex, rate);
                }
                return false;
            }

            function onTouchEnd(e) {
                scope.el.unbind("touchmove", onTouchMove);
                scope.el.unbind("touchend", onTouchEnd);
                if (e) {
                    var interval = 3000 / Math.abs(lastDistanse);
                    interval = interval > 250 ? 250 : interval;
                    interval = interval < 100 ? 100 : interval;
                    if (scope.currentPosition > 0 || scope.currentPosition < -(scope.liW + scope.options.itemMargin) * (scope.liCount - scope.options.onceShow)) {
                        interval = 250;
                    }
                    var index = -scope.currentPosition / (scope.liW + scope.options.itemMargin);
                    if (Math.abs(index - scope._index) > .15) {
                        index += .5 * (index - scope._index > 0 ? 1 : -1);
                        scope.isSpringback = false;
                    } else {
                        scope.isSpringback = true;
                    }
                    index = Math.round(index);
                    if (index < 0) {
                        index = 0;
                    } else if (index > scope.liCount - 1) {
                        index = scope.liCount - 1;
                    }
                    scope.indexChange = index - scope._index;
                    scope._index = index;
                    if (scope.options._loop) {
                        if (scope.indexChange > 0) {
                            scope.prevIndex = scope.currentIndex;
                            scope.currentIndex = scope.getLiByIndex(scope.currentIndex).next().data("index");
                        } else if (scope.indexChange < 0) {
                            scope.prevIndex = scope.currentIndex;
                            scope.currentIndex = scope.getLiByIndex(scope.currentIndex).prev().data("index");
                        }
                    } else {
                        scope.prevIndex = scope.currentIndex;
                        scope.currentIndex = scope._index;
                    }
                    scope.currentPosition = -scope._index * (scope.liW + scope.options.itemMargin);
                    scope.run(interval / 1000, Sine.easeOut);
                }
            }

        }
    });
    return Slider;
});
