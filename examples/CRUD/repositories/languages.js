var couchdb = require('node-couchdb'),
    Language = require('../models').Language,
    util = require('./couchUtil');

exports.all = function(cb) {
    var db = couchdb.createClient().db('ghcrud');
    db.view('language', 'all', {}, function(err, res) {
        if(!err) {
            var languages = util.getValues(res.rows, mapRow);
        }
        cb(err, languages);
    });
};

exports.get = function(id, cb) {
    var db = couchdb.createClient().db('ghcrud');
    db.getDoc(id, function(err, res) {
        if(!err) {
            var language = util.getValues([{value: res}], mapRow)[0];
        }
        cb(err, language);
    });
};

exports.save = function(language, cb) {
    var doc = util.getDoc(language, mapValue);
    var db = couchdb.createClient().db('ghcrud');
    db.saveDoc(doc, function(err) {
        cb(err);
    });
};

exports.remove = function(language, cb) {
    var db = couchdb.createClient().db('ghcrud');
    db.removeDoc(language._id, language._rev, function(err, res) {
        cb(err);
    });
};

function mapRow(row, cb) {
    var p = new Language();
    p.name(row.value.name)
     .static(row.value.static)
     .dynamic(row.value.dynamic)
     .paradigmIds(row.value.paradigmIds)
     .executionId(row.value.executionId);

    return p;
}

function mapValue(language, row) {
    row.name = language.name();
    row.static = language.static();
    row.dynamic = language.dynamic();
    row.executionId = language.executionId();
    row.paradigmIds = language.paradigmIds();
}
