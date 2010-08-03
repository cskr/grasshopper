var gh = require('../grasshopper'),
    assert = require('assert');

exports.name = 'Model Tests';

function Person() {
}

gh.initModel(Person, 'name', 'age', 'dob', 'someProp', 'friends');

Person.prototype.validate = function() {
    this.validateRequired('name', 'Name is required.', false);
    this.validateNumeric('age', false);
    this.validateDate('dob');
    this.validatePattern('someProp', /^\d.*/);
}

exports.tests = {
    'Update property without converter.': function() {
        var p = new Person().update({name: 'Chandru'});
        assert.equal(p.name(), 'Chandru');
    },

    'Update property with converter.': function() {
        var p = new Person().update({name: 'Chandru'}, function(prop, val, cb){
            assert.equal(prop, 'name');
            assert.equal(val, 'Chandru');
            cb('ABC');
        });

        assert.equal(p.name(), 'ABC');
    },

    'Update property with async converter.': function() {
        var p = new Person().update({name: 'Chandru'}, function(prop, val, cb){
            assert.equal(prop, 'name');
            assert.equal(val, 'Chandru');
            setTimeout(function() {
                cb('ABC');
            }, 100);
        }, function() {
            assert.equal(p.name(), 'ABC');
        });
    },

    'Update array property.': function() {
        var p = new Person().update({'*friends': ['a', 'b']});
        assert.deepEqual(p.friends(), ['a', 'b']);
    },

    'Update array property without prefix.': function() {
        var p = new Person().update({friends: ['a', 'b']});
        assert.equal(p.friends(), 'a');
    },

    'Update array property with converter.': function() {
        var p = new Person();
        p.update({'*friends': ['a', 'b']}, function(prop, val, cb) {
            assert.equal(prop, 'friends');
            assert.deepEqual(val, ['a', 'b']);
            cb(['x', 'y']);
        });
        assert.deepEqual(p.friends(), ['x', 'y']);
    },

    'Update array property with converter without prefix.': function() {
        var p = new Person();
        p.update({friends: ['a', 'b']}, function(prop, val, cb) {
            assert.equal(prop, 'friends');
            assert.deepEqual(val, ['a', 'b']);
            cb(['x', 'y']);
        });
        assert.deepEqual(p.friends(), ['x', 'y']);
    },

    'Trigger validations.': function() {
        var p = new Person();
        p.update({age: 'ABC', dob: 'XYZ'});
        assert.ok(!p.isValid());
        assert.equal(p.errors['name'][0], 'Name is required.');
        assert.equal(p.errors['age'][0], 'numeric');
        assert.equal(p.errors['dob'][0], 'Person.dob.date');
        assert.equal(p.errors['someProp'][0], 'Person.someProp.pattern');
    }
};
