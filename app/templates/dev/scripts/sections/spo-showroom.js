/**
 * @author Terry
 * @date 2013-05-07
 */

define(["jquery", "sections/base", 'tools/img.loader', 'core/common', 'tools/slider'], function($, base, imgLoader, pc, Slider) {
    var scheme = base.extend({
        init : function() {
            if (pc.isMobile) {
                return;
            }
            galleryHolder = $("#showroom-gallery ul.car-list");
            showroomGallery = $("#showroom-gallery");
            galleryLoading = $("#showroom-loading");
            showroomHolder = $("#showroom-holder");
            overlayImgnum = $("#gallery-overlay-imgnum");
            showroomGallerySelect = $("#showroom-gallery-select");
            galleryOverlay = $("#gallery-overlay");
            galleryOverlaySelect = $("#gallery-overlay-select");
            showroomGalleryPagenum = $("#showroom-gallery-pagenum");
            var preBtn = $("#showroom-gallery-pre").addClass('disabled'), nextBtn = $("#showroom-gallery-next");

            var datas = $(pc.data("car-xml-data")).find("images");
            if (datas.length == 0) {
                return;
            }
            totalPage = parseInt(datas.attr("totalpages"));
            s3Url = datas.attr("s3Url") ? datas.attr("s3Url") : "";
            for (var i = 1; i <= totalPage; i++) {
                var pageData = [];
                datas.children("e[page='" + i + "']").each(function(index) {
                    var $this = $(this);
                    var pageJson = {};
                    pageJson["id"] = $this.attr("id");
                    pageJson["url"] = $this.attr("url");
                    pageJson["thumbUrl"] = $this.attr("thumbUrl");
                    pageJson["index"] = allData.length;
                    pageData.push(pageJson);
                    allData.push(pageJson);
                });
                carDatas[i] = pageData;
            }
            allDataLen = allData.length;
            galleryLoading.fadeOut();
            galleryHolder.html("");
            updateLi(carDatas[currentPage], null, true);
            showroomGalleryPagenum.html(currentPage + "/" + totalPage);
            function updateLi(datas, complete, isFirst) {
                if (isFirst) {
                    fillLiHtml(datas, complete);
                } else {
                    TweenMax.to(galleryHolder[0], 0.2, {
                        alpha : 0,
                        onComplete : function() {
                            fillLiHtml(datas, complete);
                        }
                    });
                }
                if (currentPage == 1) {
                    preBtn.addClass('disabled');
                } else {
                    preBtn.removeClass('disabled');
                }
                if (currentPage == totalPage) {
                    nextBtn.addClass('disabled');
                } else {
                    nextBtn.removeClass('disabled');
                }
            }

            function fillLiHtml(datas, complete) {
                galleryHolder.html("");
                var il = datas.length;
                il = il < 5 ? 5 : il;
                for (var i = 0; i < il; i++) {
                    if (datas[i]) {
                        var li = $("<li class='imgload' data-img-src='" + s3Url + datas[i].thumbUrl + "' data-fill-mode='canvas' style='cursor:pointer;'/>");
                        li.appendTo(galleryHolder);
                        li.append($("<img class='car-fill' style='background:rgba(242,102,73,.7) url(images/loading.gif) no-repeat center center' src='images/1x1.png'>"));
                        li.data(datas[i]);
                        li.data("index", datas[i].index);
                    } else {
                        var li = $("<li style='cursor:default;'/>");
                        li.appendTo(galleryHolder);
                        li.append($("<img class='car-fill' src='images/1x1.png'>"));
                        li.data(datas[i]);
                    }
                }
                // pc.$window.trigger("resize");
                TweenMax.to(galleryHolder[0], 0.35, {
                    alpha : 1
                });
                imgLoader.load({
                    holder : galleryHolder,
                    complete : function() {
                        var btn = $("#gallery-overlay-close");
                        btn.parent().append(btn);
                        if (complete && typeof complete === "function") {
                            complete.call(this);
                        }
                        galleryHolder.find(".car-fill").each(function() {
                            $(this).css("background", "");
                        });
                    },
                });
            }

            function updateGalleryOverlay(index) {
                var contentTop = galleryOverlay.find(".content-top");
                TweenMax.to(contentTop[0], .1, {
                    alpha : 0,
                    ease : Sine.easeOut,
                    onComplete : function() {
                        contentTop.css({
                            "background-image" : "url(" + (s3Url + allData[index].url) + ")"
                        });
                        TweenMax.to(contentTop[0], .35, {
                            alpha : 1,
                            ease : Sine.easeIn
                        });
                    }
                });
                overlayImgnum.html((index + 1) + "/" + allDataLen);
                if (index == 0) {
                    overlayPre.addClass("disabled");
                } else {
                    overlayPre.removeClass("disabled");
                }
                if (index == allDataLen - 1) {
                    overlayNext.addClass("disabled");
                } else {
                    overlayNext.removeClass("disabled");
                }
                pc.addressTo("showroom/gallery-overlay/" + allData[index].id);
            }


            pc.on("INIT-SHOW-ROOM", function(e, index, id) {
                if (id) {
                    for (var i = 0; i < allDataLen; i++) {
                        if (allData[i].id == id) {
                            currentImage = i;
                            break;
                        }
                    }
                } else {
                    currentImage = index;
                }
                console.log(currentImage);
                updateGalleryOverlay(currentImage);
            });

            showroomGallerySelect.on("click", ".showroom-gallery-slcbtns", function() {
                $this = $(this);
                if ($this.attr("id") == "showroom-gallery-pre") {
                    if (currentPage > 1) {
                        currentPage--;
                    } else {
                        return;
                    }
                } else {
                    if (currentPage < totalPage) {
                        currentPage++;
                    } else {
                        return;
                    }
                }
                pc.trigger("TRACKING", ["/showroom/page/" + currentPage]);
                updateLi(carDatas[currentPage]);
                showroomGalleryPagenum.html(currentPage + "/" + totalPage);
            });

            var overlayPre = $("#gallery-overlay-pre"), overlayNext = $("#gallery-overlay-next");

            $(".gallery-overlay-slcbtns").each(function(i) {
                $(this).on("click", function() {
                    var $this = $(this);
                    if ($this.data("i") == 0) {
                        if (currentImage > 0) {
                            // pc.trigger("TRACKING",
                            // ["/showroom/gallery-overlay/prev"]);
                            currentImage--;
                        } else {
                            return;
                        }
                    } else {
                        if (currentImage < allDataLen - 1) {
                            // pc.trigger("TRACKING",
                            // ["/showroom/gallery-overlay/next"]);
                            currentImage++;
                        } else {
                            return;
                        }
                    }
                    updateGalleryOverlay(currentImage);
                }).data("i", i);
            });
        }
    }), showroomGallery, galleryHolder, ajaxLoading = false, showroomGalleryPagenum, currentPage = 1, currentImage = 0, totalPage = 0, onePageCount = 8, showroomGallerySelect, galleryLoading, carDatas = [], allData = [], allDataLen = 0, isExpand = false, hasLoadData = false, dataChange = true, showroomMore, showroomLess, carsSlider, showroomHolder, overlayImgnum, galleryOverlay, galleryOverlaySelect;
    return scheme;
});
