
var argv = require('yargs').argv;
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var http = require('http');
var session = require('client-sessions');

// var pg =require('pg');

//var newpage = "E:\\ASU Fall17\\Adaptive Web\\Assignments\\untitled\\Assignment1\\index.html";
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://aruchand:pwd@ds119014.mlab.com:19014/heroku_g75wx4mc";
var handlebars = require('express-handlebars')
  .create({ defaultLayout: 'main' });
let app = express();

var routes = require('./routes/index');
var users = require('./routes/user');
var urlencodedParser = bodyParser.urlencoded({extended: false});

app.use(session({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

app.use(cors());
app.use(bodyParser.json());

app.set('port', process.env.PORT || argv.port || 8080);

app.use('/', express.static(__dirname));

app.get('/', (request, response) => {
  console.log("Hello");
// response.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/home', (request, response) =>{
  MongoClient.connect(url, function (err, db) {
    if(err) throw err;
    var query = {id: request.session.id};
    db.collection("users").find(query).toArray(function(err, result) {
        response.json({"data": result});
        db.close();
      });
  });
});


app.get('/logHistory', (request, response) =>{
  MongoClient.connect(url, function (err, db) {
    if(err) throw err;
    var query = {id: request.session.id};
    db.collection("user_login_history").find(query).toArray(function(err, result) {
      response.json(result);
      db.close();
    });
  });
});

app.get('/behaviorLogHistory', (request, response) =>{
  MongoClient.connect(url, function (err, db) {
    if(err) throw err;
    var query = {id: request.session.id};
    db.collection("user_behavior_logs").find(query).toArray(function(err, result) {
      response.json(result);
      db.close();
    });
  });
});

app.post('/login', (request, response)=> {
  id = request.body.id;
  password = request.body.password;
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var query = { id: id ,password: password };
    db.collection("users").find(query).toArray(function (err, result) {
      if (err) response.json({ "response": "Failed" });
      if (result.length == 0) {
        console.log(result);
        response.json(result);
        console.log('Logged in Failed');
      }
      else {
        //response.json({"response": "Success"});
        console.log('Logged in successfully');
        request.session.id = id;
        var currentDate = new Date();
        var date = (currentDate.getMonth() + 1) + "/" + currentDate.getDate() + "/" + currentDate.getFullYear();
        var time = currentDate.getHours() +":"+ currentDate.getMinutes()+":"+currentDate.getSeconds();
        var insertQuery = {id:id, date: date, time: time};
        db.collection("user_login_history").insertOne(insertQuery, function (err, res) {
          if(err) throw err;
          db.close();
        });
        response.redirect('/home');
      }
    });
  });
});

app.get('/logout', (request, response)=> {
  request.session.reset();
  response.redirect('/');
});

function requireLogin (req, res, next) {
  if (!req.user) {
    res.redirect('/');
  } else {
    next();
  }
};

app.post('/register', (request, response)=> {
  id = request.body.id;
  password = request.body.password;
  name = request.body.name;
  email = request.body.email;
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var query = { id: id ,password: password, name: name, email:email };
    db.collection("users").insertOne(query, function (err, res) {
      if(err) throw err;
      response.json({"response": "Success"});
      db.close();
    });
  });
});


app.post('/behaviorlogs', (request, response)=> {
  id = request.session.id;
  action = request.body.action;
  link = request.body.link;
  desc = request.body.desc;
  MongoClient.connect(url, function(err, db){
    if(err) throw err;
    var query = {id:id, action: action, link:link, desc:desc};
    db.collection("user_behavior_logs").insertOne(query, function (err, res) {
      if(err) throw err;
      response.json({"response": "success"});
      db.close();
    });
  });
});



var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(cors());
app.use(bodyParser.json());

app.set('port', process.env.PORT || argv.port || 8080);

app.use('/', express.static(__dirname));


/// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            title: 'error'
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
    });
});


module.exports = app;
