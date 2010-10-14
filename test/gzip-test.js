var gzip = require('../grasshopper/lib/gzip'),
    mocks = require('./mocks'),
    assert = require('assert');

exports.name = 'Gzip Tests';

exports.tests = {
    'Normal compression.': function(next) {
        var res = new mocks.MockResponse(),
            wrapped = new gzip.GzipResponseWrapper(res);
        wrapped.writeHead(200, 'Done', {'content-length': 20});
        assert.equal(res.statusCode, 200);
        assert.equal(res.reasonPhrase, 'Done');
        assert.deepEqual(res.headers, {
            'content-encoding': 'gzip',
            'transfer-encoding': 'chunked'
        });
        next();
    },

    'Ignore compression when already encoded.': function(next) {
        var res = new mocks.MockResponse(),
            wrapped = new gzip.GzipResponseWrapper(res);
        wrapped.writeHead(200, 'Done', {
            'content-encoding': 'gzip',
            'content-length': 20
        });
        assert.equal(res.statusCode, 200);
        assert.equal(res.reasonPhrase, 'Done');
        assert.deepEqual(res.headers, {
            'content-encoding': 'gzip',
            'content-length': 20
        });
        next();
    }
}
