var assert = require('assert'),
    ghp = require('../../grasshopper/lib/ghp');

var suite = {name: 'GHP Tests'};
exports.suite = suite;

function MockResponse() {
    this.out = '';
}

MockResponse.prototype.write = function(str, encoding) {
    this.out += str;
};

MockResponse.prototype.end = function() {
    this.ended = true;
};

suite.tests = {
    'Fill simple template.': function(next) {
        var response = new MockResponse();
        ghp.fill('../fixtures/ghp/simple.txt', response, {name: 'Chandru'}, 'utf8', '../fixtures/ghp', 'txt');
        assert.equal(response.out, 'Hello, Chandru!\n');
        assert.ok(response.ended);
        next();
    },

    'Fill template with include.': function(next) {
        var response = new MockResponse();
        ghp.fill('../fixtures/ghp/simple_with_include.txt', response, {}, 'utf8', '../fixtures/ghp', 'txt');
        assert.equal(response.out, 'Hello, Chandru\n!\n');
        assert.ok(response.ended);
        next();
    },

    'Fill template with include and updation function.': function(next) {
        var response = new MockResponse();
        ghp.fill('../fixtures/ghp/include_with_updater.txt', response, {}, 'utf8', '../fixtures/ghp', 'txt');
        assert.equal(response.out, 'Hello, Chandru!\n\n');
        assert.ok(response.ended);
        next();
    },

    'Template with newline in code.': function(next) {
        var response = new MockResponse();
        ghp.fill('../fixtures/ghp/multiline_with_newline.txt', response, {items: ['A', 'B', 'C']}, 'utf8', '../fixtures/ghp', 'txt');
        assert.equal(response.out, '<li>\nA</li>\n<li>B</li>\n<li>C\n</li>\n');
        assert.ok(response.ended);
        next();
    },

    'Template with escaped HTML.': function(next) {
        var response = new MockResponse();
        ghp.fill('../fixtures/ghp/escaped_html.txt', response, {}, 'utf8', '../fixtures/ghp', 'txt');
        assert.equal(response.out, '&lt;b&gt;ABC&lt;/b&gt;\n');
        assert.ok(response.ended);
        next();
    },

    'Multi-line with single quote.': function(next) {
        var response = new MockResponse();
        ghp.fill('../fixtures/ghp/with_quote.txt', response, {}, 'utf8', '../fixtures/ghp', 'txt');
        assert.equal(response.out, 'Quoted: \'line-1\'\n\'line-2\'\n');
        assert.ok(response.ended);
        next();
    },

    'Template with undefinde value.': function(next) {
        var response = new MockResponse();
        ghp.fill('../fixtures/ghp/template_with_undefined.txt', response, {}, 'utf8', '../fixtures/ghp', 'txt');
        assert.equal(response.out, '\n');
        assert.ok(response.ended);
        next();
    },
    
    'Too big template' : function(next) {
        var response = new MockResponse();
        ghp.fill('../fixtures/ghp/too_big.txt', response, {}, 'utf8', '../fixtures/ghp', 'txt');
        assert.equal(response.out.length, 8207);
        assert.ok(response.ended);
        next();
    }
};

if(process.argv[1] == __filename)
    require('../common/ghunit').test(suite);
