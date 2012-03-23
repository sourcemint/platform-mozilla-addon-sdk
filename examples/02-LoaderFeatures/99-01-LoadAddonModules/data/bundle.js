
require.bundle("", function(require)
{
	require.memoize("/main.js", function(require, exports, module)
	{
	    var Q = require.API.Q,
	        TIMERS = require("__addon-kit__/timers");

		exports.main = function()
		{
		    var deferred = Q.defer();

		    TIMERS.setTimeout(function()
		    {
		        console.log("Hello from bundle!");

		        deferred.resolve();
		    }, 500);

		    return deferred.promise;
		}
	});
	
	require.memoize("/package.json", {
	    "main": "/main.js",
	    "mappings":{"__addon-kit__":"__mozilla.org/addon-sdk/addon-kit/0__"}
	});	
});
