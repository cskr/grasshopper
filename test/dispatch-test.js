var gh = require('../grasshopper'),
    http = require('http'),
    assert = require('assert');

exports.name = 'Routing Tests';

exports.tests = {
    'GET': function(next) {
        var invoked = false;
        gh.get('/', function() {
            assert.equal(this.params['name'], 'ABC');
            assert.equal(this.params['age'], '25');
            invoked = true;
            this.render();
        });
        gh.serve(8080);
        invoke('GET', '/?name=ABC&age=25', {}, function() {
            gh.stop();
            assert.ok(invoked);
            next();
        });
    },

    'POST': function(next) {
        var invoked = false;
        gh.post('/process', function() {
            assert.equal(this.params['name'], 'ABC');
            assert.equal(this.params['age'], '25');
            invoked = true;
            this.render();
        });
        gh.serve(8080);
        invoke('POST', '/process',
               {'content-type': 'application/x-www-form-urlencoded'},
               'name=ABC&age=25',
               function() {
                   gh.stop();
                   assert.ok(invoked);
                    next();
               }
        );
    },

    'HEAD': function(next) {
        var invoked = false;
        gh.get('/head', function() {
            this.headers['content-type'] = 'text/plain';
            invoked = true;
            this.render();
        });
        gh.serve(8080);
        invoke('HEAD', '/head', {}, function(status, headers) {
            gh.stop();
            assert.equal(headers['content-type'], 'text/plain');
            assert.ok(invoked);
            next();
        });
    },

    'Filter invocation.': function(next) {
        var filterInvoked = false, invoked = false;
        gh.addFilters(/\/filtered.*/, function(proceed) {
            filterInvoked = true;
            proceed();
        });
        gh.get('/filtered_path', function() {
            invoked = true;
            this.render();
        });
        gh.serve(8080);
        invoke('GET', '/filtered_path', {}, function(status, headers) {
            gh.stop();
            assert.ok(filterInvoked);
            assert.ok(invoked);
            next();
        });
    }
};

function invoke(method, path, headers, body, cb) {
    var bodyb = body;
    process.nextTick(function() {
        if(typeof body == 'function') {
            cb = body;
            body = undefined;
        }
        headers['host'] = 'localhost:8080';

        var client = http.createClient(8080, 'localhost');
        var request = client.request(method, path, headers);
        if(body) {
            request.write(body);
        }
        request.end();
        var status, responseHeaders, responseBody = '';
        request.on('response', function(response) {
            status = response.statusCode;
            responseHeaders = response.headers;
            response.setEncoding('utf8');
            response.on('data', function(chunk) {
                responseBody += chunk;
            });
            response.on('end', function() {
                cb(status, responseHeaders, responseBody);
            });
        });
    });
}
