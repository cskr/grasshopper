var dispatcher = require('../../grasshopper/lib/dispatcher'),
    context = require('../../grasshopper/lib/context'),
    http = require('http'),
    assert = require('assert'),
    mocks = require('../common/mocks');

var suite = {name: 'Dispatcher Tests'};
exports.suite = suite;

suite.tests = {
    'Simple GET.': function(next) {
        invoke('GET', '/path', {}, undefined, '/path', function() {
        });
        next();
    },

    'GET with in-path arguments.': function(next) {
        invoke('GET', '/path/1/ABC', {}, undefined, '/path/{id}/{name}',
            function(args) {
                assert.equal(args.id, '1');
                assert.equal(args.name, 'ABC');
        });
        next();
    },

    'GET with params.': function(next) {
        invoke('GET', '/path?name=ABC', {}, undefined, '/path', function() {
            assert.equal(this.params['name'], 'ABC');
        });
        next();
    },

    'Simple POST.': function(next) {
        invoke('POST', '/path', {
                   'content-type': 'application/x-www-form-urlencoded',
                   'content-length': 9
               }, 'name=ABC%20DEF', '/path', function() {
                   assert.equal(this.params['name'], 'ABC DEF');
               });
        next();
    },

    'POST with complex params.': function(next) {
        invoke('POST', '/path', {
                   'content-type': 'application/x-www-form-urlencoded',
                   'content-length': 9
               }, 'user.name=ABC&user.*friends=DEF&user.*friends=GHI',
               '/path', function() {
                   assert.deepEqual(this.params['user'], {
                       name: 'ABC',
                       '*friends': ['DEF', 'GHI']
                   });
         });
         next();
    },

    'Simple HEAD.': function(next) {
        invoke('HEAD', '/path', {}, undefined, '/path', function() {
        });
        next();
    },

    'Filter invocation.': function(next) {
        var filterInvoked = false;
        dispatcher.api.addFilters(/\/path/, function(next) {
            filterInvoked = true;
            next();
        });

        invoke('GET', '/path', {}, undefined, '/path', function() {
        });

        assert.ok(filterInvoked);
        next();
    }
};

function invoke(method, path, headers, body, route, controller) {
    var req = new mocks.MockRequest(method, path, headers),
        res = new mocks.MockResponse();
        ctx = new context.RequestContext(req, res);

    var invoked = false,
        routes = {};

    routes[method.toLowerCase() + ':' + route] = function() {
        invoked = true;
        assert.equal(this.request, req);
        assert.equal(this.response, res);
        controller.apply(this, arguments);
    };

    dispatcher.dispatch(ctx, new dispatcher.RouteMatcher(routes));
    if(body) {
        req.emit('data', body);
        req.emit('end');
    }
    assert.ok(invoked);
}

if(process.argv[1] == __filename)
    require('../common/ghunit').test(suite);
