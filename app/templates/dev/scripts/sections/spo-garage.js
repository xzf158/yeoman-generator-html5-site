/**
 * @author Terry
 * @date 2013-05-07
 */

define(["jquery", "sections/base", "compose/canvas-compose", 'tools/img.loader', 'core/common', "hammer"], function($, base, canvasCompose, imgLoader, pc) {
    var scheme = base.extend({
        init : function() {
            if (!$("html").hasClass('canvas')) {
                return;
            }
            currentBg = "spon-garage-pop.png";
            var currentTarget, btnMenus = $(".btn-menus"), sendTxt = $("#submitted-select form>p");
            var leftBtn = $("#left-btn").on("click", function() {
                if (currentTarget) {
                    TweenMax.to(currentTarget.find("ul")[0], 0.4, {
                        left : "0",
                    });
                    currentTarget.data("position", "left");
                    leftBtn.hide();
                    rightBtn.show();
                }
            });
            var rightBtn = $("#right-btn").on("click", function() {
                if (currentTarget) {
                    TweenMax.to(currentTarget.find("ul")[0], 0.4, {
                        left : "-" + (currentTarget.find("li").length - 7) * currentTarget.find("li").eq(0).width(),
                    });
                    currentTarget.data("position", "right");
                    rightBtn.hide();
                    leftBtn.show();
                }
            });
            pc.resize(function(isEnd) {
                if (isEnd) {
                    btnMenus.each(function() {
                        var $this = $(this);
                        if ($this.data("position") == "right") {
                            $this.find("ul").css("left", -($this.find("li").length - 7) * $this.find("li").eq(0).width());
                        }
                    });
                }
            });
            garageBoard = $("#garage-board");
            colorInfo = $(".color-info");
            var colors = ["#b455a0", "#70bf54", "#047bc1", "#ffc20e", "#f15a22", "#f27da9", "#4fc6e0", "#fff45f", "#67b1a2", "#6676b1", "#b19766", "#b26666"];

            var colorsSwitch = $("#colors-switch").on("click", "li", function(e) {
                var $this = $(this);
                $this.addClass("selected").siblings().removeClass("selected");
                if (e.originalEvent) {
                    canvasCompose.updateColor($this.data("color"));
                    pc.trigger("TRACKING", ["/design-your-own/dav/color/" + ($this.data("index") + 1)]);
                }
                // btnsUl.eq(0).find("div:first-child").css({
                // "background-position" : "0px -" + ($this.data("index") + 1) *
                // 40 + "px"
                // });
                return false;
            }).find("li");
            colorsSwitch.each(function(i) {
                $(this).data({
                    "index" : i,
                    "color" : colors[i],
                }).find("div").css({
                    "background-position" : "0px -" + (i + 1) * 40 + "px"
                });
            });

            garageSltBubble = $("#garage-slt-bubble");

            var patternsSwitch = $("#patterns-switch").on("click", "li", function(e) {
                var $this = $(this);
                $this.addClass("selected").siblings().removeClass("selected");
                if (e.originalEvent) {
                    canvasCompose.updatePatterns(imgLoader.getImageByName($this.data("img")));
                    pc.trigger("TRACKING", ["/design-your-own/dav/stickers/" + ($this.data("index") + 1)]);
                }
                // btnsUl.eq(2).find("div:first-child").css({
                // "background-position" : "0px -" + ($this.data("index") + 1) *
                // 40 + "px"
                // });
            }).find("li");

            patternsSwitch.each(function(i) {
                $(this).data({
                    "index" : i,
                }).find("div").css({
                    "background-position" : "0px -" + (i + 1) * 40 + "px"
                });
            });

            var backgroundSwitch = $("#background-switch").on("click", "li", function(e) {
                var $this = $(this);
                changeBg($this.data("bg-img"));
                if (e.originalEvent) {
                    canvasCompose.updateBackground($this.data("img"));
                    pc.trigger("TRACKING", ["/design-your-own/dav/background/" + ($this.data("index") + 1)]);
                }
                $this.addClass("selected").siblings().removeClass("selected");
                // btnsUl.eq(1).find("div:first-child").css({
                // "background-position" : "0px -" + ($this.data("index") + 1) *
                // 40 + "px"
                // });
            }).find("li");
            backgroundSwitch.each(function(i) {
                $(this).data({
                    "index" : i,
                }).find("div").css({
                    "background-position" : "0px -" + (i + 1) * 40 + "px"
                });
            });

            var stickerSwitch = $("#sticker-switch").on("click", "li", function(e) {
                var $this = $(this);
                $this.addClass("selected").siblings().removeClass("selected");
                if (e.originalEvent) {
                    canvasCompose.updateSticker(imgLoader.getImageByName($this.data("img")));
                    pc.trigger("TRACKING", ["/design-your-own/dav/patterns/" + ($this.data("index") + 1)]);
                }
                // btnsUl.eq(3).find("div:first-child").css({
                // "background-position" : "0px -" + ($this.data("index") + 1) *
                // 40 + "px"
                // });
            }).find("li");
            stickerSwitch.each(function(i) {
                $(this).data({
                    "index" : i,
                }).find("div").css({
                    "background-position" : "0px -" + (i + 1) * 40 + "px"
                });
            });

            var btnsUl = $(".btns").on("click", "li", function() {
                $this = $(this);
                if ($this.hasClass("selected")) {
                    return;
                }
                $(".btn-menus").fadeOut();
                currentTarget = null;
                leftBtn.hide();
                rightBtn.hide();
                $this.addClass("selected").siblings().removeClass("selected");
                pc.trigger("TRACKING", ["/design-your-own/dav/" + $this.data("title").toLowerCase()]);
                switch ($this.data("target")) {
                    case "reset":
                        $(".color-info").fadeOut();
                        canvasCompose.reset();
                        changeBg("spon-garage-pop.png");
                        btnsUl.each(function() {
                            $(this).find("div:first-child").css({
                                "background-position" : ""
                            });
                        });
                        setTimeout(function() {
                            garageBoard.find(".selected").removeClass("selected");
                        }, 100);
                        break;
                    case "undo":
                        $(".color-info").fadeOut();
                        canvasCompose.undo(function(type, value) {
                            switch(type) {
                                case "color":
                                    if (value != "#d6292c") {
                                        colorsSwitch.each(function() {
                                            var $this = $(this);
                                            if ($this.data("color") == value) {
                                                $this.trigger("click");
                                            }
                                        });
                                    } else {
                                        colorsSwitch.removeClass("selected");
                                        btnsUl.eq(0).find("div:first-child").css({
                                            "background-position" : ""
                                        });
                                    }
                                    break;
                                case "patterns":
                                    if (value) {
                                        patternsSwitch.each(function() {
                                            var $this = $(this);
                                            if (value.indexOf($this.data("img")) != -1) {
                                                $this.trigger("click");
                                            }
                                        });
                                    } else {
                                        patternsSwitch.removeClass("selected");
                                        btnsUl.eq(2).find("div:first-child").css({
                                            "background-position" : ""
                                        });
                                    }
                                    break;
                                case "sticker":
                                    if (value) {
                                        stickerSwitch.each(function() {
                                            var $this = $(this);
                                            if (value.indexOf($this.data("img")) != -1) {
                                                $this.trigger("click");
                                            }
                                        });
                                    } else {
                                        stickerSwitch.removeClass("selected");
                                        btnsUl.eq(3).find("div:first-child").css({
                                            "background-position" : ""
                                        });
                                    }
                                    break;
                                case "background":
                                    if (value != "images/overlay-bg-new.jpg") {
                                        backgroundSwitch.each(function() {
                                            var $this = $(this);
                                            if (value.indexOf($this.data("img")) != -1) {
                                                $this.trigger("click");
                                            }
                                        });
                                    } else {
                                        changeBg("spon-garage-pop.png");
                                        backgroundSwitch.removeClass("selected");
                                        btnsUl.eq(1).find("div:first-child").css({
                                            "background-position" : ""
                                        });
                                    }
                                    break;
                            }
                        });
                        setTimeout(function() {
                            $this.removeClass("selected");
                        }, 100);
                        break;
                    case "upload":
                        setTimeout(function() {
                            $this.removeClass("selected");
                        }, 100);
                        $(".color-info").hide();
                        pc.trigger("SHOW-CAR-UPLOAD", ["upload"]);
                        setTimeout(function() {
                            canvasCompose.upload(function(data) {
                                console.log(data);
                                var datas, isJson = true;
                                try {
                                    datas = $.parseJSON(data);
                                } catch(e) {
                                    isJson = false;
                                }
                                if (!isJson || datas.error) {
                                    alert("An error accurs. Please try again.");
                                    pc.trigger("hideOverklay");
                                } else {
                                    pc.data("current-design", datas);
                                    pc.trigger("SHOW-CAR-UPLOAD", ["complete"]);
                                    $("#download-btn").attr("href", "php/download.php?path=" + datas.url);
                                }
                            });
                        }, 400)
                        break;
                    default:
                        if ($this.data("target") == "colors-switch") {
                            $(".color-info").fadeIn();
                        } else {
                            $(".color-info").fadeOut();
                        }
                        currentTarget = $("#" + $this.data("target"));
                        currentTarget.stop().fadeIn();
                        if (currentTarget.find("li").length <= 7) {
                            return;
                        }
                        if (currentTarget.data("position") == "right") {
                            leftBtn.show();
                            rightBtn.hide();
                        } else {
                            leftBtn.hide();
                            rightBtn.show();
                        }
                        break;
                }
            }).on("mouseover", "li", function() {
                if (!pc.hasTouch) {
                    var $this = $(this);
                    garageSltBubble.find("p").html($this.attr("data-title"));
                    garageSltBubble.show().css("left", $this.outerWidth() * $this.data("index") - ((garageSltBubble.width() - $this.outerWidth())) / 2).fadeIn();
                }
            }).on("mouseleave", "li", function() {
                if (!pc.hasTouch) {
                    garageSltBubble.hide();
                }
            }).find("li").each(function(i) {
                $(this).data("index", i);
            });

            var firstName = $("#first-name"), friendName = $("#last-name"), email = $("#email"), sumbit = $("#submit");
            initForm();
            var emailReg = /^\w+([-\.]\w+)*@\w+([\.-]\w+)*\.\w{2,4}$/;
            var nameReg = /^[A-Za-z]{1,7}$/;

            function changeBg(bgSrc) {
                if (currentBg == bgSrc) {
                    return;
                }
                currentBg = bgSrc;
                garageBoard.data({
                    "img-src" : bgSrc,
                    "fill-mode" : "canvas",
                    "fill-class" : "wish-fill-img bg"
                }).addClass('imgload');
                imgLoader.load({
                    holder : garageBoard,
                    complete : function() {
                        var bgs = garageBoard.find(".bg");
                        if (bgs.length > 1) {
                            TweenMax.to(bgs.eq(0)[0], .35, {
                                alpha : 0,
                                ease : Quart.easeOut,
                                onComplete : function() {
                                    bgs.eq(0).remove();
                                }
                            });
                            TweenMax.fromTo(bgs.eq(1)[0], .35, {
                                alpha : 0,
                            }, {
                                alpha : 1,
                                ease : Quart.easeOut,
                                startAt : {
                                    alpha : 0,
                                }
                            });
                        }
                    },
                });
            }

            function initForm() {
                if (pc.ie8) {
                    firstName.val(firstName.attr("placeholder"));
                    friendName.val(friendName.attr("placeholder"));
                    email.val(email.attr("placeholder"));
                }

                $("form").on("focus", "input[type='text']", function() {
                    var $this = $(this);
                    if ($this.val() == $this.attr("placeholder")) {
                        $this.val("");
                    }
                    if (title.html() != title.data("content")) {
                        title.html(title.data("content")).removeClass("send-msg");
                    }
                }).on("blur", "input[type='text']", function() {
                    var $this = $(this);
                    // if ($.trim($this.val()) == '') {
                    // $this.addClass("error");
                    // } else {
                    // $this.removeClass("error");
                    // }
                    if (pc.ie8) {
                        if ($.trim($this.val()) == '') {
                            $this.val($this.attr("placeholder"));
                        }
                    }
                }).on("submit", function() {
                    submitForm();
                    return false;
                });

                firstName.on("blur", function() {
                    var $this = $(this);
                    if (!nameReg.test(firstName.val())) {
                        firstName.addClass("error");
                        if (firstName.val().indexOf(" ") != -1) {
                            firstName.next().html("There are no spaces allowed in this field.").css("visibility", "visible");
                        } else {
                            firstName.next().html("Please enter 7 characters or less.").css("visibility", "visible");
                        }
                    } else {
                        firstName.removeClass("error");
                        firstName.next().css("visibility", "hidden");
                    }
                });

                friendName.on("blur", function() {
                    if (!nameReg.test(friendName.val())) {
                        friendName.addClass("error");
                        if (friendName.val().indexOf(" ") != -1) {
                            friendName.next().html("There are no spaces allowed in this field.").css("visibility", "visible");
                        } else {
                            friendName.next().html("Please enter 7 characters or less.").css("visibility", "visible");
                        }
                    } else {
                        friendName.removeClass("error");
                        friendName.next().css("visibility", "hidden");
                    }
                });

                email.on("blur", function() {
                    if (!emailReg.test(email.val())) {
                        email.addClass("error");
                        email.next().html("Please enter a valid email address.").css("visibility", "visible");
                    } else {
                        email.removeClass("error");
                        email.next().css("visibility", "hidden");
                    }
                });

                sumbit.on("click", function() {
                    submitForm();
                    return false;
                });

                $("#submit-btn").on("click", function() {
                    sumbit.trigger("click");
                    return false;
                });
            }

            var title = $("#submitted-done-desc p");
            title.data("content", title.html());
            function submitForm() {
                var hasError = false;
                if (!nameReg.test(firstName.val()) || $.trim(firstName.val()) == firstName.attr("placeholder")) {
                    firstName.addClass("error");
                    hasError = true;
                } else {
                    firstName.removeClass("error");
                }
                if (!nameReg.test(friendName.val()) || $.trim(friendName.val()) == friendName.attr("placeholder")) {
                    friendName.addClass("error");
                    hasError = true;
                } else {
                    friendName.removeClass("error");
                }
                if ($.trim(email.val()) == '' || $.trim(email.val()) == email.attr("placeholder") || !emailReg.test(email.val())) {
                    email.addClass("error");
                    hasError = true;
                } else {
                    email.removeClass("error");
                }
                if (!hasError) {
                    if (sending) {
                        return;
                    }
                    sending = true;
                    firstName.trigger("blur");
                    friendName.trigger("blur");
                    email.trigger("blur");
                    sendTxt.html("Send...");
                    $.post("php/sendEmail.php", {
                        name : firstName.val(),
                        friendname : friendName.val(),
                        email : email.val(),
                        url : pc.data("current-design").url//s3Url +
                    }, function(data) {
                        var datas, isJson = true;
                        try {
                            datas = $.parseJSON(data);
                        } catch(e) {
                            isJson = false;
                        }
                        sending = false;
                        sendTxt.html("Send");
                        if (!isJson || !datas[0] || !datas[0].link) {
                            title.addClass("send-msg").html("An error accurs. Please try again.");
                            return;
                        }

                        title.addClass("send-msg").html("Your design has been sent. Thank you!");
                        if (pc.ie8) {
                            firstName.val(firstName.attr("placeholder"));
                            friendName.val(friendName.attr("placeholder"));
                            email.val(email.attr("placeholder"));
                        } else {
                            firstName.val("");
                            friendName.val("");
                            email.val("");
                        }
                    });
                }
            }

        }
    }), dragObj, garageBoard, garageSltBubble, currentBg, colorInfo, sending = false, sendTxt;
    return scheme;
});
