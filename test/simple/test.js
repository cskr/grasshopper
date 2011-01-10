var suites = [
    require('./dispatcher-test').suite,
    require('./ghp-test').suite,
    require('./gzip-test').suite,
    require('./helpers-test').suite,
    require('./i18n-test').suite,
    require('./model-test').suite,
    require('./routes-test').suite,
    require('./wrapper-test').suite,
    require('./params-test').suite,
    require('./cookie-test').suite,
    require('./context-test').suite
];

require('../common/ghunit').test.apply(null, suites);
