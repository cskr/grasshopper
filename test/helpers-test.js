var gh = require('../grasshopper'),
    helpers = require('../grasshopper/lib/helpers'),
    assert = require('assert');

exports.name = 'Helpers Tests';

function Person() {
}

gh.initModel(Person, 'name', 'age', 'dob', 'someProp', 'friends');

Person.prototype.validate = function() {
    this.validateRequired('name');
    this.validateRequired('age');
    this.validateNumeric('age');
}

exports.tests = {
    'Single error.': function(next) {
        var p = new Person();
        p.update({});
        var err = helpers.error(p, 'name', {'Person.name.required': 'Name is required.'});
        assert.equal(err, 'Name is required.');
        next();
    },

    'Error without locale.': function(next) {
        var p = new Person();
        p.update({});
        var err = helpers.error(p, 'name');
        assert.equal(err, 'Person.name.required');
        next();
    },

    'Multiple errors on property.': function(next) {
        var p = new Person();
        p.update({});
        var err = helpers.errors(p, 'age', {'Person.age.required': 'Age is required.', 'Person.age.numeric': 'Age must be numeric.'});
        assert.deepEqual(err, ['Age is required.', 'Age must be numeric.']);
        next();
    },

    'Multiple errors on model.': function(next) {
        var p = new Person();
        p.update({});
        var err = helpers.errors(p, {'Person.name.required': 'Name is required.', 'Person.age.required': 'Age is required.', 'Person.age.numeric': 'Age must be numeric.'});
        assert.deepEqual(err, ['Name is required.', 'Age is required.', 'Age must be numeric.']);
        next();
    },

    'HTML escape.': function(next) {
        var result = helpers.h('Hello, <i>Chandru</i>!');
        assert.equal(result, 'Hello, &lt;i&gt;Chandru&lt;/i&gt;!');
        next();
    }
};
