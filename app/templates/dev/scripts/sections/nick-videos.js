/**
 * @author Terry
 * @date 2013-05-07
 */

define(["jquery", "sections/base", "tools/slider", "videojs", "core/common"], function($, base, Slider, VideoJS, pc) {
    var scheme = base.extend({
        init : function() {
            // setTimeout(function() {
            initVideosSlider();
            initVideo();
            // }, 300);
        }
    }), videos = [], videoPlayer;

    function initVideosSlider() {
        videoPlayer = $("#video-player");
        $("#videos-carousel-content li").each(function(i) {
            $(this).data("index", i)
        });

        $("#videos-carousel-content").on("click", function() {
            videoPlayer.trigger("click");
        });

        var slider = new Slider($("#videos-carousel-content"), {
            onceShow : 1,
            animationLoop : true,
            autoResize : true,
            viewPortPosition : "absolute",
            start : function(i) {
                lis.eq(i).addClass('selected').siblings().removeClass('selected');
            }
        });
        var videoSlider = new Slider($("#overlay-videos-holder"), {
            onceShow : 1,
            animationLoop : false,
            autoResize : true,
            touch : false,
            viewPortPosition : "absolute",
            start : function(i) {
                slider.seekTo(i, 0.0001);
                overlayLis.eq(i).addClass("selected").siblings().removeClass('selected');
            },
            ended : function(index) {
                if (videos[index]) {
                    videos[index].play();
                }
            }
        });

        videoPlayer.on("click", function() {
            var index = slider.currentIndex;
            if (pc.isMobile) {
                location.href = "medias/video-" + (index + 1) + ".mp4";
            } else {
                videoSlider.seekTo(index, 0);
                if (videos[index]) {
                    videos[index].play();
                }
                pc.addressTo("videos/videos-overlay/" + (index + 1));
            }
        });

        pc.on("videos-overlay", function(e, index) {
            slider.seekTo(index - 1, 0);
            videoPlayer.trigger("click");
        });

        var lis = $("#videos-carousel-btn li");
        lis.eq(0).addClass("selected");
        $("#videos-carousel").on("click", ".carousel-slide-btn", function() {
            $this = $(this);
            if ($this.hasClass("carousel-slide-left")) {
                slider.prev();
                pc.trigger("TRACKING", ["/videos/prev-btn"]);
            } else {
                slider.next();
                pc.trigger("TRACKING", ["/videos/next-btn"]);
            }
        });

        $("#videos-carousel-btn li").each(function(i) {
            $(this).data("index", i).on("click", function() {
                var index = $(this).data("index");
                if (slider.currentIndex == index) {
                    return;
                }
                slider.seekTo(index);
                pc.trigger("TRACKING", ["/videos/seek-btn/" + (index + 1)]);
            });
        });

        $("#silder-holder").on("click", function() {
            if (videos[slider.currentIndex].paused) {
                videos[slider.currentIndex].play();
            } else {
                videos[slider.currentIndex].pause();
            }
        });

        var overlayLis = $("#video-overlay .content-bottom li").each(function(i) {
            $(this).data("index", i).on("click", function() {
                var $this = $(this);
                var index = $this.data("index");
                if (videoSlider.currentIndex == index) {
                    return;
                }
                pc.trigger("PAUSE_VIDEO");
                videoSlider.seekTo(index);
                pc.addressTo("videos/videos-overlay/" + (index + 1));
                // pc.trigger("TRACKING", ["/videos/videos-overlay/" + (index +
                // 1)]);
            });
        });
        overlayLis.eq(0).addClass("selected");
    }

    function initVideo() {
        VideoJS.options.flash = {
            swf : "medias/video-js.swf"
        };
        $("video").each(function() {
            VideoJS(this).ready(function() {
                videos.push(this);
                this.addEvent("play", function() {
                    pc.trigger("TRACKING", ["/videos/videos-overlay/" + this.id.replace("video-", "") + "/play"]);
                });
                this.addEvent("pause", function() {
                    pc.trigger("TRACKING", ["/videos/videos-overlay/" + this.id.replace("video-", "") + "/pause"]);
                });
            });
        });
        pc.on("PAUSE_VIDEO", function() {
            for (var i = 0, il = videos.length; i < il; i++) {
                if (!videos[i].paused()) {
                    videos[i].pause();
                }
            }
        });
    }

    return scheme;
});
