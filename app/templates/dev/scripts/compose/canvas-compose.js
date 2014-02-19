/**
 * @author Terry
 * @date 2013-04-29
 */

define(["jquery", "tools/img.loader", "TweenMax", "pixastic", "blend"], function($, imgLoader) {
    var scheme = function() {
    }, bgImg, currentColor, patterns, sticker, inletGrille, hub, handle, colorTween = $("<div/>");
    var mainCanvasId, carCanvas, ctx, carColorCanvas, carColorCanvasCtx, carHighLight, background;
    var car, colorMask, carShadowMask, _options, history = [];
    /*
     * {
     *      canvasId:,
     *      defaultColor:,
     *      car:,
     *      colorMask:,
     *      carShadowMask:
     * }
     */
    scheme.init = function(options) {
        if (!$("html").hasClass('canvas')) {
            return;
        }
        _options = options;
        mainCanvasId = options.canvasId;
        carCanvas = document.getElementById(mainCanvasId);
        ctx = carCanvas.getContext("2d");

        carColorCanvas = document.createElement("canvas");
        carColorCanvas.width = carCanvas.width;
        carColorCanvas.height = carCanvas.height;
        carColorCanvasCtx = carColorCanvas.getContext("2d");

        currentColor = options.defaultColor;
        colorTween.css("color", currentColor);

        bgImg = options.defaultBgImg;
        car = options.car;
        patterns = options.patterns;
        colorMask = options.colorMask;
        carShadowMask = options.carShadowMask;
        sticker = options.sticker;
        inletGrille = options.inletGrille;
        carHighLight = options.carHighLight;
        background = options.defaultBackground;
        // hub = options.hub;
        // handle = options.handle;

        draw(currentColor);
    }
    function imageLoad(img, callBack) {
        var img = new Image();
        img.onLoad = function() {
            callBack.call(this);
        }
    }

    function draw(color) {
        Pixastic.revert(document.getElementById(mainCanvasId));
        ctx.save();
        ctx.globalCompositeOperation = "copy";
        ctx.fillStyle = "rgba(0,0,0,0)";
        ctx.fillRect(0, 0, car.width, car.height);
        ctx.restore();

        if (bgImg) {
            ctx.drawImage(bgImg, 0, 0, carCanvas.width, carCanvas.height);
        }

        carColorCanvasCtx.save();
        carColorCanvasCtx.globalCompositeOperation = "copy";
        carColorCanvasCtx.globalAlpha = 0.8;
        carColorCanvasCtx.fillStyle = color ? color : currentColor;
        carColorCanvasCtx.fillRect(0, 0, carColorCanvas.width, carColorCanvas.height);
        carColorCanvasCtx.restore();

        carColorCanvasCtx.save();
        carColorCanvasCtx.globalCompositeOperation = "destination-in";
        carColorCanvasCtx.drawImage(colorMask, 0, 0, colorMask.width, colorMask.height);
        carColorCanvasCtx.restore();

        ctx.drawImage(car, 0, 0, car.width, car.height);

        ctx.drawImage(carColorCanvas, 0, 0, carCanvas.width, carCanvas.height);

        if (patterns) {
            // Pixastic.process(document.getElementById(mainCanvasId), "blend", {
            // amount : 1,
            // mode : "multiply",
            // image : patterns
            // });
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.drawImage(patterns, 0, 0, patterns.width, patterns.height);
            ctx.restore();
        }
        if (inletGrille) {
            ctx.drawImage(inletGrille, 0, 0, inletGrille.width, inletGrille.height);
        }
        if (hub) {
            ctx.drawImage(hub, 0, 0, hub.width, hub.height);
        }
        if (handle) {
            ctx.drawImage(handle, 0, 0, handle.width, handle.height);
        }

        if (sticker) {
            ctx.drawImage(sticker, 0, 0, sticker.width, sticker.height);
        }

        Pixastic.process(document.getElementById(mainCanvasId), "blend", {
            amount : 1,
            mode : "multiply",
            image : carShadowMask
        });

        if (carHighLight) {
            document.getElementById(mainCanvasId).getContext("2d").drawImage(carHighLight, 0, 0, carHighLight.width, carHighLight.height);
        }
    }


    scheme.updateColor = function(toColor, duration, back) {
        if (currentColor == toColor) {
            return;
        }
        if (!back) {
            history.push({
                action : scheme.updateColor,
                args : [currentColor, duration, true],
                type : "color"
            });
        }
        currentColor = toColor;
        if (duration == 0) {
            draw();
        } else {
            TweenMax.to(colorTween[0], duration ? duration : 1, {
                css : {
                    color : currentColor,
                },
                onUpdate : function() {
                    draw(colorTween.css("color"));
                },
                ease : Cubic.easeOut,
                overwrite : 1,
                onComplete : function() {

                }
            });
        }
    }

    scheme.updatePatterns = function(img, back) {
        if (patterns && img && patterns.src == img.src) {
            return;
        }
        if (!back) {
            history.push({
                action : scheme.updatePatterns,
                args : [patterns, true],
                type : "patterns"
            });
        }
        patterns = img;
        draw();
    }

    scheme.updateSticker = function(img, back) {
        if (sticker && img && sticker.src == img.src) {
            return;
        }
        if (!back) {
            history.push({
                action : scheme.updateSticker,
                args : [sticker, true],
                type : "sticker"
            });
        }
        sticker = img;
        draw();
    }
    // scheme.updateInletGrille = function(img) {
    // inletGrille = img;
    // history.push({
    // action : scheme.updatePatterns,
    // arguments : [img]
    // });
    // draw();
    // }

    scheme.updateBackground = function(img, back) {
        if (background == img) {
            return;
        }
        if (!back) {
            history.push({
                action : scheme.updateBackground,
                args : [background, true],
                type : "background"
            });
        }
        background = img;
    }

    scheme.undo = function(callback) {
        var lastAction = history.pop();
        if (lastAction) {
            lastAction.action.apply(this, lastAction.args);
            var value;
            if (lastAction.args[0]) {
                value = lastAction.args[0].src ? lastAction.args[0].src : lastAction.args[0];
            }
            callback.apply(this, [lastAction.type, value]);
        }
    }

    scheme.reset = function() {
        inletGrille = undefined;
        handle = undefined;
        hub = undefined;
        patterns = undefined;
        sticker = undefined;
        background = _options.defaultBackground;
        history.length = 0;
        history = [];
        if (currentColor != _options.defaultColor) {
            scheme.updateColor(_options.defaultColor, undefined, true);
        } else {
            draw();
        }
    }

    scheme.upload = function(callback) {
        var img = new Image();
        img.onload = function() {
            var canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            var tmpCtx = canvas.getContext("2d");
            tmpCtx.drawImage(img, 0, 0, img.width, img.height);
            tmpCtx.drawImage(document.getElementById(mainCanvasId), (img.width - carCanvas.width) / 2, (img.height - carCanvas.height) / 2, carCanvas.width, carCanvas.height);
            var data = canvas.toDataURL('image/jpeg', .9);
            $.post("php/upload.php", {
                data : data
            }).done(function(data) {
                callback.call(this, data);
            });
        }
        img.src = background;
    }
    return scheme;
});
