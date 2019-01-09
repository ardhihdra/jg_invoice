var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "mydb"
});

con.connect(function(err){
  if (err) throw err;
  console.log("connected!");
  /* create DATABASE
  con.query("CREATE DATABASE mydb", function(err,result){
    if(err) throw err;
    console.log("Database created");
  });*/

  //create TABLE
  //var sql = "CREATE TABLE customers (name VARCHAR(255), address VARCHAR(255))";
  //insert VALUES
  //var sql = "INSERT INTO customers (name,address) VALUES ('Company Inc','HIghway 37')";
  var sql = "INSERT INTO customers (name,address) VALUES ?";
  var values = [
    ['Ardhi', 'Pataruman 3'],
    ['Tasa', 'Bandung 4'],
    ['Nafa', 'Tasik 3']
  ];
  con.query(sql, [values], function(err,result){
    if(err) throw err;
    console.log("Number of records recorded! : "+ result.affectedRows);
  });
/* resulted object
{
  fieldCount: 0,
  affectedRows: 14,
  insertId: 0,
  serverStatus: 2,
  warningCount: 0,
  message: '\'Records:14  Duplicated: 0  Warnings: 0',
  protocol41: true,
  changedRows: 0
}
*/

});
