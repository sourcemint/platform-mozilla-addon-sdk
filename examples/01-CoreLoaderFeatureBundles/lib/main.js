
var LOADER = require("sourcemint-platform-mozilla-addon-sdk/loader"),
	Q = require("sourcemint-platform-mozilla-addon-sdk/q"),
	FILE = require("api-utils/file");


exports.main = function()
{
	var deferred = Q.defer();

	function logToOutput(moduleObj, argsIn)
	{
		var args = [],
			i;
		for (i in argsIn) {
			args.push(argsIn[i]);
		}
		console.log.apply(null, ["[" + moduleObj.require.sandbox.id + " : " + moduleObj.id + "]"].concat(args));
	}
	
	function logError()
	{
		var args = [],
			i;
		for (i in arguments) {
			args.push(arguments[i]);
		}
		if (typeof args[0] === "object" && typeof args[0].stack !== "undefined") {
			args.push(args[0].stack);
		}
		console.error.apply(null, ["[01-PortableLoaderTests]"].concat(args));
	}

	var status = {};
	
	function logStatus()
	{
	    for (var name in status)
	    {
	        console.log("  " + name + ": " + status[name]);
	    }
	}

	Q.when(Q.all([
        "01-HelloWorld",
        "02-ReturnExports",
        "03-SpecifyMain",
        "04-PackageLocalDependencies",
        "05-CrossPackageDependencies",
        "06-JsonModule",
        "07-TextModule",
        "08-ResourceURI",
        "09-LoadBundle",
        "10-Sandbox",
//        "11-CrossDomain",
        "12-Environment",
        "13-AssignExports",
        "NamedBundle",
        "Avoid-NestedBundles",
        "Avoid-SplitBundles"	              
	].map(function(name)
	{
		var result = Q.defer();
		
		try
		{
		    status[name] = "loading";
		    
			LOADER.sandbox("github.com/sourcemint/loader-js/0/-raw/examples/" + name + ".js", function(sandbox)
			{
	            status[name] = "loaded";
			    
				try {
					Q.when(sandbox.main({
					    debug: true
					}), function() {

					    status[name] = "success";
					    
					    result.resolve();
					    
//					    logStatus();
					    
					}, function() {
                        
					    status[name] = "failed";

                        result.reject();
                        
//                        logStatus();
					});
				} catch(e) {
					result.reject(e);
				}
				
//                logStatus();
				
			}, {
				onInitModule: function(moduleInterface, moduleObj)
				{
					moduleObj.require.API = {
						Q: Q,
						JQUERY: function(ready)
						{
						    ready({
						        get: function(uri, loaded) {
                                    LOADER.resolveURI(uri).then(function(uri) {
                                        loaded(FILE.read(uri, "r"));
                                    }, function(e) {
                                        console.log(e);
                                    });
						        }
						    });
						}
					};
					moduleInterface.log = function()
					{
						logToOutput(moduleObj, arguments);
					};
					moduleInterface.logForModule = function(moduleObj, argsIn)
					{
						logToOutput(moduleObj, argsIn);
					};
				}
			});
		}
		catch(e)
		{
			console.log(e);
		}
	
		return result.promise;
	})), function()
	{
		console.log(JSON.stringify(LOADER.getReport()));

		deferred.resolve();
		
	}, function(e)
	{
		logError(e);
	});
	
	return deferred.promise;
}
