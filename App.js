const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const cookie = require('cookie-parser');
const cors = require('cors');
const db = require('./Db_Connection.js');
require('dotenv').config({path: './.env'});

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ["POST", "GET"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(bodyParser.json());
app.use(cookie());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 1
    }
}));

db.connect((err)=> {
    if(err){
        console.log('database is not connected');
    }else{
        console.log("database is connected");
    }
})

app.use('/user', require("./Routers/user_Route.js"));
app.use('/product', require("./Routers/Product_Route.js"));
app.use('/orders', require('./Routers/Order_Route.js'));

app.listen((4000), ()=> {
    console.log("server is on http://localhost:4000");
})