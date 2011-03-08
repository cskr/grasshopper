var mysql = require('mysql'),
    db_util = require('./db_util'),
    Paradigm = require('../models').Paradigm;

exports.all = function(cb) {
    var client = db_util.getClient();

    client.query('select * from paradigms', function(err, results) {
        client.end(function() {
            cb(err, db_util.mapRows(results, toParadigm));
        });
    });
};

exports.get = function(id, cb) {
    var client = db_util.getClient();

    client.query('select * from paradigms where id = ?', [id],
    function(err, result) {
        client.end(function() {
            cb(err, db_util.mapRows(result, toParadigm)[0]);
        });
    });
};

exports.save = function(paradigm, cb) {
    var client = db_util.getClient();

    if(paradigm.id() === undefined) {
        var query = 'insert into paradigms (name, description) values (?, ?)';
        var params = [paradigm.name(), paradigm.description()];
    } else {
        var query = 'update paradigms set name = ?, description = ? '
                        + 'where id = ?';
        var params = [paradigm.name(), paradigm.description(), paradigm.id()];
    }

    client.query(query, params, function(err) {
        client.end(function() {
            cb(err);
        });
    });
};

exports.remove = function(paradigm, cb) {
    var client = db_util.getClient();

    if(paradigm.id() != undefined) {
        client.query('delete from paradigms where id = ?', [paradigm.id()],
        function(err) {
            client.end(function() {
                cb(err);
            });
        });
    } else {
        cb();
    }
};

function toParadigm(row) {
    var paradigm = new Paradigm();
    paradigm.id(row.id).name(row.name).description(row.description);
    return paradigm;
}
