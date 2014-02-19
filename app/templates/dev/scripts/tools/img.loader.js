/**
 * @author Terry
 * @create date 2013/3/14
 *
 * @element data
 * data-img-scr="images/xxx.jpg"
 * data-fill-mode="img" or data-fill-mode="bg"
 * default is bg
 *
 * @element class
 * .preload or .imgload
 */

define(["jquery"], function($) {
    var scheme = function() {
    }, imagesArray = {}, ipad = navigator.userAgent.match(/iPad/i) != null, android = navigator.userAgent.match(/Android/i) != null, iphone = navigator.userAgent.match(/iPhone|iPod/i) != null, tablet = false;

    if (ipad) {
        tablet = true;
    } else if (android) {
        if (navigator.userAgent.match(/Mobile/i) != null) {
            tablet = false;
        } else {
            tablet = true;
        }
    }
    var mobile = navigator.userAgent.match(/Android|webOS|iPhone|iPod|BlackBerry|IEMobile/i) != null;
    if (tablet) {
        mobile = false;
    }
    var touch = ("ontouchstart" in window) || window.DocumentTouch && document instanceof DocumentTouch;
    scheme.options = {
        preload : false,
        holder : undefined,
        fillMode : "bg", //img or bg
        progress : undefined,
        complete : undefined,
        defaultPath : "images/",
        rule : undefined
    }
    scheme.load = function(options) {
        options = $.extend({}, scheme.options, options);
        if (!options.holder) {
            options.holder = $("body");
        }
        var $imgHolders, len = 0, completeLen = 0, className;
        if (options.preload) {
            className = "preload";
        } else {
            className = "imgload";
        }
        if (options.className) {
            className = options.className;
        }
        $imgHolders = options.holder.find("." + className);
        if (options.holder.hasClass(className)) {
            $imgHolders.push(options.holder);
        }
        len = $imgHolders.length;
        if (len == 0) {
            checkIsComplete();
            return;
        }
        var stageW = $(window).width();
        $imgHolders.each(function() {
            var $this = $(this), src = $this.data("img-src");
            var fillMode = $this.data("fill-mode") ? $this.data("fill-mode") : options.fillMode;
            if (src) {
                var srcs = src.split(",");
                if (srcs.length > 1) {
                    len += srcs.length - 1;
                    $this.data("type", "multi");
                }
                if (fillMode == "bg") {
                    var multipleBg = [];
                    for (var i = 0, il = srcs.length; i < il; i++) {
                        multipleBg.push("url({" + i + "})");
                    }
                    $this.data("bgImage", multipleBg.join(","));
                }
                for (var i = 0, il = srcs.length; i < il; i++) {
                    if ($this.hasClass("adapt")) {
                        var rule;
                        if ($this.attr("data-rule")) {
                            rule = eval("(" + $this.attr("data-rule") + ")");
                            if (!rule["overwrite"] && options.rule) {
                                rule = $.extend({}, options.rule, rule);
                            }
                        } else {
                            rule = options.rule ? options.rule : undefined;
                        }
                        if (rule) {
                            if (rule.hasOwnProperty("overwrite")) {
                                delete rule["overwrite"];
                            }
                            var hasArrary = false;
                            for (var resolution in rule) {
                                if ($.isArray(rule[resolution])) {
                                    hasArrary = true;
                                    if (stageW > rule[resolution][0] && stageW < rule[resolution][1]) {
                                        var atIndex = srcs[i].lastIndexOf('@');
                                        var dotIndex = srcs[i].lastIndexOf('.');
                                        if (atIndex < 0) {
                                            atIndex = dotIndex;
                                        }
                                        var beforePart = srcs[i].substring(0, atIndex);
                                        var afterPart = srcs[i].substring(dotIndex);
                                        srcs[i] = beforePart + '@' + resolution + afterPart;
                                        break;
                                    }
                                } else {
                                    if (eval(resolution) != rule[resolution]) {
                                        srcs[i] = null;
                                        break;
                                    }
                                }
                            }
                            if (!hasArrary) {
                                $this.removeClass("adapt");
                            }
                        }
                    }
                    var src = srcs[i];
                    // console.log($this.data("src"), src);
                    if (src == null || $this.data("src") == src) {
                        completeLen++;
                        loadProgress();
                        checkIsComplete();
                    } else {
                        $this.data("src", src);
                        if (!src.match(/(http:\/\/|https:\/\/)/gi)) {
                            src = src.indexOf("~/") != -1 ? src.replace("~/", "") : options.defaultPath + src;
                        }
                        var img = $("<img/>").load(function() {
                            $this = $(this);
                            // if ($this.data("type") != "multi" &&
                            // $this.data("holder").data("src") !=
                            // $this.data("src")) {
                            // return;
                            // }
                            imagesArray[srcs[$this.data("index")]] = this;
                            if ($this.data("holder").hasClass("none")) {
                                $this.data("holder").remove();
                            } else {
                                var className = $this.data("holder").data("fill-class") ? $this.data("holder").data("fill-class") : "wish-fill-img";
                                if (fillMode == "canvas" && ((Modernizr && !Modernizr.canvas) || $.browser.msie)) {
                                    fillMode = "img";
                                }
                                if ($this.data("holder").hasClass("adapt")) {
                                    $this.data("holder").find("." + className + "-adapt").remove();
                                }
                                if (fillMode == "img") {
                                    $this.data("holder").append($this.attr("alt", "").addClass(className));
                                    if ($this.data("holder").hasClass("adapt")) {
                                        $this.addClass(className + "-adapt");
                                    }
                                } else if (fillMode == "canvas") {
                                    var canvas = $("<canvas class='" + className + "' width='" + this.width + "' height='" + this.height + "'/>");
                                    ctx = canvas[0].getContext("2d");
                                    ctx.drawImage(this, 0, 0, this.width, this.height);
                                    $this.data("holder").append(canvas);
                                    if ($this.data("holder").hasClass("adapt")) {
                                        canvas.addClass(className + "-adapt");
                                    }
                                } else {
                                    var backgroundImage = $this.data("holder").data("bgImage");
                                    if (backgroundImage) {
                                        backgroundImage = backgroundImage.replace("{" + $this.data("index") + "}", $this.attr("src"))
                                        $this.data("holder").data("bgImage", backgroundImage);
                                        if (backgroundImage.indexOf("{") == -1) {
                                            $this.data("holder").css("backgroundImage", backgroundImage);
                                        }
                                    }
                                }
                            }
                            completeLen++;
                            loadProgress();
                            checkIsComplete();
                        }).error(function() {
                            completeLen++;
                            loadProgress();
                            checkIsComplete();
                        }).data({
                            "holder" : $this,
                            "index" : i,
                            'src' : src,
                            "type" : $this.data("type")
                        }).attr('src', src);
                    }
                }
            } else {
                completeLen++;
                loadProgress();
                checkIsComplete();
            }
        });

        scheme.getImageByName = function(name) {
            return imagesArray[name];
        }
        function loadProgress() {
            if (options.progress && typeof (options.progress) == "function") {
                options.progress.call(this, Math.round(completeLen / len * 100) / 100);
            }
        }

        function checkIsComplete() {
            if (completeLen == len) {
                if (options.complete && typeof (options.complete) == "function") {
                    options.complete.call();
                }
            }
        }

        return this;
    }
    return scheme;
});
