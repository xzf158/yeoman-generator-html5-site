/**
 * @author Terry
 * @date 2013-05-07
 */

define(["jquery", "sections/base", 'tools/img.loader', 'core/common', 'tools/slider'], function($, base, imgLoader, pc, Slider) {
    var scheme = base.extend({
        init : function() {
            galleryHolder = $("#showroom-gallery ul.car-list");
            showroomGallery = $("#showroom-gallery");
            galleryLoading = $("#showroom-loading");
            showroomHolder = $("#showroom-holder");
            overlayImgnum = $("#gallery-overlay-imgnum");
            showroomGallerySelect = $("#showroom-gallery-select").hide();
            galleryOverlaySelect = $("#gallery-overlay-select");

            pc.on("ADD-NEW-CAR", function(e, data) {
                carDatas.unshift(data);
                galleryHolder.html("");
                var datas = carDatas.slice(pageIndex * onePageCount, isExpand ? pageIndex * onePageCount + onePageCount : pageIndex * onePageCount + onePageCount / 2);
                dataChange = true;
                createLi(datas);
            });

            galleryLoading.show();

            showroomGallery.css({
                "height" : showroomGallery.height(),
                "overflow" : "hidden",
            });

            getNextPage(function(datas) {
                galleryLoading.fadeOut();
                createLi(datas.slice(0, onePageCount / 2));
                updateOverlay(datas);
            });

            function getNextPage(complete) {
                if (ajaxLoading) {
                    return;
                }
                ajaxLoading = true;
                if (carDatas.length <= (pageIndex + 1) * onePageCount) {
                    $.get(toyotaServerUrl + "php/get.php?count=" + onePageCount + ( beginId ? "&bid=" + beginId : "")).done(function(data) {
                        ajaxLoading = false;
                        var datas = eval(data);
                        if (datas.length > 0) {
                            beginId = datas[datas.length - 1].id - 1;
                            galleryHolder.html("");
                            carDatas = carDatas.concat(datas);
                            pageIndex++;
                        }
                        if (complete && typeof complete === "function") {
                            complete.call(this, datas);
                        }
                    }).error(function() {
                        ajaxLoading = false;
                    });
                } else {
                    ajaxLoading = false;
                    pageIndex++;
                    var datas = carDatas.slice(pageIndex * onePageCount, pageIndex * onePageCount + onePageCount);
                    if (datas.length > 0) {
                        galleryHolder.html("");
                    }
                    if (complete && typeof complete === "function") {
                        complete.call(this, datas);
                    }
                }
            }

            function getPrevPage(complete) {
                if (pageIndex > 0) {
                    pageIndex--;
                } else {
                    return;
                }
                var datas = carDatas.slice(pageIndex * onePageCount, pageIndex * onePageCount + onePageCount);
                if (datas.length > 0) {
                    galleryHolder.html("");
                }
                if (complete && typeof complete === "function") {
                    complete.call(this, datas);
                }
            }

            function createLi(datas, complete) {
                console.log(galleryHolder.html(), datas.length);
                for (var i = 0, il = datas.length; i < il; i++) {
                    var li = $("<li class='imgload' data-img-src='" + s3Url + datas[i].thumbUrl + "' data-fill-mode='canvas'/>");
                    li.appendTo(galleryHolder);
                    li.append($("<img class='car-fill' src='images/1x1.png'>"));
                    li.append($("<img class='car-bg' src='images/showroom-bg-" + i % 4 + ".png'>"));
                    li.append($("<div class='car-loading imgload' data-img-src='loading.gif'></div>"));
                    li.data(datas[i]);
                    var index = galleryHolder.find("li").length - 1;
                    li.data("index", index);
                }
                imgLoader.load({
                    holder : galleryHolder,
                    complete : function() {
                        if (complete && typeof complete === "function") {
                            complete.call(this);
                        }
                    },
                });
            }

            function updateOverlay(datas) {
                if (datas.length > 0) {
                    galleryOverlaySelect.find(".content-bottom-box").each(function(i) {
                        $this = $(this);
                        $this.find(".wish-fill-img").remove();
                        var data = datas[i];
                        if (data) {
                            $this.data(data).data("index", i).addClass("imgload");
                            $this.data({
                                "img-src" : s3Url + datas[i].thumbUrl,
                                "fill-mode" : "canvas"
                            });
                            $this.parent("li").show();
                        } else {
                            $this.parent("li").hide();
                        }
                    });
                    imgLoader.load({
                        holder : galleryOverlaySelect,
                    });
                }
            }


            pc.on("INIT-SHOW-ROOM", function(e, index) {
                setTimeout(function() {
                    initBigRoomHolder(carDatas.slice(pageIndex * onePageCount, pageIndex * onePageCount + onePageCount));
                    carsSlider.seekTo(index, 0);
                    galleryOverlaySelect.find("li").eq(index).trigger("click");
                }, 100);
            });

            function initBigRoomHolder(datas) {
                if (!dataChange) {
                    return;
                }
                dataChange = false;
                showroomHolder.html("<ul/>");
                var ul = showroomHolder.find("ul");
                var il = datas.length;
                for (var i = 0; i < il; i++) {
                    $("<li class='imgload' data-img-src='" + s3Url + datas[i].url + "' data-fill-mode='img'/>").data(datas[i]).data("index", i).appendTo(ul);
                }
                carsSlider = new Slider(showroomHolder, {
                    onceShow : 1,
                    animationLoop : false,
                    autoResize : true,
                    viewPortPosition : "absolute",
                    start : function(i) {
                        imgLoader.load({
                            holder : carsSlider.getLiByIndex(i),
                            complete : function() {
                                carsSlider.getLiByIndex(i).find(".wish-fill-img").css("opacity", 0).animate({
                                    opacity : 1
                                }, 400);
                            },
                        });
                    }
                });
                overlayImgnum.html("1/" + datas.length);
                imgLoader.load({
                    holder : carsSlider.getLiByIndex(0),
                    complete : function() {
                        carsSlider.getLiByIndex(0).find(".wish-fill-img").css("opacity", 0).animate({
                            opacity : 1
                        }, 400);
                    }
                });
                galleryOverlaySelect.find("li").eq(0).trigger("click");
            }

            showroomMore = $("#showroom-more").on("click", function() {
                showroomGallerySelect.show();
                isExpand = true;
                if (!hasLoadData) {
                    hasLoadData = true;
                    var datas = carDatas.slice(pageIndex * onePageCount + onePageCount / 2, pageIndex * onePageCount + onePageCount);
                    showroomMore.fadeOut();
                    galleryLoading.fadeOut();
                    showroomLess.fadeIn();
                    createLi(datas, function() {
                        pc.$window.trigger("resize");
                    });
                    TweenMax.to(showroomGallery[0], .4, {
                        height : galleryHolder.height() + showroomGallerySelect.outerHeight()
                    });
                } else {
                    TweenMax.to(showroomGallery[0], .4, {
                        height : galleryHolder.height() + showroomGallerySelect.outerHeight()
                    });
                    showroomMore.fadeOut();
                    showroomLess.fadeIn();
                }
            });

            showroomLess = $("#showroom-less").on("click", function() {
                showroomGallery.css({
                    "height" : galleryHolder.height(),
                    "overflow" : "hidden",
                });
                isExpand = false;
                showroomLess.fadeOut();
                showroomMore.fadeIn();
                TweenMax.to(showroomGallery[0], .4, {
                    height : galleryHolder.find("li").eq(0).outerHeight(),
                });
            });

            $("#showroom-gallery-select").on("click", ".showroom-gallery-slcbtns", function() {
                $this = $(this);
                hasLoadData = true;
                dataChange = true;
                if ($this.attr("id") == "showroom-gallery-pre") {
                    getPrevPage(function(datas) {
                        createLi(datas);
                        updateOverlay(datas);
                        initBigRoomHolder(datas);
                    });
                } else {
                    getNextPage(function(datas) {
                        createLi(datas);
                        updateOverlay(datas);
                        initBigRoomHolder(datas);
                    });
                }
            });

            $(".gallery-overlay-slcbtns").each(function(i) {
                $(this).on("click", function() {
                    var $this = $(this);
                    if ($this.data("i") == 0) {
                        $("#showroom-gallery-pre").trigger("click");
                    } else {
                        $("#showroom-gallery-next").trigger("click");
                    }
                }).data("i", i);
            });

            galleryOverlaySelect.on("click", "li", function() {
                var $this = $(this);
                carsSlider.seekTo($this.data("index"));
                $this.addClass("selected").siblings().removeClass("selected");
            }).find("li").each(function(i) {
                $(this).data("index", i);
            });
        },
        resize : function(isEnd) {
            showroomGallery.css({
                "height" : isExpand ? galleryHolder.height() + showroomGallerySelect.outerHeight() : galleryHolder.find("li").eq(0).outerHeight(),
            });
        }
    }), showroomGallery, galleryHolder, ajaxLoading = false, beginId, pageIndex = -1, onePageCount = 8, showroomGallerySelect, galleryLoading, carDatas = [], isExpand = false, hasLoadData = false, dataChange = true, showroomMore, showroomLess, carsSlider, showroomHolder, overlayImgnum, galleryOverlaySelect;
    return scheme;
});
