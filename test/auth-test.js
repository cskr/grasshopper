var RequestContext = require('../grasshopper/lib/renderer').RequestContext,
    assert = require('assert'),
    base64 = require('../grasshopper/lib/base64');

exports.name = 'Authentication Tests'

exports.tests = {
    'Basic getAuth().': function(next) {
        var mockRequest = {
            url: '/',
            headers: {
                authorization: 'Basic ' + base64.encode('Chandru:Pass')
            }
        };
        var ctx = new RequestContext(mockRequest, {}, {});
        assert.deepEqual(ctx.getAuth(), {
                            username: 'Chandru',
                            password: 'Pass'
                        });
        next();
    },

    'Digest getAuth().': function(next) {
        var mockRequest = {
            url: '/',
            headers: {
                authorization: 'Digest key1="value1", key2=value2'
            }
        };
        var ctx = new RequestContext(mockRequest, {}, {});
        assert.deepEqual(ctx.getAuth(), {
                            key1: 'value1',
                            key2: 'value2'
                        });
        next();
    },

    'Auth Challenge.': function(next) {
        var mockRequest = {
            url: '/',
            headers: {}
        },

        mockResponse = {
            writeHead: function() {},
            end: function() {}
        };

        var ctx = new RequestContext(mockRequest, mockResponse, {});
        ctx.challengeAuth('Digest', {key1: 'value1', key2: 'value2'});
        assert.deepEqual(ctx.headers['www-authenticate'], 
                         'Digest key1="value1",key2="value2"');
        next();
    }
};
