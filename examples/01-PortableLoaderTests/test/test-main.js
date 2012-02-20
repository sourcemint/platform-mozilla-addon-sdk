
exports.test_main = function(test)
{
	test.waitUntilDone(1000 * 10);

	require("main").main().then(function()
	{
		console.log("DONE!");
		test.done();
	}, function(e)
	{
		console.log(e);
	});
};
