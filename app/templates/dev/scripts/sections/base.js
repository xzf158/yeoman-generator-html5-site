/**
 * @author Terry
 */
define(["libs/class", "tools/img.loader", "animate/section.ani"], function(Class, imageLoader, sectionAni) {
    var subClassArray = [], subInstanceArray = [], hasInit = false, options = {
        showLoading : undefined,
        hideLoading : undefined
    };
    var SectionBase = Class.extend({
        holder : undefined,
        index : 0,
        waitting : false,
        refresh : function(isEnd) {
        },
        resize : function(isEnd) {
        },
        prepare : function(callback) {
            if (this.holder) {
                imageLoader.load({
                    holder : this.holder,
                    complete : function() {
                        if (callback && typeof (callback) == "function") {
                            callback.call(this);
                        }
                    }
                });
            } else {
                if (callback && typeof (callback) == "function") {
                    callback.call(this);
                }
            }
        },
        enter : function(isLeft, callback, duration) {
            var scope = this;
            sectionAni.enter(scope, isLeft, function() {
                scope.afterEnter.call(scope);
                if (callback && typeof (callback) == "function") {
                    callback.call(scope);
                }
                SectionBase.animating = false;
            }, duration);
        },
        beforeEnter : function() {
            //if need wait for loading something
            //must return false, after complete
            //loading, set this.waitting = false;
            return true;
        },
        afterEnter : function() {
            return true;
        },
        exit : function(isLeft, callback, duration) {
            var scope = this;
            sectionAni.exit(scope, isLeft, function() {
                scope.afterExit.call(scope);
                if (callback && typeof (callback) == "function") {
                    callback.call(scope);
                }
            }, duration);
        },
        beforeExit : function() {
            //return false will stop page switch
            return true;
        },
        afterExit : function() {
            return true;
        },
        switchTo : function(to, enterCallback, exitCallBack, errorCallback, duration) {
            if (SectionBase.animating)
                return;
            var scope = this;
            SectionBase.animating = true;
            if (options.showLoading && typeof (options.showLoading) == "function") {
                options.showLoading.call(this);
            }

            require.config({
                catchError : false
            });
            require([to], function(toPage) {
                SectionBase.toPage = toPage.inst;
                if (toPage.inst == SectionBase.cs) {
                    SectionBase.animating = false;
                    if (options.hideLoading && typeof (options.hideLoading) == "function") {
                        options.hideLoading.call(this, exitCallBack);
                    }
                    return;
                }
                if (!scope.beforeExit.call(scope)) {
                    return;
                }
                SectionBase.cs = toPage.inst;
                toPage.inst.prepare(function() {
                    toPage.inst.waitting = true;
                    if (toPage.inst.beforeEnter.call(toPage.inst)) {
                        doSwitch();
                    } else {
                        var timeId = setInterval(function() {
                            console.log(toPage.inst.waitting)
                            if (toPage.inst.waitting)
                                return;
                            clearInterval(timeId);
                            doSwitch();
                        }, 5);
                    }
                    function doSwitch() {
                        toPage.inst.enter.call(toPage.inst, toPage.inst.index > scope.index, enterCallback, duration);
                        scope.exit.call(scope, toPage.inst.index > scope.index, null, duration);

                        if (options.hideLoading && typeof (options.hideLoading) == "function") {
                            options.hideLoading.call(this, exitCallBack);
                        }
                    }

                });
            }, function(e) {
                errorCallback.call(this);
                SectionBase.animating = false;
                if (options.hideLoading && typeof (options.hideLoading) == "function") {
                    options.hideLoading.call(this, exitCallBack);
                }
            });
        }
    });

    //currentSection
    SectionBase.cs = undefined;
    SectionBase.toPage = undefined;
    SectionBase.animating = false;

    SectionBase.switchTo = function(to, callback, errorCallback, duration) {
        if (SectionBase.cs) {
            SectionBase.cs.switchTo(to, callback, null, errorCallback, duration);
        }
    }

    SectionBase.refresh = function(isEnd) {
        for (var i = 0, il = subInstanceArray.length; i < il; i++) {
            subInstanceArray[i].refresh(isEnd);
        }
    }

    SectionBase.resize = function(isEnd) {
        for (var i = 0, il = subInstanceArray.length; i < il; i++) {
            subInstanceArray[i].resize(isEnd);
        }
    }

    SectionBase._extend = SectionBase.extend;

    SectionBase.extend = function(pros) {
        var subClass = SectionBase._extend(pros);
        subClassArray.push(subClass);
        if (hasInit) {//when base has init, create object auto;
            subClass.inst = new subClass();
            subInstanceArray.push(subClass.inst);
        }
        return subClass;
    }

    SectionBase.init = function(_options) {
        hasInit = true;
        options = _options;
        for (var i = 0, il = subClassArray.length; i < il; i++) {
            if (!subClassArray[i].inst) {
                var subInstance = new subClassArray[i]();
                subClassArray[i].inst = subInstance;
                subInstanceArray.push(subInstance);
                SectionBase.cs = subClassArray[i].inst;
            }
        }
    }

    return SectionBase;
});
