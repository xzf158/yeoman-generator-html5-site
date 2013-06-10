/**
 * @author Terry
 */

define(["jquery", "jquery.easing", "browser.animation"], function($) {
    var scheme = {}, scrollPageIntervalId, eventObj = $({}), dataStore = {};
    scheme.stageW = 0;
    scheme.stageH = 0;
    scheme.scrollHeight = 0;
    scheme.targetTop = 0;
    scheme.currentTop = 0;
    scheme.$window = undefined;
    scheme.$body = undefined;
    scheme.$document = undefined;
    scheme.isDragScroll = false;
    scheme.isAnimate = false;
    scheme.tmpScroll = undefined;
    scheme.hasTouch = ("ontouchstart" in window) || (window.DocumentTouch && document instanceof DocumentTouch) || navigator.msMaxTouchPoints > 0;
    scheme.scaleRate = 1;
    scheme.ie8 = $.browser.msie && $.browser.version == "8.0";
    scheme.ie9 = $.browser.msie && $.browser.version == "9.0";
    scheme.isIpad = navigator.userAgent.match(/iPad/i) != null;
    scheme.isAndroid = navigator.userAgent.match(/Android/i) != null;
    scheme.currentPath = undefined;
    scheme.supportVideo = !!document.createElement("video").canPlayType;

    if (scheme.isIpad) {
        scheme.isTablet = true;
    } else if (scheme.isAndroid) {
        if (navigator.userAgent.match(/Mobile/i) != null) {
            scheme.isTablet = false;
        } else {
            scheme.isTablet = true;
        }
    } else {
        scheme.isTablet = false;
    }
    scheme.isMobile = navigator.userAgent.match(/Android|webOS|iPhone|iPod|BlackBerry|IEMobile/i) != null;
    if (scheme.isTablet) {
        scheme.isMobile = false;
    }
    scheme.isFullScreen = false;
    scheme.options = {
        mousewheel : false,
        spring : 0.2,
        useAddress : false
    }

    var throttle = function(fn, delay, mustRunDelay) {
        var timer = null;
        var t_start;
        return function() {
            var context = this, args = arguments, t_curr = +new Date();
            clearTimeout(timer);
            if (!t_start) {
                t_start = t_curr;
            }
            if (t_curr - t_start >= mustRunDelay) {
                fn.apply(context, args);
                t_start = t_curr;
            } else {
                timer = setTimeout(function() {
                    fn.apply(context, args);
                }, delay);
            }
        };
    };

    var timeoutId, resizeUpdateList = [], scrollUpdateList = [], addressChangeList = [];
    scheme.init = function(options) {
        scheme.options = $.extend({}, scheme.options, options);
        scheme.$body = $('body, html');
        scheme.$document = $(document);
        var updateResize = throttle(function() {
            isEnd = true;
            scheme.refresh(isEnd);
        }, 200, 1000);
        scheme.$window = $(window).resize(function() {
            scheme.refresh(false);
            clearTimeout(timeoutId);
            timeoutId = setTimeout(function() {
                scheme.refresh(true);
            }, 400);
        });
        scheme.refresh(true);

        if (scheme.options.useAddress) {
            require(["jquery.address"], function() {
                $.address.init(function(event) {
                    addressChange("init", event.value);
                }).internalChange(function(event) {
                    addressChange("internal", event.value);
                }).externalChange(function(event) {
                    addressChange("external", event.value);
                });
            });

            scheme.$window.on("popstate", function() {
                scheme.$document.on("scroll", noScrollOnce);
            });

            function noScrollOnce(event) {
                scheme.$document.scrollTop(scheme.currentTop);
                scheme.$document.off("scroll", noScrollOnce);
                return false;
            }

            function addressChange(state, path) {
                if (path.indexOf("/") == 0) {
                    path = path.substr(1, path.length - 1)
                }
                for (var i = 0, il = addressChangeList.length; i < il; i++) {
                    var update = addressChangeList[i];
                    if ( typeof update === "function") {
                        update.call(this, state, path);
                    }
                }
                scheme.currentPath = path;
            }

        }
        scheme.$window.scroll(function(e) {
            if (scheme.isDragScroll) {
                scheme.targetTop = $(this).scrollTop();
            }
            if (!scheme.options.mousewheel) {
                scheme.targetTop = scheme.currentTop = $(this).scrollTop();
                for (var i = 0, il = scrollUpdateList.length; i < il; i++) {
                    var update = scrollUpdateList[i];
                    if ( typeof update === "function") {
                        update.call(this, scheme.currentTop);
                    } else if ( typeof update.callback === "function") {
                        update.callback.call(update.scope ? update.scope : this, scheme.currentTop);
                    }
                }
            }
        });

        if (scheme.options.mousewheel && !scheme.ie8 && !scheme.hasTouch) {
            scheme.targetTop = scheme.$document.scrollTop();
            initMouseWheel();
            animationLoop();
            scheme.tmpScroll = $("<div/>");
        }

        scheme.currentTop = scheme.targetTop = scheme.$document.scrollTop();
    }

    scheme.refresh = function(isEnd) {
        scheme.stageW = scheme.$window.width();
        scheme.stageH = scheme.$window.height();
        scheme.currentTop = scheme.targetTop = scheme.$document.scrollTop();
        scheme.scrollHeight = document.documentElement.scrollHeight - scheme.stageH;
        for (var i = 0, il = resizeUpdateList.length; i < il; i++) {
            var update = resizeUpdateList[i];
            if ( typeof update === "function") {
                update.call(this, isEnd);
            } else if ( typeof update.callback === "function") {
                update.callback.call(update.scope ? update.scope : this, isEnd);
            }
        }
    }

    scheme.on = function(name, callback) {
        eventObj.on(name, callback);
    }

    scheme.off = function(name, callback) {
        eventObj.off(name, callback);
    }

    scheme.trigger = function(name, data) {
        eventObj.trigger(name, data);
    }

    scheme.data = function(name, data) {
        if (data != undefined) {
            if (data.length == 0) {
                delete dataStore[name];
            } else {
                dataStore[name] = data;
            }
            return scheme;
        } else {
            return dataStore[name];
        }
    }
    /**
     * Add Resize function to a list
     * @param {Object} update, function or object
     * object:{scope: obj,callback:function }
     */
    scheme.resize = function(update) {
        resizeUpdateList.push(update);
    }
    /**
     * Add scroll function to a list
     * @param {Object} update, function or object
     * object:{scope: obj,callback:function }
     */
    scheme.scroll = function(update) {
        scrollUpdateList.push(update);
    }
    /**
     * Add address change function to a list
     * @param {Object} update, function(state,path)
     */
    scheme.addressChange = function(update) {
        addressChangeList.push(update);
    }

    scheme.addressTo = function(path) {
        if ($.address) {
            $.address.value(path);
        }
    }

    scheme.scrollTo = function(value, d) {
        if (value == scheme.targetTop && scheme.options.mousewheel)
            return;
        scheme.isAnimate = true;
        scheme.isDragScroll = false;
        scheme.$body.stop();
        if (scheme.tmpScroll) {
            scheme.tmpScroll.stop();
        }
        if (scheme.hasTouch || scheme.ie8) {
            scheme.$body.animate({//can not used $document on IE8
                scrollTop : value
            }, d ? d : 900, 'easeInOutQuart', function() {
                scheme.isAnimate = false;
            });
        } else {
            if (scheme.options.mousewheel) {
                scheme.tmpScroll.css("top", scheme.currentTop);
                scheme.tmpScroll.animate({
                    top : value,
                }, {
                    duration : d ? d : 900,
                    step : function(now, fx) {
                        scheme.isDragScroll = false;
                        scheme.targetTop = parseInt(now);
                    },
                    easing : "easeInOutQuart",
                    complete : function() {
                        scheme.isAnimate = false;
                    }
                });
            }
        }
    }
    function initMouseWheel() {
        var mousewheel = $.browser.mozilla ? "DOMMouseScroll" : "mousewheel";
        scheme.$body.on(mousewheel, function(e) {
            if (scheme.isFullScreen)
                return false;
            scheme.isDragScroll = false;
            if (scheme.isAnimate) {
                scheme.tmpScroll.stop();
                scheme.$body.stop();
                scheme.isAnimate = false;
            }
            if ($.browser.mozilla) {
                scheme.targetTop += e.originalEvent.detail * 30;
            } else {
                scheme.targetTop -= e.originalEvent.wheelDelta / 3;
            }

            if (scheme.targetTop < 0) {
                scheme.targetTop = 0;
                if (scheme.$document.scrollTop() <= 0) {
                    return false;
                }
            } else if (scheme.targetTop > scheme.scrollHeight) {
                scheme.targetTop = scheme.scrollHeight;
            }
            return false;
        });
    }

    function animationLoop() {
        var st = new Date(), et, dt, spring;
        scrollAnimation();

        function scrollAnimation() {
            if (Math.abs(scheme.currentTop - scheme.targetTop) > 0) {
                et = new Date();
                dt = et - st;
                st = et;
                spring = scheme.options.spring * dt / 17;
                spring = spring > .4 ? .4 : spring;
                scheme.currentTop += (scheme.targetTop - scheme.currentTop) * spring;
                scheme.currentTop = Math.round(scheme.currentTop * 100) / 100;
                if (scheme.currentTop < 0) {
                    scheme.currentTop = 0;
                }
                if (Math.abs(scheme.currentTop - scheme.targetTop) <= 1) {
                    scheme.currentTop = scheme.targetTop;
                }
                for (var i = 0, il = scrollUpdateList.length; i < il; i++) {
                    var update = scrollUpdateList[i];
                    if ( typeof update === "function") {
                        update.call(this, scheme.currentTop);
                    } else if ( typeof update.callback === "function") {
                        update.callback.call(update.scope ? update.scope : this, scheme.currentTop);
                    }
                }
                if (!scheme.isDragScroll && scheme.currentTop >= 0) {
                    scheme.$document.scrollTop(scheme.currentTop);
                }
            } else {
                scheme.currentTop = scheme.targetTop;
                if (!scheme.isAnimate) {
                    scheme.isDragScroll = true;
                }
            }
            window.cancelAnimationFrame(scrollPageIntervalId);
            scrollPageIntervalId = window.requestAnimationFrame(scrollAnimation);
        }

    }

    return scheme;
});
