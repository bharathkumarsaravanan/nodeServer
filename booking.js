const express = require('express');
const app = express();
const router = express.Router();
const fs = require('fs')
const cors = require('cors');

const path = require('path');
const bodyParser = require('body-parser');

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(path.resolve(__dirname,'./data.db'));

const multer = require('multer');
const uploadProfile = multer({dest: 'public/profile'})
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
    extended: true
}))
const corsOptions ={
    origin:'*', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200,
}
app.use(cors(corsOptions));
app.use('/static', express.static(path.join(__dirname, 'public')))
const knex = require('knex')({
    client:'sqlite3',
    connection:{
        filename: './data.db'
    },
    useNullAsDefault: true
});


// app.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.header(
//       "Access-Control-Allow-Headers",
//       "Origin, X-Requested-With, Content-Type, Accept"
//     );
//     next();
//   });

  app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

router.use(function timeLog(req,res,next){
    next();
});

router.get('/home',function(req,res){
    // res.setHeader("Access-Control-Allow-Origin", "*");
    // res.header(
    //   "Access-Control-Allow-Headers",
    //   "Origin, X-Requested-With, Content-Type, Accept"
    // );
    knex('users')
    .select('*')
    .then((e) => res.send(e))
})

router.post('/home', function(req,res){
    // res.setHeader("Access-Control-Allow-Origin", "*");
    // res.header(
    //   "Access-Control-Allow-Headers",
    //   "Origin, X-Requested-With, Content-Type, Accept"
    // );
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
    // res.setHeader("Access-Control-Allow-Origin", "*");
    // res.header(
    //   "Access-Control-Allow-Headers",
    //   "Origin, X-Requested-With, Content-Type, Accept"
    // );

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
    // res.setHeader("Access-Control-Allow-Origin", "*");
    // res.header(
    //   "Access-Control-Allow-Headers",
    //   "Origin, X-Requested-With, Content-Type, Accept"
    // );
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
    // res.setHeader("Access-Control-Allow-Origin", "*");
    // res.header(
    //   "Access-Control-Allow-Headers",
    //   "Origin, X-Requested-With, Content-Type, Accept"
    // );
    knex('users')
    .select('*')
    .where('role', 'agent')
    .then(datas => res.send({agents: datas}))
})

router.get('/home/user/:user', function(req,res){
    // res.setHeader("Access-Control-Allow-Origin", "*");
    // res.header(
    //   "Access-Control-Allow-Headers",
    //   "Origin, X-Requested-With, Content-Type, Accept"
    // );
    var userId = req.params.user 
  
    knex('users')
    .select('*')
    .where('id', userId)
    .then(data => res.send({agent: data}))
})

router.post('/agent/login', function(req,res){
    // res.setHeader("Access-Control-Allow-Origin", "*");
    // res.header(
    //   "Access-Control-Allow-Headers",
    //   "Origin, X-Requested-With, Content-Type, Accept"
    // );
    var body = req.body;
    knex('users')
    .select('*')
    .where('mail', body.mail)
    .andWhere('role', 'agent')
    .then(data => {
        if(data.length !== 0){

            if(data[0].password == body.password){
                res.send({login: true, user: data[0]})
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

router.post('/agent/:user/form', function(req,res){
    // res.setHeader("Access-Control-Allow-Origin", "*");
    // res.header(
    //   "Access-Control-Allow-Headers",
    //   "Origin, X-Requested-With, Content-Type, Accept"
    // );
    var agentId = req.params.user;
    var body = req.body;
    knex('users')
    .update(body)
    .where('id', agentId)
    .then(() => res.send({message:"updated"}))
})
router.post('/agent/:user/form/profile',uploadProfile.single('profile'), function(req,res){
    // res.setHeader("Access-Control-Allow-Origin", "*");
    // res.header(
    //   "Access-Control-Allow-Headers",
    //   "Origin, X-Requested-With, Content-Type, Accept"
    // );
    var agentId = req.params.user;
    console.log(req.file);
    var profile = req.file;

    var ext = path.extname(profile.originalname)
    var newName = agentId+ext;
    var newPath = path.join('public','profile',newName)
    console.log(newPath)
    fs.renameSync(profile.path,newPath,function(err){
        if(err){
            console.log(err);
        }
    })
    knex('users')
    .update({
        profile: newName
    })
    .where('id', agentId)
    .then(() => res.send({message:'profile updated'}))

})

router.post('/home/agents/:userid/delete', function(req,res){
    // res.setHeader("Access-Control-Allow-Origin", "*");
    // res.header(
    //   "Access-Control-Allow-Headers",
    //   "Origin, X-Requested-With, Content-Type, Accept"
    // );
    var userId = req.params.userid;

    knex('users')
    .del()
    .where('id', userId)
    .then(() => res.send({message: 'Agent deleted successfully!'}))
})

router.get('/home/superagent/rowcount', function(req,res){
    // res.setHeader("Access-Control-Allow-Origin", "*");
    // res.header(
    //   "Access-Control-Allow-Headers",
    //   "Origin, X-Requested-With, Content-Type, Accept"
    // );

    knex('rowcount')
    .select('*')
    .where('id', 1)
    .then((data) => res.send({count: data[0].count, limitSeat: data[0].limitseat}))
})

router.post('/home/superagent/rowcount', function(req,res){
    // res.setHeader("Access-Control-Allow-Origin", "*");
    // res.header(
    //   "Access-Control-Allow-Headers",
    //   "Origin, X-Requested-With, Content-Type, Accept"
    // );
    var body = req.body;

    knex('rowcount')
    .update(body).where('id', 1)
    .then(() => res.send({message:'row count updated!'}))
})

router.get('/home/agent/:user/passengers', function(req,res){
    // res.setHeader("Access-Control-Allow-Origin", "*");
    // res.header(
    //   "Access-Control-Allow-Headers",
    //   "Origin, X-Requested-With, Content-Type, Accept"
    // );
    var agentId = req.params.user;

    knex('passengers')
    .select('*')
    .where('agentId', agentId)
    .then((data) => res.send({passengers: data}));
})


router.post('/home/agent/:user/passengers', function(req,res){
    // res.setHeader("Access-Control-Allow-Origin", "*");
    // res.header(
    //   "Access-Control-Allow-Headers",
    //   "Origin, X-Requested-With, Content-Type, Accept"
    // );
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
    // res.setHeader("Access-Control-Allow-Origin", "*");
    // res.header(
    //   "Access-Control-Allow-Headers",
    //   "Origin, X-Requested-With, Content-Type, Accept"
    // );
    var body = req.body[0];

    knex('passengers')
    .del()
    .where('id', body)
    .then(() => res.send({message: 'deleted!'}))
});

router.post('/home/agent/:user/booking/:id', function(req,res){
    // res.setHeader("Access-Control-Allow-Origin", "*");
    // res.header(
    //   "Access-Control-Allow-Headers",
    //   "Origin, X-Requested-With, Content-Type, Accept"
    // );
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