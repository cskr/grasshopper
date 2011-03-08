var mysql = require('mysql'),
    db_util = require('./db_util'),
    Execution = require('../models').Execution;

exports.all = function(cb) {
    var client = db_util.getClient();

    client.query('select * from executions', function(err, results) {
        client.end(function() {
            cb(err, db_util.mapRows(results, toExecution));
        });
    });
};

exports.get = function(id, cb) {
    var client = db_util.getClient();

    client.query('select * from executions where id = ?', [id],
    function(err, result) {
        client.end(function() {
            cb(err, db_util.mapRows(result, toExecution)[0]);
        });
    });
};

exports.save = function(execution, cb) {
    var client = db_util.getClient();

    if(execution.id() === undefined) {
        var query = 'insert into executions (name, description) values (?, ?)';
        var params = [execution.name(), execution.description()];
    } else {
        var query = 'update executions set name = ?, description = ? '
                        + 'where id = ?';
        var params = [execution.name(), execution.description(), execution.id()];
    }

    client.query(query, params, function(err) {
        client.end(function() {
            cb(err);
        });
    });
};

exports.remove = function(execution, cb) {
    var client = db_util.getClient();

    if(execution.id() != undefined) {
        client.query('delete from executions where id = ?', [execution.id()],
        function(err) {
            client.end(function() {
                cb(err);
            });
        });
    } else {
        cb();
    }
};

function toExecution(row) {
    var execution = new Execution();
    execution.id(row.id).name(row.name).description(row.description);
    return execution;
}
