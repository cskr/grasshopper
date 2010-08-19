var gh = require('../grasshopper'),
    assert = require('assert');

exports.name = 'Model Tests';

function Person() {
}

gh.initModel(Person, 'name', 'age', 'dob', 'someProp', 'friends');

Person.prototype.validate = function(next) {
    this.validateRequired('name', 'Name is required.', false);
    this.validateNumeric('age', false);
    this.validateDate('dob');
    this.validatePattern('someProp', /^\d.*/);
}

exports.tests = {
    'Update property without converter.': function(next) {
        var p = new Person().update({name: 'Chandru'});
        assert.equal(p.name(), 'Chandru');
        next();
    },

    'Update property with converter.': function(next) {
        var p = new Person().update({name: 'Chandru'}, function(prop, val, cb){
            assert.equal(prop, 'name');
            assert.equal(val, 'Chandru');
            cb('ABC');
        });

        assert.equal(p.name(), 'ABC');
        next();
    },

    'Update property with async converter.': function(next) {
        var p = new Person().update({name: 'Chandru'}, function(prop, val, cb){
            assert.equal(prop, 'name');
            assert.equal(val, 'Chandru');
            setTimeout(function() {
                cb('ABC');
            }, 100);
        }, function() {
            assert.equal(p.name(), 'ABC');
            next();
        });
    },

    'Update array property.': function(next) {
        var p = new Person().update({'*friends': ['a', 'b']});
        assert.deepEqual(p.friends(), ['a', 'b']);
        next();
    },

    'Update array property without prefix.': function(next) {
        var p = new Person().update({friends: ['a', 'b']});
        assert.equal(p.friends(), 'a');
        next();
    },

    'Update array property with converter.': function(next) {
        var p = new Person();
        p.update({'*friends': ['a', 'b']}, function(prop, val, cb) {
            assert.equal(prop, 'friends');
            assert.deepEqual(val, ['a', 'b']);
            cb(['x', 'y']);
        });
        assert.deepEqual(p.friends(), ['x', 'y']);
        next();
    },

    'Update array property with converter without prefix.': function(next) {
        var p = new Person();
        p.update({friends: ['a', 'b']}, function(prop, val, cb) {
            assert.equal(prop, 'friends');
            assert.deepEqual(val, ['a', 'b']);
            cb(['x', 'y']);
        });
        assert.deepEqual(p.friends(), ['x', 'y']);
        next();
    },

    'Trigger validations.': function(next) {
        var p = new Person();
        p.update({age: 'ABC', dob: 'XYZ'});
        assert.ok(!p.isValid());
        assert.equal(p.errors['name'][0], 'Name is required.');
        assert.equal(p.errors['age'][0], 'numeric');
        assert.equal(p.errors['dob'][0], 'Person.dob.date');
        assert.equal(p.errors['someProp'][0], 'Person.someProp.pattern');
        next();
    }
};
