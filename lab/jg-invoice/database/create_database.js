var mysql = require('mysql');

var con = mysql.createConnection({
  host:"localhost",
  user: "root",
  password: "password"
});
// install mysql first
// then npm mysql

con.connect(function(err){
  if(err) throw err;
  console.log("Connected to database");


  con.query("CREATE DATABASE dbinvoice", function(err,result){
    if(err) throw err;
    console.log("Database created");
  });


});
