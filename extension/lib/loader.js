
var
	// TODO: Use NPM module here.
	LOADER = require("./loader-core"),
	{ Cc, Ci, CC, Cu } = require("chrome"),
	FILE = require("api-utils/file"),
	XHR = require("api-utils/xhr"),
	Q = require("./q");


exports.getReport = LOADER.require.getReport;

exports.sandbox = function(sandboxIdentifier, loadedCallback, sandboxOptions)
{
	var options = {},
		key;

	for (key in sandboxOptions)
	{
		options[key] = sandboxOptions[key];
	}

	// Set our own loader for the sandbox.
	options.load = function(uri, loadedCallback)
    {
		resolveURI(uri).then(function(uri)
		{
			Q.when(loadBundleCode(uri), function(code)
			{
			    try
			    {
			    	var sandbox = new Cu.Sandbox(Cc["@mozilla.org/systemprincipal;1"].createInstance(Ci.nsIPrincipal));

			    	sandbox.require = LOADER.require;

			    	Cu.evalInSandbox(code, sandbox, "1.8", uri, 0);

			        loadedCallback();		        
			    }
			    catch(e)
			    {
			    	// TODO: Bubble this up to the loader's error handler.
		            console.error("Error '" + e + "' in '" + e.fileName + "' on line '" + e.lineNumber + "'!");
			    }
			}, function(err)
			{
		    	// TODO: Bubble this up to the loader's error handler.
				console.error(err);
			});

		}, function(err)
		{
	    	// TODO: Bubble this up to the loader's error handler.
			console.error(err);
		});
	}

	LOADER.require.sandbox(sandboxIdentifier, function(sandbox)
	{
		loadedCallback(sandbox);
	}, options);
}


// TODO: Relocate this to github.com/pinf/core-js/lib/resolver.js and return PINF URI info object.
var resolveURI = exports.resolveURI = function resolveURI(uri)
{
	var deferred = Q.defer(),
		m;

	// The github case.
	// TODO: Match various vendor APIS.
	if ((m = uri.match(/^(github.com\/sourcemint\/loader-js\/0)\/-raw\/(.*)$/)))
	{
		// TODO: Get `/pinf/workspaces` from `ENV.PINF_WORKSPACES` implemented at github.com/pinf/core-js/lib/env.js
		deferred.resolve("/pinf/workspaces/" + m[1] + "/" + m[2]);
	}
	else
	if ((m = uri.match(/^http(s)?:\/\/([^\/]*)(.*)$/)))
	{
		deferred.resolve(uri);
	}
	else
	{
		throw new Error("Unable to resolve URI: " + uri);
		deferred.reject();
	}
	
	return deferred.promise;
}

//TODO: Relocate this to github.com/sourcemint/downloader-js/lib/bundle.js#loadBundleCode
function loadBundleCode(uri)
{
	var deferred = Q.defer(),
		m;
	
	try
	{
		// Check for local absolute file path.
		if ((m = uri.match(/^(\/.*)$/)))
		{
			// TODO: Pass this implementation as `options.readFile` to github.com/sourcemint/downloader-js/lib/bundle.js#loadBundleCode
			return FILE.read(uri, "r");
		}
		else
		// Check for HTTP(S) URI.
		if ((m = uri.match(/^http(s)?:\/\/([^\/]*)(.*)$/)))
		{
			// TODO: Relocate to github.com/sourcemint/downloader-js/lib/fetcher.js
			var request = new XHR.XMLHttpRequest();  
			request.open("GET", uri, true);  
			request.onreadystatechange = function (event)
			{  
			    if (request.readyState === 4)
			    {
					if (request.status !== 200)
					{
				    	// TODO: Bubble this up to the loader's error handler.
						throw new Error("Did not get status 200 for URL: " + uri);
					}

					deferred.resolve(request.responseText);
			    }
			};
			request.send(null); 
		}
		else
		{
			deferred.reject(new Error("Unable to load bundle code from URI: " + uri));
		}
	}
	catch(e)
	{
		console.error(e);
	}
	return deferred.promise;
}

