var sys = require('sys');
var suites = [
    './ghp-test', './model-test', './helpers-test', './i18n-test', './dispatch-test'
];

var failures = [], passes = 0;

var suite = require(suites[0]), suiteIndex = 0, tests = Object.keys(suite.tests), testIndex = -1;

nextTest();

function nextTest() {
    if(testIndex < Object.keys(suite.tests).length - 1) {
        testIndex++;
        runTest();
    } else if(suiteIndex < suites.length - 1) {
        suiteIndex++;
        testIndex = 0;
        suite = require(suites[suiteIndex]);
        tests = Object.keys(suite.tests);
        runTest();
    } else {
        printResult();
    }
}

function runTest() {
    console.log(tests[testIndex] + ' [' + suite.name + ']');
    suite.tests[tests[testIndex]](function() {
        passes++;
        nextTest();
    });
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
