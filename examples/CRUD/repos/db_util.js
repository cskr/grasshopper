var mysql = require('mysql'),
    db_cred = require('../db_cred');

exports.getClient = function() {
    var client = new mysql.Client(db_cred);
    client.database = 'crud';
    client.connect();
    return client;
}

exports.mapRows = function(rows, mapper) {
    if(rows == undefined) return undefined;

    var objs = [];
    rows.forEach(function(row) {
        objs.push(mapper(row));
    });

    return objs;
}

exports.combineAndMap = function(rows, keyColumn, mapper) {
    if(rows == undefined) return undefined;

    var rowSets = {};
    rows.forEach(function(row) {
        var key = row[keyColumn];
        if(rowSets[key] == undefined) {
            rowSets[key] = [];
        }
        rowSets[key].push(row);
    });

    var objs = [];
    for(var key in rowSets) {
        objs.push(mapper(rowSets[key]));
    }
    return objs;
}
