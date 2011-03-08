var mysql = require('mysql'),
    db_cred = require('./db_cred');

var client = new mysql.Client(db_cred);

client.connect();

client.query('create database crud');
client.query('use crud');
client.query('SET storage_engine=InnoDB');

client.query('create table paradigms (id int primary key auto_increment, '
                + 'name varchar(50), description varchar(255))');
client.query('create table executions (id int primary key auto_increment, '
                + 'name varchar(50), description varchar(255))');
client.query('create table languages (id int primary key auto_increment, '
                + 'name varchar(50), static boolean, dynamic boolean, '
                + 'execution_id int, foreign key (execution_id) '
                + 'references executions(id))');
client.query('create table languages_paradigms (language_id int, '
                + 'paradigm_id int, primary key (language_id, paradigm_id), '
                + 'foreign key (language_id) references languages(id), '
                + 'foreign key (paradigm_id) references paradigms(id))',
                function(err) {
    err && console.log(err.stack);
    client.end();
});
