
var
	// TODO: Use NPM module here.
	LOADER = require("./loader-core"),
	{ Cc, Ci, CC, Cu } = require("chrome"),
	FILE = require("api-utils/file"),
	REQUEST = require("addon-kit/request").Request,
	Q = require("./q");
	
const sdkPackagingMeta = JSON.stringify(require("@packaging"));


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
		(options.resolveURI || resolveURI)(uri).then(function(uri)
		{
			Q.when(loadBundleCode(uri), function(code)
			{
			    try
			    {
			    	var sandbox = new Cu.Sandbox(Cc["@mozilla.org/systemprincipal;1"].createInstance(Ci.nsIPrincipal));

			    	sandbox.require = LOADER.require;
                    sandbox.console = console;

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

	options.onInitPackage = function(pkg, sandbox, options)
    {
        var origRequire = pkg.require;
        pkg.require = function(moduleIdentifier)
        {
            var canonicalId = (pkg.id + "/" + moduleIdentifier).replace(/\/+/, "/");

            // HACK
            // TODO: Use a better flag than '__' to indicate that module should be loaded here!
            if (pkg.id === "__mozilla.org/addon-sdk/addon-kit/0__")
            {
                var packaging = JSON.parse(sdkPackagingMeta);
                
                packaging.manifest["sourcemint-platform-mozilla-addon-sdk/lib/loader.js"].requirements["addon-kit/" + moduleIdentifier.replace(/\.js$/, "")] = {
                    path: "addon-kit/lib/" + moduleIdentifier
                };

                return {
                    exports: SDKLoader(module, {}, packaging).require("addon-kit/" + moduleIdentifier.replace(/\.js$/, ""))
                };
            }
            else
            if (pkg.id === "__mozilla.org/addon-sdk/api-utils/0__")
            {
                var packaging = JSON.parse(sdkPackagingMeta);
                
                packaging.manifest["sourcemint-platform-mozilla-addon-sdk/lib/loader.js"].requirements["api-utils/" + moduleIdentifier.replace(/\.js$/, "")] = {
                    path: "api-utils/lib/" + moduleIdentifier
                };

                return {
                    exports: SDKLoader(module, {}, packaging).require("api-utils/" + moduleIdentifier.replace(/\.js$/, ""))
                };
            }
            else
            {
                return origRequire(moduleIdentifier);
            }
        };

        pkg.require.id = origRequire.id;
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

	if ((m = uri.match(/^http(s)?:\/\/([^\/]*)(.*)$/)) || (m = uri.match(/^resource:\/\//)))
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
        // Check for resource url.
        if ((m = uri.match(/^resource:\/\//)))
        {
            // TODO: Pass this implementation as `options.readFile` to github.com/sourcemint/downloader-js/lib/bundle.js#loadBundleCode
            return FILE.read(require("api-utils/url").toFilename(uri), "r");
        }
        else
		// Check for HTTP(S) URI.
		if ((m = uri.match(/^http(s)?:\/\/([^\/]*)(.*)$/)))
		{
			// TODO: Relocate to github.com/sourcemint/downloader-js/lib/fetcher.js
		    var r = REQUEST({
                url: uri,
                onComplete: function(response)
                {
                    if (response.status !== 200)
                    {
                        // TODO: Bubble this up to the loader's error handler.
                        throw new Error("Did not get status 200 for URL: " + uri);
                    }
                    deferred.resolve(response.text);
                }
            }).get();
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


var SDKLoader = function(module, globals, packaging) {
  var { Loader } = require("@loader");
  var options = packaging;
  options.globals = globals;
  let loader = Loader.new(options);
  return Object.create(loader, {
    require: { value: Loader.require.bind(loader, module.path) },
    sandbox: { value: function sandbox(id) {
      let path = options.manifest[module.path].requirements[id].path;
      return loader.sandboxes[path].sandbox;
    }},
    unload: { value: function unload(reason, callback) {
      loader.unload(reason, callback);
    }}
  })
};

