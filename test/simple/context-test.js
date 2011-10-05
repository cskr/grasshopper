var assert = require('assert'),
    mocks = require('../common/mocks'),
    MockRequest = mocks.MockRequest,
    MockResponse = mocks.MockResponse;

var context = require('../../grasshopper/lib/context'),
    base64 = require('../../grasshopper/lib/base64'),
    Cookie = require('../../grasshopper/lib/cookie').api.Cookie,
    RequestContext = context.RequestContext;

var suite = {name: 'Request Context Tests'};
exports.suite = suite;

suite.setupOnce = function(next) {
    mocks.mockModule('../../grasshopper/lib/i18n', {
        init: function(ctx) {
            ctx.locale = 'initialized-locale';
        }
    });
    mocks.mockModule('../../grasshopper/lib/ghp', {
        fill: function(template, response, model, encoding, viewsDir, ext) {
            response.write(template + ' ' + JSON.stringify(model) + ' '
                                + encoding + ' ' + viewsDir + ' ' + ext);
            response.end();
        }
    });
    next();
};

suite.tearDownOnce = function(next) {
    mocks.unmockModule('../../grasshopper/lib/i18n');
    mocks.unmockModule('../../grasshopper/lib/ghp');
    next();
};

suite.tests = {
    'Context Initialization.': function(next) {
        var req = new MockRequest('GET', '/test.txt', {
            cookie: 'name=Chandru; city=Bangalore'
        });
        var res = new MockResponse();

        var ctx = new RequestContext(req, res);
        assert.equal(ctx.request, req);
        assert.equal(ctx.response, res);
        assert.deepEqual(ctx.model, {});
        assert.equal(ctx.status, 200);
        assert.equal(ctx.extn, 'txt');
        assert.equal(ctx.encoding, 'utf8');
        assert.equal(ctx.headers['content-type'], 'text/plain');
        assert.equal(ctx.headers['date'], new Date().toUTCString());
        assert.deepEqual(ctx.requestCookies, {
            name: 'Chandru',
            city: 'Bangalore'
        });
        assert.equal(ctx.locale, 'initialized-locale');
        assert.equal(ctx.charset, 'UTF-8');
        next();
    },

    'Render Text.': function(next) {
        var req = new MockRequest('GET', '/test.txt', {});
        var res = new MockResponse();

        var ctx = new RequestContext(req, res);
        ctx.renderText('Hello');
        assert.deepEqual(res.headers, {
            'content-type': 'text/plain; charset=UTF-8',
            date: new Date().toUTCString(),
            'x-powered-by': 'Grasshopper'
        });
        assert.deepEqual(res.chunks, ['Hello']);
        assert.deepEqual(res.encodings, ['utf8']);
        assert.ok(!res.writable);
        next();
    },

    'Render.': function(next) {
        var req = new MockRequest('GET', '/test.txt', {});
        var res = new MockResponse();

        var ctx = new RequestContext(req, res);
        ctx.model = { name: 'Chandru' };
        ctx.render('demo', function() {
            assert.deepEqual(res.chunks,
                ['./demo.txt {"name":"Chandru"} utf8 . txt']);
            assert.equal(res.statusCode, 200);
            next();
        });
    },

    'Render Alternate Layout.': function(next) {
        var req = new MockRequest('GET', '/test.txt', {});
        var res = new MockResponse();

        var ctx = new RequestContext(req, res);
        ctx.model = { name: 'Chandru' };
        ctx.render('demo', 'alt', function() {
            assert.deepEqual(res.chunks,
                ['alt.txt {"name":"Chandru","view":"demo"} utf8 . txt']);
            assert.equal(res.statusCode, 200);
            next();
        });
    },

    'Render Error.': function(next) {
        var req = new MockRequest('GET', '/test.txt', {});
        var res = new MockResponse();

        var ctx = new RequestContext(req, res);
        ctx.renderError(500, function() {
            assert.equal(res.statusCode, 500);
            next();
        });
    },

    'Redirect.': function(next) {
        var req = new MockRequest('GET', '/test.txt', {});
        var res = new MockResponse();

        var ctx = new RequestContext(req, res);
        ctx.redirect('/redirected_location', function() {
            assert.equal(res.statusCode, 302);
            assert.equal(res.headers['location'], '/redirected_location');
            assert.ok(!res.writable);
            next();
        });
    },

    'Disable cache.': function(next) {
        var req = new MockRequest('GET', '/test.txt', {});
        var res = new MockResponse();

        var ctx = new RequestContext(req, res);
        ctx.disableCache();
        assert.equal(ctx.headers['expires'], 'Thu, 11 Mar 2010 12:48:43 GMT');
        assert.equal(ctx.headers['cache-control'],
                        'no-store, no-cache, must-revalidate');
        assert.equal(ctx.headers['pragma'], 'no-cache');

        next();
    },

    'Basic getAuth().': function(next) {
        var req = new mocks.MockRequest('GET', '/', {
            authorization: 'Basic ' + base64.encode('Chandru:Pass')
        });
        var ctx = new RequestContext(req, new mocks.MockResponse());
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
        var ctx = new RequestContext(req, new mocks.MockResponse());
        assert.deepEqual(ctx.getAuth(), {
            key1: 'value1',
            key2: 'value2'
        });
        next();
    },

    'Auth Challenge.': function(next) {
        var req = new mocks.MockRequest('GET', '/', {}),
            res = new mocks.MockResponse();

        var ctx = new RequestContext(req, res);
        ctx.challengeAuth('Digest', {key1: 'value1', key2: 'value2'});
        assert.deepEqual(ctx.headers['www-authenticate'], 
                         'Digest key1="value1",key2="value2"');
        next();
    },

    'Add Cookie.': function(next) {
        var req = new MockRequest('GET', '/test.txt', {});
        var res = new MockResponse();

        var ctx = new RequestContext(req, res);
        ctx.addCookie(new Cookie('language', 'JS'));
        assert.equal(ctx.headers['set-cookie'],
                        'language=JS; path=/; HttpOnly');
        ctx.addCookie(new Cookie('vm', 'v8'));
        assert.equal(ctx.headers['set-cookie'],
                        'language=JS; path=/; HttpOnly'
                            + '\r\nset-cookie: vm=v8; path=/; HttpOnly');

        var ctx = new RequestContext(req, res, true);
        ctx.addCookie(new Cookie('language', 'JS'));
        assert.equal(ctx.headers['set-cookie'],
                        'language=JS; path=/; secure; HttpOnly');
        next();
    },

    'Send File.': function(next) {
        var req = new MockRequest('GET', '/test.txt', {});
        var res = new MockResponse();

        var ctx = new RequestContext(req, res);
        ctx.sendFile('../fixtures/static/send_file.txt', function() {
            assert.equal(res.headers['content-disposition'],
                            'attachment; filename="send_file.txt"');
            assert.equal(res.chunks[0].length, 6);
        });
        next();
    },

    'Custom Error Handler.': function(next) {
        context.configure({
            errorHandler: function(err, defaultHandler) {
                this.status = 500;
                this.renderText(err.message);
            }
        });

        var req = new mocks.MockRequest('GET', '/', {}),
            res = new mocks.MockResponse();

        var ctx = new RequestContext(req, res);
        ctx._handleError(new Error('Some Error'));
        assert.deepEqual(res.statusCode, 500);
        assert.deepEqual(res.chunks, ['Some Error']);
        next();
    }
};

if(process.argv[1] == __filename)
    require('../common/ghunit').test(suite);
