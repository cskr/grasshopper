var wrapper = require('../grasshopper/lib/wrapper'),
    mocks = require('./mocks'),
    assert = require('assert');

exports.name = 'Wrapper Tests';

exports.tests = {
    'writeHead.': function(next) {
        var res = new mocks.MockResponse(),
            wrapped = new wrapper.api.ResponseWrapper(res);
        wrapped.writeHead(200, 'Done', {key: 'value'});
        assert.equal(res.statusCode, 200);
        assert.equal(res.reasonPhrase, 'Done');
        assert.deepEqual(res.headers, {key: 'value'});
        next();
    },

    'write.': function(next) {
        var res = new mocks.MockResponse(),
            wrapped = new wrapper.api.ResponseWrapper(res);
        wrapped.write('hello ', 'utf8');
        wrapped.write('world', 'utf8');
        assert.deepEqual(res.chunks, ['hello ', 'world']);
        assert.deepEqual(res.encodings, ['utf8', 'utf8']);
        next();
    },

    'end.': function(next) {
        var res = new mocks.MockResponse(),
            wrapped = new wrapper.api.ResponseWrapper(res);
        wrapped.end('world', 'utf8');
        assert.equal(res.endData, 'world');
        assert.ok(!wrapped.writable);
        next();
    },

    'destroy.': function(next) {
        var res = new mocks.MockResponse(),
            wrapped = new wrapper.api.ResponseWrapper(res);
        wrapped.destroy();
        assert.ok(!wrapped.writable);
        next();
    },

    'Events.': function(next) {
        var res = new mocks.MockResponse(),
            wrapped = new wrapper.api.ResponseWrapper(res);

        var closeEmitted, drainEmitted, errorEmitted;
        var err = new Error('Dummy');

        wrapped.on('close', function() {
            closeEmitted = true;
        });
        wrapped.on('drain', function() {
            drainEmitted = true;
        });
        wrapped.on('error', function(exception) {
            assert.equal(exception, err);
            assert.ok(!wrapped.writable);
            errorEmitted = true;
        });

        res.emit('close');
        res.emit('drain');
        res.emit('error', err);
        
        assert.ok(closeEmitted);
        assert.ok(drainEmitted);
        assert.ok(errorEmitted);
        next();
    }
}
