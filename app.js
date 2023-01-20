const express = require('express')
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(path.resolve(__dirname,'./data.db'));

app.use(bodyParser.urlencoded({
    extended: true
}))

const knex = require('knex')({
    client:'sqlite3',
    connection:{
        filename: './data.db'
    },
    useNullAsDefault: true
});

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.json());
app.use(cors());

app.get('/',function(req,res){
    knex('users')
    .select('*')
    .then((e) => res.send(e))
})

app.listen(9000,function(){
    console.log('localhost:9000')
});
