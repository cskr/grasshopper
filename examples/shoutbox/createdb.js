var mysql = require('mysql'),
    db_cred = require('./db_cred');

var client = new mysql.Client(db_cred);

client.connect();

client.query('create database shoutbox');
client.query('use shoutbox');
client.query('create table shouts (id int primary key auto_increment, '
                + 'name varchar(50), email varchar(50), '
                + 'message varchar(255))', function() {
    client.end();
});
