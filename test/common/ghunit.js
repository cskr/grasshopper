exports.test = function() {
    var suites = arguments;
    var failures = [], passes = 0;

    for(var i = 0; i < suites.length; i++) {
        suite = suites[i];

        if(suite.setup === undefined) {
            suite.setup = function(next) { next(); }
        }
        if(suite.tearDown === undefined) {
            suite.tearDown = function(next) { next(); }
        }
        if(suite.setupOnce === undefined) {
            suite.setupOnce = function(next) { next(); }
        }
        if(suite.tearDownOnce === undefined) {
            suite.tearDownOnce = function(next) { next(); }
        }
    }

    var suite = suites[0], suiteIndex = 0, tests = Object.keys(suite.tests),
        testIndex = -1;

    suite.setupOnce(nextTest);

    function nextTest() {
        if(testIndex < Object.keys(suite.tests).length - 1) {
            testIndex++;
            runTest();
        } else if(suiteIndex < suites.length - 1) {
            suiteIndex++;
            testIndex = 0;
            suite = suites[suiteIndex];
            tests = Object.keys(suite.tests);
            suite.setupOnce(runTest);
        } else {
            printResult();
        }
    }

    function runTest() {
        console.log(tests[testIndex] + ' [' + suite.name + ']');

        suite.setup(function() {
		    suite.tests[tests[testIndex]](function() {
		        passes++;
                runTearDown();
		    });
		});
    }

    function runTearDown() {
        if(testIndex < Object.keys(suite.tests).length - 1) {
            suite.tearDown(nextTest);
        } else {
            suite.tearDown(function() {
                suite.tearDownOnce(nextTest);
            });
        }
    }

    process.on('uncaughtException', function(err) {
        failures.push(tests[testIndex] + ' [' + suite.name + ']');
        console.log(err.stack);
        nextTest();
    });

    function printResult() {
        console.log('\n--------------------');
        console.log('Passed: ' + passes + ', Failed: ' + failures.length);

        if(failures.length > 0) {
            console.log('\nFailures:');

            failures.forEach(function(failure) {
                console.log(failure);
            });
        }

        console.log('');
    }
}
