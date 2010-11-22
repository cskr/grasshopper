var assert = require('assert'),
    http = require('http'),
    fs = require('fs'),
    testUtil = require('../test-util'),
    gh = require('../../../grasshopper');

require('./test-routes');

var suite = {name: 'Dispatch System Tests'};
exports.suite = suite;

suite.setupOnce = function(next) {
    gh.serve(8080, function() {
        next();
    });
};

suite.tests = {
    'GET with param.': function(next) {
        testUtil.invoke('GET', '/?name=Chandru', {}, function(res) {
            res.on('data', function(chunk) {
                assert.equal(chunk, 'Chandru');
                next();
            });
        });
    },

    'GET with URL argument.': function(next) {
        testUtil.invoke('GET', '/args_supported/Chandru', {}, function(res) {
            res.on('data', function(chunk) {
                assert.equal(chunk, 'Chandru');
                next();
            });
        });
    },

    'GET with template.': function(next) {
        testUtil.invoke('GET', '/templated/Chandru', {}, function(res) {
            res.on('data', function(chunk) {
                assert.equal(chunk, 'Hello, Chandru!\n');
                next();
            });
        });
    },

    'POST.': function(next) {
        testUtil.invoke('POST', '/', {}, 'name=Chandru', function(res) {
            res.on('data', function(chunk) {
                assert.equal(chunk, 'Chandru');
                next();
            });
        });
    },

    'Filtered GET.': function(next) {
        testUtil.invoke('GET', '/filtered', {}, function(res) {
            res.on('data', function(chunk) {
                assert.equal(chunk, 'Filtered');
                next();
            });
        });
    },

    'Multi-part POST.': function(next) {
        var boundary = '------AABBCC';

        var init = '--' + boundary + '\r\n';
        init += 'Content-Disposition: form-data; name="name"\r\n';
        init += 'Content-Type: text/plain; charset=ISO-8859-1\r\n';
        init += 'Content-Transfer-Encoding: 8bit\r\n\r\n';
        init += 'Chandru\r\n';
        init += '--' + boundary + '\r\n';
        init += 'Content-Disposition: form-data; name="file"; '
                    + 'filename="test.pdf"';
        init += '\r\nContent-Type: \r\n';
        init += 'Content-Transfer-Encoding: binary\r\n\r\n';

        var body = fs.readFileSync(__dirname + '/statics/test.pdf');

        var end = '\r\n--' + boundary + '--\r\n'; 

        var bodyLength = Buffer.byteLength(init)
                            + body.length + Buffer.byteLength(end);

        var headers = {
            'content-length': bodyLength,
            'content-type': 'multipart/form-data; boundary=' + boundary,
        };

        var bodyBuf = new Buffer(bodyLength);
        bodyBuf.write(init);
        body.copy(bodyBuf, Buffer.byteLength(init), 0);
        bodyBuf.write(end, Buffer.byteLength(init) + body.length);

        testUtil.invoke('POST', '/upload', headers, bodyBuf,function(res) {
            res.on('data', function(chunk) {
                assert.equal(chunk, 'Received: Chandru, test.pdf - '
                                + body.length);
                next();
            });
        });
    },

    'Static file.': function(next) {
        testUtil.invoke('GET', '/test.pdf', {}, function(res) {
            assert.equal(res.headers['content-length'], 51560);
            next();
        });
    },

    'Send static file.': function(next) {
        testUtil.invoke('GET', '/send_file', {}, function(res) {
            assert.equal(res.headers['content-disposition'],
                            'attachment; filename="test.pdf"');
            assert.equal(res.headers['content-length'], 51560);
            next();
        });
    }
}

suite.tearDownOnce = function(next) {
    gh.stop();
    next();
};

if(process.argv[1] == __filename)
    require('../../common/ghunit').test(suite);
