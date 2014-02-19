/**
 * @author Terry
 */
define(["jquery", "libs/class"], function($, Class) {
    var scheme = Class.extend({
        el : undefined,
        options : {
            direction : "h", //h:horizontal v:vertical
            startPosition : 0,
            stepLength : 100,
            step : 10,
            unit : "px",
            isPlayback : true,
            fps : 30,
            target : "self"
        },
        _currentIndex : 0,
        _timeoutId : undefined,
        _isPlayback : false,
        init : function(el, options) {
            this.el = el;
            this.options = $.extend({}, this.options, options);
            var scope = this, target;
            if (this.options.target == "self") {
                target = this.el;
            } else {
                target = this.el.parent();
            }
            target.on("mouseover", function() {
                clearTimeout(scope._timeoutId);
                scope._currentIndex = 0;
                scope._isPlayback = false;
                scope._update();
            }).on("mouseleave", function() {
                if (scope.options.isPlayback) {
                    clearTimeout(scope._timeoutId);
                    scope._isPlayback = true;
                    scope._currentIndex--;
                    scope._update();
                }
            });
        },
        _update : function() {
            var scope = this;
            if (scope.options.direction == "h") {
                scope.el.css({
                    backgroundPosition : (this.options.startPosition + this._currentIndex * this.options.stepLength) + this.options.unit + " 0"
                });
            } else {
                scope.el.css({
                    backgroundPosition : "0 " + (this.options.startPosition + this._currentIndex * this.options.stepLength) + this.options.unit
                });
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
    return scheme;
});
