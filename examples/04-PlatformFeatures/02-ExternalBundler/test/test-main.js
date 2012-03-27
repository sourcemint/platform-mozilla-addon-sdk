
const { Cc, Ci } = require("chrome");
const TIMERS = require("addon-kit/timers");


exports.test_main = function(test)
{
	test.waitUntilDone(1000 * 6);

	startBundlerProcess(function(process)
	{
	    require("main").main().then(function()
        {
            test.pass("OK!");
        }, function(e)
        {
            test.fail(e);
        }).fin(function() {
            console.log("Stopping bundler server.");
            process.kill();
            test.done();
        });
	});
};

function startBundlerProcess(callback)
{
    console.log("Starting bundler server.");
    
    // TODO: Get path via staticArgs
    var cmd = "/usr/local/bin/node";
    
    // TODO: Get path via staticArgs
    var args = ["/pinf/workspaces/github.com/sourcemint/platform-nodejs/0/examples/04-PlatformFeatures/02-BundlerMiddleware/main.js"];

    var execFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
    var process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);

    execFile.initWithPath(cmd);

    process.init(execFile);

    process.run(false, args, args.length);

    // TODO: Better alive detection.
    TIMERS.setTimeout(function()
    {
        callback(process);
    }, 2000);
}
