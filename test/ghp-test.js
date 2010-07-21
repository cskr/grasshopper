var assert = require('assert'),
    ghp = require('../lib/ghp');

exports.name = 'GHP Tests';

exports.tests = {
    'Fill simple text.': function() {
        var result = ghp.fillText('Hi');
        assert.equal(result, 'Hi');
    },

    'Fill text with model.': function() {
        var result = ghp.fillText('Hello, <%= name %>!', {name: 'Chandru'});
        assert.equal(result, 'Hello, Chandru!');
    },

    'Fill simple template.': function() {
        var result = ghp.fill('./fixtures/ghp/simple.txt', {name: 'Chandru'}, 'utf8', './fixtures/ghp', 'txt');
        assert.equal(result, 'Hello, Chandru!\n');
    },

    'Fill template with HTML escape.': function() {
        var result = ghp.fill('./fixtures/ghp/simple_with_escape.txt', {name: '<i>Chandru</i>'}, 'utf8', './fixtures/ghp', 'txt');
        assert.equal(result, 'Hello, &lt;i&gt;Chandru&lt;/i&gt;!\n');
    },

    'Fill template with include.': function() {
        var result = ghp.fill('./fixtures/ghp/simple_with_include.txt', {}, 'utf8', './fixtures/ghp', 'txt');
        assert.equal(result, 'Hello, Chandru\n!\n');
    }
};
