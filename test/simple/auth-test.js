var RequestContext = require('../../grasshopper/lib/renderer').RequestContext,
    assert = require('assert'),
    mocks = require('../common/mocks'),
    base64 = require('../../grasshopper/lib/base64');

var suite = {name: 'Authentication Tests'};
exports.suite = suite;

suite.tests = {
    'Basic getAuth().': function(next) {
        var req = new mocks.MockRequest('GET', '/', {
            authorization: 'Basic ' + base64.encode('Chandru:Pass')
        });
        var ctx = new RequestContext(req, new mocks.MockResponse(), {});
        assert.deepEqual(ctx.getAuth(), {
            username: 'Chandru',
            password: 'Pass'
        });
        next();
    },

    'Digest getAuth().': function(next) {
        var req = new mocks.MockRequest('GET', '/', {
            authorization: 'Digest key1="value1", key2=value2'
        });
        var ctx = new RequestContext(req, new mocks.MockResponse(), {});
        assert.deepEqual(ctx.getAuth(), {
            key1: 'value1',
            key2: 'value2'
        });
        next();
    },

    'Auth Challenge.': function(next) {
        var req = new mocks.MockRequest('GET', '/', {}),
            res = new mocks.MockResponse();

        var ctx = new RequestContext(req, res, {});
        ctx.challengeAuth('Digest', {key1: 'value1', key2: 'value2'});
        assert.deepEqual(ctx.headers['www-authenticate'], 
                         'Digest key1="value1",key2="value2"');
        next();
    }
};

if(process.argv[1] == __filename)
    require('../common/ghunit').test(suite);
