var routes = require('../grasshopper/lib/routes'),
    assert = require('assert');

exports.name = 'Routing Tests';

function dummy() {
}

exports.tests = {
    'GET route.': function(next) {
        routes.api.get('/', dummy);
        assert.equal(routes.api.getController('get', '/'), dummy);
        assert.equal(routes.api.getController('head', '/'), dummy);
        next();
    },

    'POST route.': function(next) {
        routes.api.post('/', dummy);
        assert.equal(routes.api.getController('post', '/'), dummy);
        next();
    },

    'PUT route.': function(next) {
        routes.api.put('/', dummy);
        assert.equal(routes.api.getController('put', '/'), dummy);
        next();
    },

    'DELETE route.': function(next) {
        routes.api.del('/', dummy);
        assert.equal(routes.api.getController('delete', '/'), dummy);
        next();
    },

    'Secure GET route.': function(next) {
        routes.api.secureGet('/', dummy);
        assert.equal(routes.api.getSecureController('get', '/'), dummy);
        assert.equal(routes.api.getSecureController('head', '/'), dummy);
        assert.ok(routes.api.getController('get', '/'));
        assert.ok(routes.api.getController('head', '/'));
        next();
    },

    'Secure POST route.': function(next) {
        routes.api.securePost('/', dummy);
        assert.equal(routes.api.getSecureController('post', '/'), dummy);
        next();
    },

    'Secure PUT route.': function(next) {
        routes.api.securePut('/', dummy);
        assert.equal(routes.api.getSecureController('put', '/'), dummy);
        next();
    },

    'Secure DELETE route.': function(next) {
        routes.api.secureDel('/', dummy);
        assert.equal(routes.api.getSecureController('delete', '/'), dummy);
        next();
    }

};
