/**
 * @author Terry
 * @date 2013-05-07
 */

define(["jquery", "sections/base", "core/common", "compose/canvas-compose"], function($, base, pc, canvasCompose) {
    var scheme = base.extend({
        init : function() {
            var mask = $("#mask"), gameOverlay = $("#game-overlay"), videoOverlay = $("#video-overlay"), galleryOverlay = $("#gallery-overlay");
            $("#showroom-gallery ul.car-list").on("click", "li", function() {
                if ($(this).data("index") != undefined) {
                    showOverklay(galleryOverlay);
                    pc.trigger("INIT-SHOW-ROOM", [$(this).data("index")]);
                }
            });
            if (!$.browser.mozilla) {
                mask.css("backfaceVisibility", "hidden");
            }

            pc.on("gallery-overlay", function(e, id) {
                showOverklay(galleryOverlay);
                pc.trigger("INIT-SHOW-ROOM", [-1, id]);
            });

            $("#game-center").on("click", function() {
                if (pc.hasTouch) {
                    return;
                }
                showOverklay(gameOverlay);
            });

            var firstShowVideos = true;
            $("#video-player").on("click", function() {
                if (pc.isMobile) {
                    return;
                }
                showOverklay(videoOverlay);
                if (firstShowVideos) {
                    pc.$window.trigger("resize");
                    firstShowVideos = false;
                }
            });

            $("#submitted-select li").each(function(i) {
                $(this).on("click", function() {
                    var index = $(this).data("index");
                    switch(index) {
                        case 0:
                            window.open(s3Url + pc.data("current-design").url);
                            break;
                        case 1:
                            canvasCompose.reset();
                            hideOverklay();
                            break;
                        case 2:
                            $("#nav-nick-games").trigger("click");
                            hideOverklay();
                            break;
                        case 3:
                            $("#nav-nick-videos").trigger("click");
                            hideOverklay();
                            break;
                    }

                }).data("index", i);
            });

            pc.on("SHOW-CAR-UPLOAD", function(e, state) {
                pc.isFullScreen = true;
                if (state == "upload") {
                    mask.css({
                        opacity : 0.01,
                        top : 0,
                        visibility : "visible"
                    });
                    TweenMax.to(mask[0], 0.5, {
                        alpha : 1
                    });
                    $("#submitted-close").hide();
                    $("#submitted-done").hide();
                    $("#submitted-loading").show();
                    var submitted = $("#submitted").show().css({
                        "transformOrigin" : "50% 100%",
                        top : 0,
                        visibility : "visible"
                    });
                    TweenMax.from(submitted[0], .5, {
                        rotation : 90,
                        alpha : 0,
                        ease : Back.easeOut
                    });
                } else if (state == "complete") {
                    $("#submitted-done").fadeIn();
                    $("#submitted-loading").hide();
                    $("#submitted-close").fadeIn();
                }
            });

            $("#mask").on("click", ".mask-close", function() {
                hideOverklay();
                switch($(this).parent().attr("id")) {
                    case "video-overlay":
                        pc.trigger("TRACKING", ["/videos/videos-overlay/close"]);
                        pc.addressTo("videos");
                        break;
                    case "game-overlay":
                        pc.trigger("TRACKING", ["/games/games-overlay/close"]);
                        pc.addressTo("games");
                        break;
                    case "gallery-overlay":
                        pc.trigger("TRACKING", ["/showroom/gallery-overlay/close"]);
                        pc.addressTo("showroom");
                        break;
                    case "submitted-content":
                        pc.trigger("TRACKING", ["/design-your-own/save-overlay/close"]);
                        pc.addressTo("design-your-own");
                        break;
                }
            });

            function showOverklay(holder) {
                pc.trigger("GAMES-OVERLAY-REFRESH");
                pc.isFullScreen = true;
                holder.show();
                mask.css({
                    opacity : 0.01,
                    top : 0,
                    visibility : "visible"
                });
                holder.css({
                    top : 0,
                    visibility : "visible"
                });
                TweenMax.to(mask[0], 0.5, {
                    alpha : 1
                });
                TweenMax.fromTo(holder.find(".content-top")[0], 0.5, {
                    y : -pc.stageH
                }, {
                    y : 0,
                    delay : .2,
                    ease : Back.easeOut,
                    onComplete : function() {
                        holder.find(".content-top").css("transform", "");
                    }
                });
                TweenMax.fromTo(holder.find(".content-bottom")[0], 0.4, {
                    y : 300,
                    alpha : 0,
                }, {
                    y : 0,
                    alpha : 1,
                    delay : .7,
                    ease : Sine.easeOut
                });
            }

            function hideOverklay() {
                pc.isFullScreen = false;
                pc.trigger("PAUSE_VIDEO");
                TweenMax.to(mask[0], 0.5, {
                    alpha : 0.01,
                    onComplete : function() {
                        mask.css({
                            top : "100%",
                            visibility : "hidden"
                        });
                        $(".masksections").css({
                            top : "100%",
                            visibility : "hidden"
                        });
                    }
                });
            }


            pc.on("hideOverklay", hideOverklay);

        }
    });
    return scheme;
});
