var ghunit = require('./ghunit');

var suites = [
    require('./auth-test.js').suite,
    require('./dispatcher-test.js').suite,
    require('./ghp-test.js').suite,
    require('./gzip-test.js').suite,
    require('./helpers-test.js').suite,
    require('./i18n-test.js').suite,
    require('./model-test.js').suite,
    require('./routes-test.js').suite,
    require('./wrapper-test.js').suite
];

ghunit.test.apply(null, suites);
