/**
 * @author Terry
 * @date 2013-05-07
 */

define(["jquery", "sections/base", "tools/slider", 'core/common'], function($, base, Slider, pc) {
    var scheme = base.extend({
        init : function() {
            // setTimeout(initGamesSlider, 0);
            initGamesSlider();
        }
    });

    function initGamesSlider() {
        var lis = $("#games-carousel-btn li");
        lis.eq(0).addClass("selected");
        var slider = new Slider($("#games-carousel-content"), {
            onceShow : 1,
            animationLoop : true,
            autoResize : true,
            viewPortPosition : "absolute",
            start : function(i) {
                lis.eq(i).addClass('selected').siblings().removeClass('selected');
            }
        });
        var gamesSlider = new Slider($("#overlay-games-holder"), {
            onceShow : 1,
            animationLoop : false,
            autoResize : true,
            viewPortPosition : "absolute",
            start : function(i, p) {
                slider.seekTo(i, 0.0001);
                overlayLis.eq(i).addClass("selected").siblings().removeClass('selected');
                gamesSlider.getLiByIndex(i).find("iframe").attr("src", "games/game-" + (i + 1) + "/index.html");
            },
            ended : function(i, p) {
                gamesSlider.getLiByIndex(p).find("iframe").attr("src", "");
            }
        });
        $("#games-carousel").on("click", ".carousel-slide-btn", function() {
            $this = $(this);
            if ($this.hasClass("carousel-slide-left")) {
                slider.prev();
                pc.trigger("TRACKING", ["/games/prev-btn"]);
            } else {
                slider.next();
                pc.trigger("TRACKING", ["/games/next-btn"]);
            }
        });

        $("#games-carousel-btn li").each(function(i) {
            $(this).data("index", i).on("click", function() {
                var index = $(this).data("index");
                if (slider.currentIndex == index) {
                    return;
                }
                slider.seekTo(index);
                pc.trigger("TRACKING", ["/games/seek-btn/" + (index + 1)]);
            });
        });

        $("#game-overlay-close").on("click", function() {
            gamesSlider.getLiByIndex(gamesSlider.currentIndex).find("iframe").attr("src", "");
        });

        var overlayLis = $("#game-overlay .content-bottom li").each(function(i) {
            $(this).data("index", i).on("click", function() {
                var $this = $(this);
                var index = $this.data("index");
                gamesSlider.seekTo(index);
                // pc.trigger("TRACKING", ["/games/games-overlay/" + (index +
                // 1)]);
                pc.addressTo("games/games-overlay/" + (index + 1));
            });
        });
        overlayLis.eq(0).addClass("selected");

        $("#games-carousel-content").on("click", function() {
            $("#game-center").trigger('click');
        });

        pc.on("games-overlay", function(e, index) {
            slider.seekTo(index - 1, 0);
            $("#game-center").trigger('click');
        });

        if (pc.hasTouch) {
            $("#game-center").css("visibility", "hidden");
            $(".unsupport").show();
        } else {
            $("#game-center").on("click", function() {
                if (pc.hasTouch) {
                    return;
                }
                var index = slider.currentIndex;
                gamesSlider.seekTo(index, 0);
                gamesSlider.getLiByIndex(index).find("iframe").attr("src", "games/game-" + (index + 1) + "/index.html");
                pc.addressTo("games/games-overlay/" + (index + 1));
            });
        }
        var gamesHolder = $("#overlay-games-holder .games-box");

        pc.resize(function(isEnd) {
            if (isEnd) {
                pc.trigger("GAMES-OVERLAY-REFRESH");
            }
        });

        pc.on("GAMES-OVERLAY-REFRESH", function() {
            var li = gamesHolder.eq(0).parent("li"), h = li.height(), w = li.width();
            gamesHolder.each(function() {
                var $this = $(this), iframe = $this.find("iframe"), cw = h * ($this.data("width") / $this.data("height"));
                $this.height(h).width(cw).css("margin-left", (w - cw) / 2);
                iframe.height(h).width(cw);
            });
        });
    }

    return scheme;
});
