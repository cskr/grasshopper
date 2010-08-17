var couchdb = require('node-couchdb'),
    Paradigm = require('../models').Paradigm,
    util = require('./couchUtil');

exports.all = function(cb) {
    var db = couchdb.createClient().db('ghcrud');
    db.view('paradigm', 'all', {}, function(err, res) {
        if(!err) {
            var paradigms = util.getValues(res.rows, mapRow);
        }
        cb(err, paradigms);
    });
};

exports.get = function(id, cb) {
    var db = couchdb.createClient().db('ghcrud');
    db.getDoc(id, function(err, res) {
        if(!err) {
            var paradigm = util.getValues([{value: res}], mapRow)[0];
        }
        cb(err, paradigm);
    });
};

exports.save = function(paradigm, cb) {
    var doc = util.getDoc(paradigm, mapValue);
    var db = couchdb.createClient().db('ghcrud');
    db.saveDoc(doc, function(err) {
        cb(err);
    });
};

exports.remove = function(paradigm, cb) {
    var db = couchdb.createClient().db('ghcrud');
    db.removeDoc(paradigm._id, paradigm._rev, function(err, res) {
        cb(err);
    });
};

function mapRow(row, cb) {
    var p = new Paradigm();
    p.name(row.value.name)
            .description(row.value.description);
    return p;
}

function mapValue(paradigm, row) {
    row.name = paradigm.name();
    row.description = paradigm.description();
}
