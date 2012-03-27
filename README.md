Sourcemint Mozilla Add-on SDK Platform
======================================

*Status: ALPHA*

Everything needed to use the [Sourcemint](http://sourcemint.com/) Ecosystem
(including the [Sourcemint JavaScript Loader](https://github.com/sourcemint/loader-js)) with the 
[Mozilla Add-on SDK](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/).

  * Copyright: 2012 [Christoph Dorn](http://www.christophdorn.com/)
  * Code License: [MIT License](http://www.opensource.org/licenses/mit-license.php)
  * Docs License: [Creative Commons Attribution-NonCommercial-ShareAlike 3.0](http://creativecommons.org/licenses/by-nc-sa/3.0/)
  * Sponsor: [Sourcemint](http://sourcemint.com/)
  * Mailing list: [groups.google.com/group/sourcemint](http://groups.google.com/group/sourcemint)

Usage
=====

Install
-------

    git clone git://github.com/sourcemint/platform-mozilla-addon-sdk.git sourcemint-platform-mozilla-addon-sdk
    cd sourcemint-platform-mozilla-addon-sdk
    git submodule update --init --recursive
    npm install
    npm test

Activate add-on SDK:

    cd ./support/mozilla-addon-sdk
    source bin/activate
    cd ../..

Examples
--------

Run all examples with:

    npm test

Look for how individual examples can be run in the test output.


In your own Add-on
------------------

Link `./extension` into the `packages/` directory of your extension and add dependency to `package.json`:

    {
        "dependencies": "sourcemint-platform-mozilla-addon-sdk"
    }

See [here](https://addons.mozilla.org/en-US/developers/docs/sdk/1.4/dev-guide/addon-development/third-party-packages.html) for more information.

Boot a program in a sandbox:

    var LOADER = require("sourcemint-platform-mozilla-addon-sdk/loader");
    
    LOADER.sandbox(uri, function(sandbox)
    {
        sandbox.main();
    });

More examples and documentation will be available in time.
