var mysql = require('mysql'),
    db_util = require('./db_util'),
    Language = require('../models').Language;

exports.all = function(cb) {
    var client = db_util.getClient();

    client.query('select * from languages, languages_paradigms '
                    + 'where language_id = id', function(err, results) {
        client.end(function() {
            cb(err, db_util.combineAndMap(results, 'id', toLanguage));
        });
    });
};

exports.get = function(id, cb) {
    var client = db_util.getClient();

    client.query('select * from languages, languages_paradigms '
                        + 'where language_id = id and id = ?', [id],
    function(err, result) {
        client.end(function() {
            cb(err, db_util.combineAndMap(result, 'id', toLanguage)[0]);
        });
    });
};

exports.save = function(language, cb) {
    var client = db_util.getClient();

    if(language.id() === undefined) {
        var query = 'insert into languages (name, static, dynamic, '
                    + 'execution_id) values (?, ?, ?, ?)';
        var params = [language.name(), !!language.static(),
                        !!language.dynamic(), language.executionId()];
    } else {
        var query = 'update languages set name = ?, static = ?, dynamic = ?, '
                        + 'execution_id = ? where id = ?';
        var params = [language.name(), !!language.static(),
                        !!language.dynamic(), language.executionId(),
                        language.id()];
    }

    var id = language.id();
    client.query(query, params, function(err, res) {
        id = res.insertId ? res.insertId : id;

        client.query('delete from languages_paradigms where language_id = ?',
                        [id]);

        var params = [];
        var query = 'insert into languages_paradigms values ';

        language.paradigmIds().forEach(function(pid) {
            query += '(?, ?), ';
            params = params.concat([id, pid]);
        });

        client.query(query.substring(0, query.length - 2), params,
        function(err) {
            client.end(function() {
                cb(err);
            });
        });
    });
};

exports.remove = function(language, cb) {
    var client = db_util.getClient();

    if(language.id() != undefined) {
        client.query('delete from languages_paradigms where language_id = ?',
                        [language.id()]);
        client.query('delete from languages where id = ?', [language.id()],
        function(err) {
            client.end(function() {
                cb(err);
            });
        });
    } else {
        cb();
    }
};

function toLanguage(rows) {
    var language = new Language();
    var row = rows[0];
    language.id(row.id).name(row.name).static(!!row.static)
            .dynamic(!!row.dynamic).executionId(row.execution_id);
    language.paradigmIds([]);

    rows.forEach(function(row) {
        language.paradigmIds().push(row.paradigm_id);
    });

    return language;
}
