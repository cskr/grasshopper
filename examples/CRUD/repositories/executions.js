var couchdb = require('../../support/node-couchdb/lib/couchdb'),
    Execution = require('../models').Execution,
    util = require('./couchUtil');

exports.all = function(cb) {
    var db = couchdb.createClient().db('ghcrud');
    db.view('execution', 'all', {}, function(err, res) {
        if(!err) {
            var executions = util.getValues(res.rows, mapRow);
        }
        cb(err, executions);
    });
};

exports.get = function(id, cb) {
    var db = couchdb.createClient().db('ghcrud');
    db.getDoc(id, function(err, res) {
        if(!err) {
            var execution = util.getValues([{value: res}], mapRow)[0];
        }
        cb(err, execution);
    });
};

exports.save = function(execution, cb) {
    var doc = util.getDoc(execution, mapValue);
    var db = couchdb.createClient().db('ghcrud');
    db.saveDoc(doc, function(err) {
        cb(err);
    });
};

exports.remove = function(execution, cb) {
    var db = couchdb.createClient().db('ghcrud');
    db.removeDoc(execution._id, execution._rev, function(err, res) {
        cb(err);
    });
};

function mapRow(row, cb) {
    var p = new Execution();
    p.name(row.value.name)
            .description(row.value.description);
    return p;
}

function mapValue(execution, row) {
    row.name = execution.name();
    row.description = execution.description();
}
