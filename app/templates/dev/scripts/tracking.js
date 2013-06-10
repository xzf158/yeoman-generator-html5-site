/**
 * @author Terry
 */
if ( typeof (window.pageNameAppend) != "function") {
    window.pageNameAppend = function(name) {
        console.log("tracking: " + name);
    }
}