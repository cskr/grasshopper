var gh = require('..'),
    helpers = require('../lib/helpers'),
    assert = require('assert');

exports.name = 'Model Tests';

function Person() {
}

gh.initModel(Person, 'name', 'age', 'dob', 'someProp', 'friends');

Person.prototype.validate = function() {
    this.validateRequired('name');
    this.validateRequired('age');
    this.validateNumeric('age');
}

exports.tests = {
    'Single error.': function() {
        var p = new Person();
        p.update({}, function() {
            var err = helpers.error(p, 'name', {'Person.name.required': 'Name is required.'});
            assert.equal(err, 'Name is required.');
        });
    },

    'Error without locale.': function() {
        var p = new Person();
        p.update({}, function() {
            var err = helpers.error(p, 'name');
            assert.equal(err, 'Person.name.required');
        });
    },

    'Multiple errors on property.': function() {
        var p = new Person();
        p.update({}, function() {
            var err = helpers.errors(p, 'age', {'Person.age.required': 'Age is required.', 'Person.age.numeric': 'Age must be numeric.'});
            assert.deepEqual(err, ['Age is required.', 'Age must be numeric.']);
        });
    },

    'Multiple errors on model.': function() {
        var p = new Person();
        p.update({}, function() {
            var err = helpers.errors(p, {'Person.name.required': 'Name is required.', 'Person.age.required': 'Age is required.', 'Person.age.numeric': 'Age must be numeric.'});
            assert.deepEqual(err, ['Name is required.', 'Age is required.', 'Age must be numeric.']);
        });
    }
};
