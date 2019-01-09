var mysql = require('mysql');

var con = mysql.createConnection({
  host:"localhost",
  user: "root",
  password: "password",
  database: "dbinvoice"
});
// install mysql first
// then npm mysql

con.connect(function(err){
  //con.query("ALTER TABLE Invoice ADD id INT(11) NOT NULL AUTO_INCREMENT", function(err,reuslt){if(err) throw err;});
  //con.query("ALTER TABLE Barang ADD id INT NOT NULL PRIMARY KEY", function(err,reuslt){if(err) throw err;});
  //con.query("ALTER TABLE Invoice ADD denda INT ");
  con.query("ALTER TABLE Invoice MODIFY COLUMN kembali INT");

  con.query("ALTER TABLE Invoice MODIFY COLUMN diambil INT");

  //con.query("DROP TABLE Barang", function(err,reuslt){if(err) throw err;});

  /*var sqlbarang = "CREATE TABLE Barang (nama_barang VARCHAR(50), harga_sewa INTEGER,"
                + " siap_sewa INTEGER, total_barang INTEGER"+ ")";
  con.query(sqlbarang, function(err,result){
    if(err) throw err;
    console.log("Number of records recorded! : "+ result.affectedRows);
  });*/



});
