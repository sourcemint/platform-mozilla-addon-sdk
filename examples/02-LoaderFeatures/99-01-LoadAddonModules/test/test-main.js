
exports.test_main = function(test)
{
	test.waitUntilDone(1000 * 2);

	require("main").main().then(function()
	{
		test.pass("OK!");		
		test.done();
	}, function(e)
	{
	    test.fail(e);      
        test.done();
	});
};
