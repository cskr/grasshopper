var gh = require('../../grasshopper'),
    assert = require('assert');

var suite = {name: 'Model Tests'};
exports.suite = suite;

function Person() {
}

gh.initModel(Person, 'name', 'age', 'sex', 'dob', 'someProp', 'friends');

Person.prototype.validate = function(next) {
    this.validateRequired('name', 'Name is required.', false);
    this.validateNumeric('age', false);
    this.validateLength('sex', 1, 1);
    this.validateDate('dob');
    this.validatePattern('someProp', /^\d.*/);
}

suite.tests = {
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

    'Update array property with [].': function(next) {
        var p = new Person().update({'friends[]': ['a', 'b']});
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
        p.update({sex: 'Male', age: 'ABC', dob: 'XYZ'});
        assert.ok(!p.isValid());
        assert.equal(p.errors['name'][0], 'Name is required.');
        assert.equal(p.errors['age'][0], 'numeric');
        assert.equal(p.errors['sex'][0], 'Person.sex.length');
        assert.equal(p.errors['dob'][0], 'Person.dob.date');
        assert.equal(p.errors['someProp'][0], 'Person.someProp.pattern');
        next();
    },

    'Unwrap Model.': function(next) {
        var p = new Person();
        p.update({sex: 'M', age: 28, friends: [{
            sex: 'F', age: 27
        }]}, function(prop, val, cb) {
            if(prop == 'friends') {
                var retVal = [];
                val.forEach(function(val) {
                    retVal.push(new Person().update(val));
                });
            }

            cb(retVal);
        });

        assert.deepEqual(p.unwrapModel(), {
            age: 28, sex: 'M',
            friends: [{
                sex: 'F', age: 27,
                errors: {
                    name: ['Name is required.'],
                    dob: ['Person.dob.date'],
                    someProp: ['Person.someProp.pattern']
                }
            }],
            errors: {
                name: ['Name is required.'],
                dob: ['Person.dob.date'],
                someProp: ['Person.someProp.pattern']
            }
        });

        assert.deepEqual(p.unwrapModel({
            'Person.dob.date' : 'Bad date',
            'Person.someProp.pattern' : 'Bad pattern',
            'Name is required.' : 'Name is required.'
        }), {
            age: 28, sex: 'M',
            friends: [{
                sex: 'F', age: 27,
                errors: {
                    name: ['Name is required.'],
                    dob: ['Bad date'],
                    someProp: ['Bad pattern']
                }
            }],
            errors: {
                name: ['Name is required.'],
                dob: ['Bad date'],
                someProp: ['Bad pattern']
            }
        });
        next();
    }
};

if(process.argv[1] == __filename)
    require('../common/ghunit').test(suite);
