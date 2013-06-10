/**
 * @author Terry
 */
define(["jquery", "libs/class"], function($, Class) {
    var scheme = Class.extend({
        el : undefined,
        render : undefined,
        options : {
            d : "h", //direction h:horizontal v:vertical
            sp : 0, //start position
            stepSize : 100,
            step : 10,
            unit : "px",
            isPlayback : true,
            fps : 30,
            target : "self",
            renderType : "canvas",
            hasTouch : false,
        },
        _currentIndex : 0,
        _timeoutId : undefined,
        _isPlayback : false,
        init : function(el, options) {
            this.el = el;
            this.options = $.extend({}, this.options, options);
            var scope = this, target;
            if (!$("html").hasClass("canvas")) {
                this.options.renderType = "bg";
            }

            // this.render = $("<canvas/>");
            // this.render.attr({
            // "width" : this.el.width(),
            // "height" : this.el.height()
            // });
            // this.el.append(this.render);
            // } else {
            // this.render = this.el;
            // }

            if (this.options.renderType != "canvas" || !$("html").hasClass('canvas')) {
                if (this.el.css("position") == "" || this.el.css("position") == "static") {
                    this.el.css({
                        "position" : "relative",
                        "overflow" : "hidden"
                    });
                }
                this.render = this.el.children(".wish-fill-img").css("position", "absolute");
            } else {
                this.render = this.el.children(".wish-fill-img");
            }
            this.el.css({
                "overflow" : "hidden"
            });
            if (this.options.target == "self") {
                target = this.el;
            } else {
                target = this.el.parent();
                target.children().each(function() {
                    $(this).css("pointer-events", "none");
                });
            }
            scope._update(true);
            if (this.options.hasTouch) {
                console.log(0)
                return;
            }
            target.on("mouseover", function() {
                if ($(this).hasClass('disabled')) {
                    return;
                }
                clearTimeout(scope._timeoutId);
                scope._currentIndex = 0;
                scope._isPlayback = false;
                scope._update();
            }).on("mouseleave", function() {
                if (scope.options.isPlayback) {
                    clearTimeout(scope._timeoutId);
                    scope._isPlayback = true;
                    if (scope._currentIndex > 0) {
                        scope._currentIndex--;
                        scope._update();
                    }
                }
            });
        },
        _update : function(init) {
            var scope = this;
            if (scope.options.d == "h") {
                if (this.options.renderType == "canvas") {
                    scope.render.css({
                        transform : "translate(" + ((this.options.sp + this._currentIndex * this.options.stepSize) + this.options.unit) + ",0px)",
                    });
                } else {
                    scope.render.css({
                        top : 0,
                        left : (this.options.sp + this._currentIndex * this.options.stepSize) + this.options.unit
                        // backgroundPosition : (this.options.sp +
                        // this._currentIndex * this.options.stepSize) +
                        // this.options.unit + " 0"
                    });
                }
            } else {
                if (this.options.renderType == "canvas") {
                    scope.render.css({
                        transform : "translate(0px," + ((this.options.sp + this._currentIndex * this.options.stepSize) + this.options.unit) + ")"
                    });
                } else {
                    scope.render.css({
                        left : 0,
                        top : (this.options.sp + this._currentIndex * this.options.stepSize) + this.options.unit
                        // backgroundPosition : "0 " + (this.options.sp +
                        // this._currentIndex * this.options.stepSize) +
                        // this.options.unit
                    });
                }
            }
            if (init) {
                return;
            }
            if (scope._isPlayback) {
                scope._currentIndex--;
                if (scope._currentIndex >= 0) {
                    scope._timeoutId = setTimeout(function() {
                        scope._update();
                    }, 1000 / scope.options.fps);
                }
            } else {
                scope._currentIndex++;
                if (scope._currentIndex < this.options.step) {
                    scope._timeoutId = setTimeout(function() {
                        scope._update();
                    }, 1000 / scope.options.fps);
                } else {
                    scope._currentIndex = this.options.step - 1;
                }
            }
        }
    });

    scheme.init = function(_options) {
        var options = {
            className : "hover-ani",
            hasTouch : false
        }
        options = $.extend({}, options, _options);
        $("." + options.className).each(function() {
            var $this = $(this);
            var objs = eval("(" + $this.attr("data-options") + ")");
            objs.hasTouch = options.hasTouch;
            var btn = new scheme($this, objs);
        });
    }
    return scheme;
});
