const express = require('express');
const app = express();
const router = express.Router();

const path = require('path');
const bodyParser = require('body-parser');

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

router.use(function timeLog(req,res,next){
    next();
});

router.get('/home',function(req,res){
    knex('users')
    .select('*')
    .then((e) => res.send(e))
})

router.post('/home', function(req,res){
    // console.log(req.body);
    var body = req.body;
    knex('users')
    .select('*')
    .where('mail', body.mail)
    .andWhere('role', 'super agent')
    .then(data => {
        if(data.length !== 0){

            if(data[0].password == body.password){
                res.send({login: true, id: data[0].id})
            }
            else{

                res.send({login:false})
            }
        }
        else{
            res.send({login: false})
        }
    })
})

router.post('/home/superagent/signup', function(req,res){
    var body = req.body;
    knex('users')
    .select('*')
    .where('mail', body.mail)
    .andWhere('role', 'super agent')
    .then(data => {
        if(data.length == 0){
            knex.insert({
                mail: body.mail,
                password: body.password,
                role:'super agent'
            }).into('users')
            .then(() => res.send({message: 'account created successfully'}))
        }else{
            res.send({message: 'account already exists'})
        }
    })
})

router.post('/home/agent/signup', function(req,res){
    var body = req.body;
    knex('users')
    .select('*')
    .where('mail', body.mail)
    .andWhere('role', 'agent')
    .then(data => {
        if(data.length == 0){
            knex.insert({
                mail: body.mail,
                password: body.password,
                role:'agent'
            }).into('users')
            .then((id) => {
                knex('users')
                .select('*')
                .where('id', id)
                .then((newData) => res.send({message: 'account created successfully', newData: newData}))  
            })
        }else{
            res.send({message: 'account already exists'})
        }
    })
})

router.get('/home/agents', function(req,res){
    knex('users')
    .select('*')
    .where('role', 'agent')
    .then(datas => res.send({agents: datas}))
})

router.post('/agent/login', function(req,res){
    var body = req.body;
    knex('users')
    .select('*')
    .where('mail', body.mail)
    .andWhere('role', 'agent')
    .then(data => {
        if(data.length !== 0){

            if(data[0].password == body.password){
                res.send({login: true, user: data})
            }
            else{

                res.send({login:false})
            }
        }
        else{
            res.send({login: false})
        }
    })
})

router.post('/home/agents/:userid/delete', function(req,res){
    var userId = req.params.userid;

    knex('users')
    .del()
    .where('id', userId)
    .then(() => res.send({message: 'Agent deleted successfully!'}))
})

router.get('/home/superagent/rowcount', function(req,res){

    knex('rowcount')
    .select('*')
    .where('id', 1)
    .then((data) => res.send({count: data[0].count, limitSeat: data[0].limitseat}))
})

router.post('/home/superagent/rowcount', function(req,res){
    var body = req.body;

    knex('rowcount')
    .update(body).where('id', 1)
    .then(() => res.send({message:'row count updated!'}))
})

router.get('/home/agent/:user/passengers', function(req,res){
    var agentId = req.params.user;

    knex('passengers')
    .select('*')
    .where('agentId', agentId)
    .then((data) => res.send({passengers: data}));
})


router.post('/home/agent/:user/passengers', function(req,res){
    var agentId = req.params.user;
    var body = req.body;

    knex.insert({
        name: body.name,
        age: body.age,
        gender: body.gender,
        agentId: agentId  
    }).into('passengers')
    .then((id) => 
        knex('passengers')
        .select('*')
        .where('id', id)
        .then((newData) => res.send({newData: newData})));
})

router.post('/home/agent/passengers/delete', function(req,res){
    var body = req.body[0];

    knex('passengers')
    .del()
    .where('id', body)
    .then(() => res.send({message: 'deleted!'}))
});

router.post('/home/agent/:user/booking/:id', function(req,res){
    var id = req.params.id;
    var body = req.body;
    var agentId = req.params.user;

    knex('passengers')
    .update(body)
    .where('id', id)
    .then(() => {
        knex('passengers')
        .select('*')
        .where('agentId', agentId)
        .then((data) => res.send({return:data}))})

})

module.exports = router;