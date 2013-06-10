/**
 * @author Terry
 */
define(["jquery", "class", 'jquery.easing'], function($, Class) {
    var hasTouch = ("ontouchstart" in window) || window.DocumentTouch && document instanceof DocumentTouch;
    var Switch = Class.extend({
        el : undefined,
        animating : false,
        datasLen : 0,
        _holdersArray : undefined,
        currentIndex : 0,
        nextIndex : undefined,
        options : {
            direction : "h", //h:horizontal v:vertical
            subClass : "sub-holder",
            defaultIndex : 0,
            start : undefined,
            ended : undefined,
            displayType : "block"
        },
        init : function(el, options) {
            this.el = el;
            this.options = $.extend({}, this.options, options);
            this.currentIndex = this.options.defaultIndex;
            if (this.el.css("position") == "" || this.el.css("position") == "static") {
                this.el.css("position", "relative");
            }
            this.el.css("overflow", "hidden");

            this._holdersArray = this.el.children(".sub-holder");
            this.datasLen = this._holdersArray.length;

            var scope = this;
            this.el.bind('webkitTransitionEnd oTransitionEnd', function(e) {
                if ($(e.target).data("select")) {
                    scope._animateEnd();
                }
            }).bind("transitionend", function(e) {
                if ($(e.target).data("select")) {
                    scope._animateEnd();
                }
            });
        },
        prev : function() {
            var index = this.currentIndex - 1;
            if (index < 0) {
                index = this.datasLen - 1;
            }
            this.seekTo(index, "prev");
        },
        next : function() {
            var index = this.currentIndex + 1;
            if (index > this.datasLen - 1) {
                index = 0;
            }
            this.seekTo(index, "next");
        },
        seekTo : function(index, direction) {
            if (this.animating) {
                return;
            }
            if (index < 0 || index > this.datasLen - 1 || index == this.currentIndex)
                return;
            this.animating = true;
            if ( typeof this.options.start === "function") {
                this.options.start.call(this, this.currentIndex);
            }
            var scope = this;
            this.nextIndex = index;
            if (!direction) {
                if (this.currentIndex < index) {
                    direction = "next";
                } else {
                    direction = "prev";
                }
            }
            if (!$.browser.msie && false) {
                var animName = "translateY";
                if (this.options.direction == "h") {
                    animName = "translateX";
                }
                this._holdersArray.eq(this.nextIndex).css({
                    "transform" : animName + "(" + (direction == "next" ? "" : "-") + "100%)  ",
                    "z-index" : 3,
                    "display" : this.options.displayType
                });
                this._holdersArray.eq(this.currentIndex).css({
                    "transform" : animName + "(0) ",
                    "z-index" : 2,
                    "display" : this.options.displayType
                });
                setTimeout(function() {
                    scope._holdersArray.eq(scope.nextIndex).css({
                        "transform" : animName + "(0) ",
                        "transition" : "all .36s ease-in-out"
                    }).data("select", true);
                    scope._holdersArray.eq(scope.currentIndex).css({
                        "transform" : animName + "(" + (direction == "next" ? "-" : "") + "40%)  ",
                        "transition" : "all .35s ease-in-out"
                    }).data("select", false);
                }, 10);
            } else {
                if (this.options.direction == "h") {
                    this._holdersArray.eq(this.nextIndex).css({
                        "left" : (direction == "next" ? 1 : -1) * this.el.width(),
                        "z-index" : 3,
                        "display" : this.options.displayType
                    }).animate({
                        left : 0
                    }, 1050, "easeInOutExpo", function() {
                        scope._animateEnd();
                    });
                    this._holdersArray.eq(this.currentIndex).css({
                        "left" : 0,
                        "z-index" : 2,
                        "display" : this.options.displayType
                    }).animate({
                        left : (direction == "next" ? -1 : 1) * this.el.width() * 1
                    }, 1050, "easeInOutExpo");
                } else {
                    this._holdersArray.eq(this.nextIndex).css({
                        "top" : (direction == "next" ? 1 : -1) * this.el.height(),
                        "z-index" : 3,
                        "display" : this.options.displayType
                    }).animate({
                        top : 0
                    }, 1050, "easeInOutExpo", function() {
                        scope._animateEnd();
                    });
                    this._holdersArray.eq(this.currentIndex).css({
                        "top" : 0,
                        "z-index" : 2,
                        "display" : this.options.displayType

                    }).animate({
                        top : (direction == "next" ? -1 : 1) * this.el.height() * 1
                    }, 1050, "easeInOutExpo");
                }
            }
        },
        _animateEnd : function() {
            this._holdersArray.eq(this.nextIndex).css({
                "transition" : ""
            });
            this._holdersArray.eq(this.currentIndex).css({
                "transition" : "",
                "z-index" : 1,
                "display" : hasTouch ? "block" : "none"
            });
            this.animating = false;
            this.currentIndex = this.nextIndex;
            if ( typeof this.options.ended === "function") {
                this.options.ended.call(this, this.currentIndex);
            }
        }
    });
    return Switch;
});
