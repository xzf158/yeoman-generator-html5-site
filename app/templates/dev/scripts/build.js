( {
    baseUrl : "./",
    paths : {
        "jquery" : "empty:",
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
        "hammer" : "libs/jquery.hammer.min"
    },
    shim : {
        "jquery.address" : ['jquery'],
        "jquery.easing" : ['jquery'],
        "nanoscroller" : ['jquery'],
        "blend" : ["pixastic"],
        "hammer" : ['jquery']
    },
    name : "main",
    out : "./main-build.js"
})