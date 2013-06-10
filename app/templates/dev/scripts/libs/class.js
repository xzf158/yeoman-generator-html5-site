/**
 * @author Terry
 */
define(function() {
    var initializing = false, fnTest = /xyz/.test(function() { xyz;
    }) ? /\b_super\b/ : /.*/;
    var Class = function() {
    };
    Class.extend = function(prop) {
        var _super = this.prototype;
        initializing = true;
        var prototype = new this();
        initializing = false;
        for (var name in prop) {
            prototype[name] = typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name]) ? (function(name, fn) {
                return function() {
                    var tmp = this._super;
                    this._super = _super[name];
                    var ret = fn.apply(this, arguments);
                    this._super = tmp;
                    return ret;
                };
            })(name, prop[name]) : prop[name];
        }

        function SubClass() {
            if (!initializing && this.init)
                this.init.apply(this, arguments);
        }


        SubClass.prototype = prototype;
        SubClass.constructor = SubClass;
        SubClass.extend = arguments.callee;
        return SubClass;
    };

    function deepCopy(obj) {
        if (Object.prototype.toString.call(obj) === '[object Array]') {
            var out = [], i = 0, len = obj.length;
            for (; i < len; i++) {
                out[i] = arguments.callee(obj[i]);
            }
            return out;
        }
        if ( typeof obj === 'object') {
            console.log(obj);
            var out = {}, i;
            for (i in obj ) {
                out[i] = arguments.callee(obj[i]);
            }
            return out;
        }
        return obj;
    }

    return Class;
});
