/**
 * @author Terry
 */

if (!window.console) {
    window.console = {};
    window.console.log = function() {
    }
}

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

var toyotaServerUrl = location.href.indexOf("localhost") != -1 || location.href.indexOf("192.168.1") != -1 ? "http://clientapprove.com/preview/toyota/preview_0530/" : "", s3Url;
require(['site'], function() {
});
