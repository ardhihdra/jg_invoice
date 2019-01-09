var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "mydb"
});

con.connect(function(err) {
  if (err) throw err;
  con.query("SELECT name FROM customers WHERE address = 'tasik 3'", function (err, result, fields) {
    if (err) throw err;
    console.log(result[0].name);
  });
});
