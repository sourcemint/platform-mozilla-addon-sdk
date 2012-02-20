
var TIMERS = require("timers");


exports.enqueue = function(task)
{
    TIMERS.setTimeout(task, 0);
};
