
var LOADER = require("sourcemint-platform-mozilla-addon-sdk/loader"),
    Q = require("sourcemint-platform-mozilla-addon-sdk/q");


exports.main = function()
{
    var deferred = Q.defer();

    LOADER.sandbox(require("self").data.url("bundle.js"), function(sandbox)
    {
        Q.when(sandbox.main(), function() {
            deferred.resolve();
        });
    }, {
        onInitModule: function(moduleInterface, moduleObj)
        {
            moduleObj.require.API = {
                Q: Q
            };
        }
    });

    return deferred.promise;
}
