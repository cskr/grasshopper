var Cookie = require('../../grasshopper/lib/cookie').api.Cookie,
    assert = require('assert');

var suite = {name: 'Cookie Tests'};
exports.suite = suite;

suite.tests = {
    'Cookie construction.': function(next) {
        var c = new Cookie('language', 'JS');
        assert.equal(c.name, 'language');
        assert.equal(c.value, 'JS');
        assert.equal(c.path, '/');
        assert.equal(c.httpOnly, true);
        next();
    }
};

if(process.argv[1] == __filename)
    require('../common/ghunit').test(suite);
