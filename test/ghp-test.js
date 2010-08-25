var assert = require('assert'),
    ghp = require('../grasshopper/lib/ghp');

exports.name = 'GHP Tests';

exports.tests = {
    'Fill simple template.': function(next) {
        var result = ghp.fill('./fixtures/ghp/simple.txt', {name: 'Chandru'}, 'utf8', './fixtures/ghp', 'txt');
        assert.equal(result, 'Hello, Chandru!\n');
        next();
    },

    'Fill template with include.': function(next) {
        var result = ghp.fill('./fixtures/ghp/simple_with_include.txt', {}, 'utf8', './fixtures/ghp', 'txt');
        assert.equal(result, 'Hello, Chandru\n!\n');
        next();
    },

    'Template with newline in code.': function(next) {
        var result = ghp.fill('./fixtures/ghp/multiline_with_newline.txt', {items: ['A', 'B', 'C']}, 'utf8', './fixtures/ghp', 'txt');
        assert.equal(result, '<li>\nA</li>\n<li>B</li>\n<li>C\n</li>\n');
        next();
    }
};
