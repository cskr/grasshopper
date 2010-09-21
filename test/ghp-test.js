var assert = require('assert'),
    ghp = require('../grasshopper/lib/ghp');

exports.name = 'GHP Tests';

function MockResponse() {
    this.out = '';
}

MockResponse.prototype.write = function(str, encoding) {
    this.out += str;
};

MockResponse.prototype.end = function() {
    this.ended = true;
};

exports.tests = {
    'Fill simple template.': function(next) {
        var response = new MockResponse();
        ghp.fill('./fixtures/ghp/simple.txt', response, {name: 'Chandru'}, 'utf8', './fixtures/ghp', 'txt');
        assert.equal(response.out, 'Hello, Chandru!\n');
        assert.ok(response.ended);
        next();
    },

    'Fill template with include.': function(next) {
        var response = new MockResponse();
        ghp.fill('./fixtures/ghp/simple_with_include.txt', response, {}, 'utf8', './fixtures/ghp', 'txt');
        assert.equal(response.out, 'Hello, Chandru\n!\n');
        assert.ok(response.ended);
        next();
    },

    'Template with newline in code.': function(next) {
        var response = new MockResponse();
        ghp.fill('./fixtures/ghp/multiline_with_newline.txt', response, {items: ['A', 'B', 'C']}, 'utf8', './fixtures/ghp', 'txt');
        assert.equal(response.out, '<li>\nA</li>\n<li>B</li>\n<li>C\n</li>\n');
        assert.ok(response.ended);
        next();
    }
};
