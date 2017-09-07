/**
 * Created by Ayush on 9/3/2017.
 */
const argv = require('yargs').argv,
  cors = require('cors'),
  express = require('express'),
  bodyParser = require('body-parser'),
  path = require('path');
// var pg =require('pg');
var http = require('http');
var newpage = "E:\\ASU Fall17\\Adaptive Web\\Assignments\\untitled\\Assignment1\\index.html";
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://mshekh:pwd@ds151433.mlab.com:51433/heroku_t0kvxbnw";
var handlebars = require('express-handlebars')
  .create({ defaultLayout: 'main' });
let app = express();

app.use(cors());
app.use(bodyParser.json());

app.set('port', process.env.PORT || argv.port || 8080);

app.use('/', express.static(__dirname));

app.get('/', (request, response) => {
  response.send('hola');
// response.sendFile(path.join(__dirname + '/index.html'));
});


app.post('/login', (request, response) => {
  // console.log('query parameters:');
  user = request.query['id'];
  pwd = request.query['password'];
// console.log(JSON.stringify(request.query));

// console.log("hello1");
MongoClient.connect(url, function (err, db) {
  // console.log("hello2");
  if (err) throw err;
  var query = { username: user ,password: pwd };
  console.log(query)

  db.collection("users").find(query).toArray(function (err, result) {
    if (err) response.json({ "response": "Failed" });

    db.close();
    if (result.length == 0) {
      // response.status=201;
      response.json({ "response": "Failed" });

      console.log('Logged in Failed');

    }
    else {
      response.json({ "response": "Success" });
      console.log('Logged in successfully');
    }

  });
});




});
