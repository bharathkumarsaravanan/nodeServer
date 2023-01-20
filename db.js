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

// db.run('CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name STRING)')
// db.run('ALTER TABLE users ADD column role String')

// knex.update({
//     role:'super agent'
// }).into('users')
// .where('id',1)
// .then()

// knex('users')
// .del()
// .whereIn('id', [2,3])
// .then(e => console.log(e))

knex('users')
.select('*')
.then((e) => console.log(e))
