/**
 * @author Terry
 * @date 2013-03-21
 */

define(["jquery", "TweenMax"], function($) {
    var scheme = function() {
    }, timelines = {}, timeScales = {};

    scheme.init = function($els) {
        $els.each(function(i) {
            var $this = $(this);
            var name = $this.attr("id");
            if (!name) {
                throw new Error("Parallax holder: " + $els.selector + " " + i + " must have id.");
                return;
            }

            var timeline = new TimelineMax({
                paused : true
            });

            timelines[name] = timeline;
            $this.find("[data-portion-parallax]").andSelf().each(function(i) {
                scheme.addTo($(this), timeline);
            });
        });
    }

    scheme.getTimelineByName = function(name) {
        return timelines[name];
    }

    scheme.addTo = function($el, timeline, parallaxArr) {
        var parallaxs = parallaxArr ? parallaxArr : eval($el.attr("data-portion-parallax"));
        if ($.isArray(parallaxs)) {
            for (var i = 0, il = parallaxs.length; i < il; i++) {
                if (!parallaxs[i].duration) {
                    parallaxs[i].duration = 0;
                }
                if ( typeof timeline === "string") {
                    timeline = scheme.getTimelineByName(timeline);
                }
                if (timeline) {
                    // parallaxs[i].vars["overwrite"] = "0";
                    timeline.to($el[0], parallaxs[i].duration, parallaxs[i].vars, parallaxs[i].stone);
                }
            }
        }
    }

    scheme.update = function(ratios) {
        if (!ratios) {
            ratios = {};
        }
        for (var i in timelines) {
            if (ratios[i] <= 0.5 && timelines[i].timeScale() != 1) {
                timelines[i].timeScale(1);
            } else if (ratios[i] > 0.5 && timelines[i].timeScale() != timeScales[i]) {
                timelines[i].timeScale(timeScales[i]);
            }
            if (ratios[i] == undefined) {
                // console.log(ratios[i] ? ratios[i] : 0, i);
            }

            timelines[i].seek(ratios[i] ? ratios[i] : 0);
        }
    }

    scheme.setTimeScales = function(value) {
        timeScales = value;
    }
    return scheme;
});
