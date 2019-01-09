var http = require("http");
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });

// Running Server Details.

var server = app.listen(8082, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at %s:%s Port", host, port)
});


  app.get('/form', function (req, res) {
    res.sendFile('form_test.html' , { root : __dirname});
  });

  app.post('/thank', urlencodedParser, function (req, res){
    var reply='';
    reply += "Your name is " + req.body.namee;
    reply += "Your E-mail id is " + req.body.emaill;
    res.send(reply);
   });
