/**
 * @author Terry
 */
(function() {
    if (!window.console) {
        window.console = {};
        window.console.log = function() {
        }
        window.console.dir = function() {
        }
    }
})();

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
})();

(function() {
    var ua = window.navigator.userAgent.toLowerCase();
    window.platform = {
        isiPad : ua.match(/ipad/i) !== null,
        isiPhone : ua.match(/iphone/i) !== null,
        isAndroid : ua.match(/android/i) !== null,
        isBustedAndroid : ua.match(/android 2\.[12]/) !== null,
        isIE : window.navigator.appName.indexOf("Microsoft") !== -1,
        isIE8 : ua.match(/msie 8/) !== null,
        isChrome : ua.match(/chrome/gi) !== null,
        isFirefox : ua.match(/firefox/gi) !== null,
        isWebkit : ua.match(/webkit/gi) !== null,
        isGecko : ua.match(/gecko/gi) !== null,
        isOpera : ua.match(/opera/gi) !== null,
        isMac : ua.match('mac') !== null,
        hasTouch : ('ontouchstart' in window),
        supportsSvg : !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect
    };
    platform.isMobile = ua.match(/android|webos|iphone|ipod|blackberry|iemobile/i) !== null && ua.match(/mobile/i) !== null;
    platform.isTablet = platform.isiPad || (ua.match(/android|webos/i) !== null && ua.match(/mobile/i) === null);
    platform.isDesktop = !(platform.isMobile || platform.isTablet);
})();

require.config({
    baseUrl : "./scripts",
    paths : {
        "jquery" : "libs/require-jquery.min",
        "jquery.easing" : "libs/jquery.easing.1.3",
        "modernizr" : "libs/modernizr-2.5.3.min",
        "browser.animation" : "libs/browser.animation",
        "class" : "libs/class",
        "videojs" : "libs/video",
        "move" : "libs/move",
        "jquery.address" : "libs/jquery.address-1.5.min",
        "TweenMax" : "libs/TweenMax.min",
        "nanoscroller" : "libs/jquery.nanoscroller.min",
        "pixastic" : "libs/pixastic/pixastic.custom",
        "blend" : "libs/pixastic/blend",
        "hammer" : "libs/jquery.hammer.min",
        "swfobject" : "libs/swfobject"
    },
    shim : {
        "jquery.address" : ['jquery'],
        "jquery.easing" : ['jquery'],
        "nanoscroller" : ['jquery'],
        "blend" : ["pixastic"],
        "hammer" : ['jquery']
    },
    waitSeconds : 0
});

require(['main'], function() {
});
