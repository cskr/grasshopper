var mysql = require('mysql'),
    db_cred = require('../db_cred'),
    Shout = require('./model').Shout;

exports.all = function(cb) {
    var client = getClient();
    client.query('select * from shouts', function(err, results) {
        var shouts = [];
        if(!err) {
            results.forEach(function(result) {
                var shout = new Shout();
                shout.name(result.name)
                     .email(result.email)
                     .message(result.message);
                shouts.push(shout);
            });
        }
        
        client.end();
        cb(err, shouts);
    });
};

exports.save = function(shout, cb) {
    var client = getClient();
    client.query('insert into shouts(name, email, message) values (?,?,?)',
                 [ shout.name(), shout.email(), shout.message() ],
                 function(err) {
                     client.end();
                     cb(err);
    });
};

function getClient() {
    var client = new mysql.Client(db_cred);
    client.database = 'shoutbox';
    client.connect();
    return client;
}
