const express = require('express');
const app = express();
const path = require('path');

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(path.resolve(__dirname,'./data.db'));


const knex = require('knex')({
    client:'sqlite3',
    connection:{
        filename: './data.db'
    },
    useNullAsDefault: true
});

// db.run('CREATE TABLE rowcount (id INTEGER PRIMARY KEY AUTOINCREMENT, count int)')
// db.run('CREATE TABLE passengers (id INTEGER PRIMARY KEY AUTOINCREMENT, name String, age int, gender String)')
// db.run('ALTER TABLE passengers ADD column seat int')
// db.run('ALTER TABLE passengers ADD column agendId int')
// db.run('ALTER TABLE users ADD column phone int')
// db.run('ALTER TABLE passengers RENAME column agendId to agentId ')

// knex.update({
//     mail:'bharathsaravananofficial@gmail.com'
// }).into('users')
// .where('id',1)
// .then()
// knex.insert({
//     count:0
// }).into('rowcount')
// .then()
// knex('users')
// .del()
// .where('id', 5)
// .then(e => console.log(e))

knex('users')
.select('*')
.then((e) => console.log(e))
