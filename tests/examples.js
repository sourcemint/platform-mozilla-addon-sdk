
var Q = require("q"),
	PATH = require("path"),
	FS = require("fs"),
	EXEC = require("child_process").exec,
	ERROR = require("sourcemint-platform-nodejs/lib/util/error");

exports.main = function()
{
    const PACKAGE_BASE_PATH = FS.realpathSync(PATH.dirname(__dirname));
    const EXAMPLES_BASE_PATH = PACKAGE_BASE_PATH + "/examples";
    
    var done = Q.ref();
    
    FS.readdirSync(EXAMPLES_BASE_PATH).forEach(function(filename)
    {
        var basePath = EXAMPLES_BASE_PATH + "/" + filename;

        if (PATH.existsSync(basePath + "/package.json"))
        {
            done = Q.when(done, function()
            {
                var deferred = Q.defer();

                EXEC(__dirname + "/../support/mozilla-addon-sdk/bin/cfx test", {
                    cwd: basePath
                }, function(err, stdout, stderr)
                {
                    if (err) deferred.reject(err);
                    else if (/Program terminated successfully.[\s\n]*$/.test(stderr)) {
                        process.stdout.write(stderr);
                        deferred.resolve()
                    } else {
                        deferred.reject(stderr)
                    }
                });

                return deferred.promise;
            });
        }
    });

    return done;
}

if (require.main === module) {
	exports.main().fail(ERROR.exitProcessWithError);
}