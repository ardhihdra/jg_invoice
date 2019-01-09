var http = require('http');
var url = require('url');
var fs = require('fs');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });
var mysql = require('mysql');
var trct = require('truncate-html');
const Json2csvParser = require('json2csv').Parser;
// var popup = require('popups');
var jsdom = require('jsdom');
var JSDOM = jsdom.JSDOM;

//install document juga
// install mysql first
// then npm mysql
// install jQuery

process.env.PWD = process.cwd()
app.use(express.static(process.env.PWD + '/public'));
app.use(express.static(process.env.PWD + '/css'));
app.use(express.static(process.env.PWD + '/javascript'));
app.use(express.static(process.env.PWD + '/database'));

//global.document = new JSDOM('input.html').window.document;

// Running Server Details.

var server = app.listen(8082, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Example app listening at %s:%s Port", host, port);
});

app.get('/form.html', function (req, res) {
  console.log("ini get form");
  var con = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "password",
    database: "dbinvoice"
  });
  con.connect(function(err){
    if(err) throw err;

    var sql = "SELECT nama_barang, harga_sewa FROM Barang";
    con.query(sql, function (err, result, fields) {
      if (err) throw err;
      console.log(result[0].nama_barang);

        var page_template = fs.readFileSync('form.html','utf-8');
        var document = new JSDOM(page_template);
        document = document;
        window = document.defaultView;
        var $ = require('jquery')(document.window);
        var barangdiinput;
        var cart;
        for(var i=0;i<result.length;i++){
          barangdiinput = "<option name= '"+ result[i].nama_barang + "'>"  + result[i].nama_barang ;
          barangdiinput += " : "+ result[i].harga_sewa +"</option>\n";
          console.log(barangdiinput);
          $(barangdiinput).appendTo('select');

          cart = "<p><a href='#'>"+result[i].nama_barang +"</a> <span class='price' name='harga"+ (i+1)+ "'>"+ result[i].harga_sewa +"</span></p>"
          $(cart).appendTo('div4');
        }

        console.log($('html').html());
        res.send($('html').html());

      });

  //  });

  });
});

app.post('/form.html', urlencodedParser, function(req,res){
  console.log("ini post form");
  //post bakal nerima data (data uang muka dan sisa) yang tersubmit dan dikirim dari tag html form cuk
  var con = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "password",
    database: "dbinvoice"
  });
  var pageform = fs.readFileSync('form.html','utf-8');
  var pageform = fs.readFileSync('checkout.html','utf-8');

  var document1 = new JSDOM();

  var document = new JSDOM(pageform);
  document = document;
  window = document.defaultView;
  var $ = require('jquery')(document.window);
  con.connect(function(err){
    if(err) throw err;
    //console.log("isi body");
    //console.log(req);

    // -------

    var kirimbarang = "INSERT INTO Invoice";
    kirimbarang += "(name, email,"
            + "nomor_hp, tujuan, waktu_booking,"
            + "waktu_pengambilan, waktu_kembali,"
            + "barang1, barang2, barang3, barang4, barang5, barang6, barang7,"
            + "nbarang1, nbarang2, nbarang3, nbarang4, nbarang5, nbarang6, nbarang7,"
            + "lama_sewa, total_biaya, uang_muka, sisa, kembali, diambil"
            + ")"
    kirimbarang += "VALUES ?";
    var taken=0;
    var now = new Date();
    var then = new Date(req.body.rentdate);
    if(now.getDate()==then.getDate() && now.getMonth()==then.getMonth() && now.getFullYear()==then.getFullYear()){
      taken = 1;
    }
    console.log(taken);
    var value = [
      [req.body.name,req.body.email,req.body.phonenumber,req.body.destination,new Date(),new Date(req.body.rentdate),new Date(req.body.returndate),
        req.body.gear1,req.body.gear2,req.body.gear3,req.body.gear4,req.body.gear5,req.body.gear6,req.body.gear7,
        req.body.barang1,req.body.barang2,req.body.barang3,req.body.barang4,req.body.barang5,req.body.barang6,req.body.barang7,
        req.body.lamasewa,req.body.total,req.body.dp,req.body.sisa,0,taken]
    ];
    console.log("barang2 nya");
    console.log(req.body.rentdate);;
    con.query(kirimbarang, [value], function(err, result){
      if(err) throw err;
      console.log("barang berhasil dimasukan ke database invoice");
    });


    // --------
    var sql = "SELECT nama_barang, harga_sewa FROM Barang";
    con.query(sql, function (err, result, fields) {
      if (err) throw err;
      //console.log(result[0].nama_barang);

      var page_template = fs.readFileSync('form.html','utf-8');
      var document = new JSDOM(page_template);
      document = document;
      window = document.defaultView;
      var $ = require('jquery')(document.window);
      var barangdiinput;
      var cart;
      for(var i=0;i<result.length;i++){
        barangdiinput = "<option name= '"+ result[i].nama_barang + "'>"  + result[i].nama_barang ;
        barangdiinput += " : "+ result[i].harga_sewa +"</option>\n";
        //console.log(barangdiinput);
        $(barangdiinput).appendTo('select');
        //$(nbarangdiinput).appendTo('divh');

        cart = "<p><a href='#'>"+result[i].nama_barang +"</a> <span class='price' name='harga"+ (i+1)+ "'>"+ result[i].harga_sewa +"</span></p>"
        $(cart).appendTo('div4');
      }

      //console.log($('html').html());
      //console.log(dom.serialize());
      //res.sendFile('form.html' , { root : __dirname});
      res.send($('html').html());

      });

  //  });

    //res.send($('html').html());
  });
});

app.get('/checkout.html', urlencodedParser, function(req,res){
  console.log("ini get check");
  res.sendFile('form.html', { root : __dirname});
});

app.post('/checkout.html', urlencodedParser, function(req,res){
  console.log("ini post check");
  var con = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "password",
    database: "dbinvoice"
  });
  var sql = "SELECT harga_sewa FROM Barang"; //
  var harga = [];
  var cost;
  var page_template = fs.readFileSync('checkout.html','utf-8');
  var document = new JSDOM(page_template);
  document = document;
  window = document.defaultView;
  var $ = require('jquery')(document.window);
  con.connect(function(err){
    if(err) throw err;

  //console.log(req.body.name);
    var d = new Date();
    console.log(d.getDate());
    //handle profil peminjam yang muncul
    var profil = "<label>Atas nama :</label><input type='text' class='col-50' name='name' value='"+ req.body.name + "'></input>";
    profil += "<label>Nomor HP : </label><input type='text' class='col-50' name='phonenumber' value='"+req.body.phonenumber+"'></input>";
    profil += "<label>Tujuan : </label><input type='text' class='col-50' name='destination' value='"+req.body.destination+"'></input>";
    profil += "<label>Tanggal Sewa : </label><input type='text' class='col-50' name='datenow' value='" + d + "'></input>";
    profil += "<label>Tanggal Pengambilan : </label><input type='text' class='col-50' name='rentdate' value='"+req.body.rentdate +"'></input>";
    profil += " <label>Tanggal Pengembalian : </label><input type='text' class='col-50' name='returndate' value='"+req.body.returndate +"'></input><br>";
    //console.log(profil);
    $(profil).appendTo('div1');
////
    var a = req.body.gear1.split(" : ")[0];
    console.log(req.body.gear4.split(" : ")[1]);
    var arrayGear = [
      [req.body.gear1.split(" : ")[0], parseInt(req.body.gear1.split(" : ")[1]) ,parseInt(req.body.barang1)],
      [req.body.gear2.split(" : ")[0], parseInt(req.body.gear2.split(" : ")[1]) ,parseInt(req.body.barang2)],
      [req.body.gear3.split(" : ")[0], parseInt(req.body.gear3.split(" : ")[1]) ,parseInt(req.body.barang3)],
      [req.body.gear4.split(" : ")[0], parseInt(req.body.gear4.split(" : ")[1]) ,parseInt(req.body.barang4)],
      [req.body.gear5.split(" : ")[0], parseInt(req.body.gear5.split(" : ")[1]) ,parseInt(req.body.barang5)],
      [req.body.gear6.split(" : ")[0], parseInt(req.body.gear6.split(" : ")[1]) ,parseInt(req.body.barang6)],
      [req.body.gear7.split(" : ")[0], parseInt(req.body.gear7.split(" : ")[1]) ,parseInt(req.body.barang7)],
    ];
    //console.log(arrayGear);
    //handle nama2 barang yang muncul
    var barang = "<br>";
    var total=0;
    var lamasewa;
    var i = 0;
    var d1 = (new Date(req.body.rentdate).getDate());
    var d2 = (new Date(req.body.returndate).getDate());
    var m1 = (new Date(req.body.rentdate).getMonth());
    var m2 = (new Date(req.body.returndate).getMonth());
    var y1 = (new Date(req.body.rentdate).getFullYear());
    var y2 = (new Date(req.body.returndate).getFullYear());

    var h1 = (new Date(req.body.rentdate).getHours());
    var h2 = (new Date(req.body.returndate).getHours());
    var mn1 = (new Date(req.body.rentdate).getMinutes());
    var mn2 = (new Date(req.body.returndate).getMinutes());
    var dt1 = (new Date(req.body.rentdate).getSeconds());
    var dt2 = (new Date(req.body.returndate).getSeconds());
    //console.log(d1 + " " + m1 + " " + y1 + " " + h1 + " " + mn1 + " " + dt1);
//
    for(let i=0;i<arrayGear.length;i++){
      if(arrayGear[i][0]=='-') {
        //console.log('nyettt');
        harga.push(0);
      }else{
        harga.push(arrayGear[i][1]);
      }
      //console.log("harga tes " + harga[i]*10000);
      //console.log(" gear tes " + arrayGear[i][0]);
      if(y2!=y1) lamasewa = ((31-d1)) + (d2);
      else {
        if(m2!=m1){
          if(y1%4==0&&m1==1) {lamasewa = ((29-d1)) + (d2);}
          else if (m1==1) {lamasewa = ((28-d1)) + (d2);}
          else if ((m1+1)%2==0) {lamasewa = (1*(31-d1)) + (1*d2);}
          else {lamasewa = (1*(30-d1)) + (1*d2);}
        }else lamasewa = (1*(d2-d1));
      }
      //console.log(arrayGear[i][1]);
      //console.log(lamasewa);
      //console.log(arrayGear[i][2]);
      cost = arrayGear[i][1]*lamasewa*arrayGear[i][2];

      harga[i] = harga[i]*lamasewa;
      var barang = "<div class='row'>";
      barang += "<input type='text' class='col-50' name='gear"+(i+1)+"' value='"+arrayGear[i][0]+"'></input>";
      barang += "<input type='text' class='col-50' name='harga"+(i+1)+"' value='"+cost+"'></input>";
      barang += "<input type='text' class='col-50' name='barang"+(i+1)+"' value ='"+arrayGear[i][2]+"'></input>";
      barang +="</div>";
      total += cost;
      $(barang).appendTo('div2');
      //console.log($('html').html());
//
    } //for lop
      var tagihan = "<label name='lamasewa'>Lama sewa (hari): <input type='textnumber' value='"+lamasewa+"'></label>";
      tagihan += "<br><label name='total'>Total Tagihan : <input type='textnumber' value='"+ total+ "'></label>";
      //console.log($('html').html());
      $(tagihan).appendTo('div3');
      // ----
      /*req.body.email,req.body.phonenumber,req.body.destination,new Date(),new Date(req.body.rentdate),new Date(req.body.returndate),
        req.body.gear1,req.body.gear2,req.body.gear3,req.body.gear4,req.body.gear5,req.body.gear6,req.body.gear7,
        req.body.barang1,req.body.barang2,req.body.barang3,req.body.barang4,req.body.barang5,req.body.barang6,req.body.barang7,
        req.body.lamasewa,req.body.total,0,0,0*/
      /*  res.body = {};
        console.log("titittt");
        console.log(res.body);
        console.log(req.body.name);
      Object.assign(res.body,{name :req.body.name});
      console.log(res.body);*/
      // ------
    //res.sendFile('checkout.html', { root : __dirname});
      res.send($('html').html());
  });

});

app.get('/return.html', urlencodedParser, function (req,res) {
 //ambil nilai denda ambil nilai boolean terkembalikan
 console.log("enter get return");
 var con = mysql.createConnection({
   host:"localhost",
   user: "root",
   password: "password",
   database: "dbinvoice"
 });

 var page_template = fs.readFileSync('return.html','utf-8');
 var document = new JSDOM(page_template);
 document = document;
 window = document.defaultView;
 var $ = require('jquery')(document.window);

 var date = new Date();
 var d = date.getDate();
 var m = date.getMonth();
 var y = date.getFullYear();
 var h = date.getHours();
 var mt = date.getMinutes();
 var dt = date.getSeconds();
 var newdate = date.toISOString();

 con.connect(function(err){
   if(err) throw err;
   var sql = "SELECT name,nomor_hp,tujuan,waktu_pengambilan,waktu_kembali,sisa,diambil,kembali,";
   sql += "barang1,barang2,barang3,barang4,barang5,barang6,barang7,";
   sql += "nbarang1,nbarang2,nbarang3,nbarang4,nbarang5,nbarang6,nbarang7";
   sql += " FROM Invoice WHERE diambil=0 or kembali=0 and name!='' ORDER BY waktu_pengambilan ASC"; //
   //console.log(sql);

   con.query(sql,function(err,result,fields){
     console.log(result);
     for(let i=0;i<result.length;i++){
       console.log(result[i].name);
       var profil = "<div class='container'>";
       profil +=  "   <form action='/return.html' method='post' name='form1'>";
       profil +=  "     <div class='row'>";
       profil +=          "<divv class='col-50'>";
       profil +=            "<label>Nama Penyewa : <input name='name' value='"+result[i].name+"'></label>";
       profil +=            "<label>Nomor HP : <input name='phonenumber' value='"+ result[i].nomor_hp +"'></label>";
       profil +=            "<label>Tujuan : <input name='destination' value='"+ result[i].tujuan+"'></label>";
       profil +=            "<label><i class='fa fa-date'></i>Tanggal ambil : "+result[i].waktu_pengambilan +"</label>";
       profil +=            "<label>Sisa pembayaran : "+result[i].sisa +"</label>";
       profil +=            "<label><i class='fa fa-date'></i>Tanggal Pengembalian : "+result[i].waktu_kembali+"</label>";
       if(result[i].diambil==1) profil +=            "<label> barang sudah diambil "+"</label>";
       else profil +=            "<label> barang belum diambil "+"</label>";
       if(result[i].kembali==1) profil +=            "<label> barang sudah kembali "+"</label>";
       else profil +=            "<label> barang belum kembali "+"</label>";
       profil +=         "</divv>";
       profil +=          "<div class='col-50'>";
       profil +=          "<h3>Gear Set</h3>";
       profil +=          "<ol class='row'>";
       profil +=            "<li>Gear "+ result[i].barang1 + " jumlahnya : "+ result[i].nbarang1 +"<br>";
       profil +=            "denda jika rusak: <input type='textnumber' name='denda' value=0> </li>";
       profil +=            "<li>Gear "+ result[i].barang2 + " jumlahnya : "+ result[i].nbarang2 +"<br>";
       profil +=            "denda jika rusak: <input type='textnumber' name='denda' value=0> </li>";
       profil +=            "<li>Gear "+ result[i].barang3 + " jumlahnya : "+ result[i].nbarang3 +"<br>";
       profil +=            "denda jika rusak: <input type='textnumber' name='denda' value=0> </li>";
       profil +=            "<li>Gear "+ result[i].barang4 + " jumlahnya : "+ result[i].nbarang4 +"<br>";
       profil +=            "denda jika rusak: <input type='textnumber' name='denda' value=0> </li>";
       profil +=            "<li>Gear "+ result[i].barang5 + " jumlahnya : "+ result[i].nbarang5 +"<br>";
       profil +=            "denda jika rusak: <input type='textnumber' name='denda' value=0> </li>";
       profil +=            "<li>Gear "+ result[i].barang6 + " jumlahnya : "+ result[i].nbarang6 +"<br>";
       profil +=            "denda jika rusak: <input type='textnumber' name='denda' value=0> </li>";
       profil +=            "<li>Gear "+ result[i].barang7 + " jumlahnya : "+ result[i].nbarang7 +"<br>";
       profil +=            "denda jika rusak: <input type='textnumber' name='denda' value=0> </li>";
       profil +=          "</ol>";
       profil +=        "</div>";
       profil +=      "</div>";
       profil +=      "<divi>";
       profil +=        "<input type='submit' value='Konfirmasi Pengembalian' class='btn'>";
       profil +=      "</divi></form></div>";
       console.log(profil);
       $(profil).appendTo("body");

     } // end loop

     res.send($('html').html());
   });
 });


 //res.sendFile('return.html', { root : __dirname});
});

app.post('/return.html', urlencodedParser, function (req,res) {
  //kirim data list pengembalian yang baru
  console.log("enter post return");
  var con = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "password",
    database: "dbinvoice"
  });
  var page_template = fs.readFileSync('return.html','utf-8');
  var document = new JSDOM(page_template);
  document = document;
  window = document.defaultView;
  var $ = require('jquery')(document.window);

   var date = new Date();
   var d = date.getDate();
   var m = date.getMonth();
   var y = date.getFullYear();
   var h = date.getHours();
   var mt = date.getMinutes();
   var dt = date.getSeconds();
   var newdate = date.toISOString();

  con.connect(function(err) {
    if(err) throw err;
    console.log(req.body.denda);
    var sum = 0;
    sum = (req.body.denda).reduce((a, b) => parseInt(a) + parseInt(b), 0);

    var set = "UPDATE Invoice SET kembali = 1, diambil=1, denda="+sum+" ";
    set += " WHERE name ='"+req.body.name+"' and nomor_hp='"+req.body.phonenumber+"' and tujuan ='"+ req.body.destination+"'";
    con.query(set,function(err,result,fields){
      if(err) throw err;
    });

    var sql = "SELECT name,nomor_hp,tujuan,waktu_pengambilan,waktu_kembali,sisa,diambil,";
    sql += "barang1,barang2,barang3,barang4,barang5,barang6,barang7,"
    sql += "nbarang1,nbarang2,nbarang3,nbarang4,nbarang5,nbarang6,nbarang7"
    sql += " FROM Invoice WHERE diambil=0 or kembali=0 and name!='' ORDER BY waktu_pengambilan ASC" //
    //console.log(sql);

    con.query(sql,function(err,result,fields){
      console.log(result);
      for(let i=0;i<result.length;i++){
        console.log(result[i].name);
        var profil = "<div class='container'>";
        profil +=  "   <form action='/return.html' method='post' name='form1'>";
        profil +=  "     <div class='row'>";
        profil +=          "<divv class='col-50'>";
        profil +=            "<label>Nama Penyewa : <input name='name' value='"+result[i].name+"'></label>";
        profil +=            "<label>Nomor HP : <input name='phonenumber' value='"+ result[i].nomor_hp +"'></label>";
        profil +=            "<label>Tujuan : <input name='destination' value='"+ result[i].tujuan+"'></label>";
        profil +=            "<label><i class='fa fa-date'></i>Tanggal ambil : "+result[i].waktu_pengambilan +"</label>";
        profil +=            "<label>Sisa pembayaran : "+result[i].sisa +"</label>";
        profil +=            "<label><i class='fa fa-date'></i>Tanggal Pengembalian : "+result[i].waktu_kembali+"</label>";
        if(result[i].diambil==1) profil +=            "<label> barang sudah diambil "+"</label>";
        else profil +=            "<label> barang belum diambil "+"</label>";
        if(result[i].kembali==1) profil +=            "<label> barang sudah kembali "+"</label>";
        else profil +=            "<label> barang belum kembali "+"</label>";
        profil +=         "</divv>";
        profil +=          "<div class='col-50'>";
        profil +=          "<h3>Gear Set</h3>";
        profil +=          "<ol class='row'>";
        profil +=            "<li>Gear "+ result[i].barang1 + " jumlahnya : "+ result[i].nbarang1 +"<br>";
        profil +=            "denda jika rusak: <input type='textnumber' name='denda' value=0> </li>";
        profil +=            "<li>Gear "+ result[i].barang2 + " jumlahnya : "+ result[i].nbarang2 +"<br>";
        profil +=            "denda jika rusak: <input type='textnumber' name='denda' value=0> </li>";
        profil +=            "<li>Gear "+ result[i].barang3 + " jumlahnya : "+ result[i].nbarang3 +"<br>";
        profil +=            "denda jika rusak: <input type='textnumber' name='denda' value=0> </li>";
        profil +=            "<li>Gear "+ result[i].barang4 + " jumlahnya : "+ result[i].nbarang4 +"<br>";
        profil +=            "denda jika rusak: <input type='textnumber' name='denda' value=0> </li>";
        profil +=            "<li>Gear "+ result[i].barang5 + " jumlahnya : "+ result[i].nbarang5 +"<br>";
        profil +=            "denda jika rusak: <input type='textnumber' name='denda' value=0> </li>";
        profil +=            "<li>Gear "+ result[i].barang6 + " jumlahnya : "+ result[i].nbarang6 +"<br>";
        profil +=            "denda jika rusak: <input type='textnumber' name='denda' value=0> </li>";
        profil +=            "<li>Gear "+ result[i].barang7 + " jumlahnya : "+ result[i].nbarang7 +"<br>";
        profil +=            "denda jika rusak: <input type='textnumber' name='denda' value=0> </li>";
        profil +=          "</ol>";
        profil +=        "</div>";
        profil +=      "</div>";
        profil +=      "<divi>";
        profil +=        "<input type='submit' value='Konfirmasi Pengembalian' class='btn'>";
        profil +=      "</divi></form></div>";
        console.log(profil);
        $(profil).appendTo("body");

      } // end loop

      res.send($('html').html());
    });

  });
});

app.get('/stock.html', urlencodedParser, function(req, res){
  console.log("enter get stock");
  var con = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "password",
    database: "dbinvoice"
  });

  var page_template = fs.readFileSync('return.html','utf-8');
  var document = new JSDOM(page_template);
  document = document;
  window = document.defaultView;
  var $ = require('jquery')(document.window);

  var date = new Date();
  var d = date.getDate();
  var m = date.getMonth();
  var y = date.getFullYear();
  var h = date.getHours();
  var mt = date.getMinutes();
  var dt = date.getSeconds();
  var newdate = date.toISOString();
  var barangdiinput;
  var cart;
  var page_template = fs.readFileSync('stock.html','utf-8');
  var document = new JSDOM(page_template);
  document = document;
  window = document.defaultView;
  var $ = require('jquery')(document.window);
  var hasil;

  con.connect(function(err) {
    var sql = "SELECT nama_barang, total_barang FROM Barang";
    var cqsql = con.query(sql,function(err, result, fields) {
      if (err) throw err;
      console.log(result[0].nama_barang);

        for(var i=0;i<result.length;i++){
          barangdiinput = "<option >"  + result[i].nama_barang + " : ";
          barangdiinput += result[i].total_barang + "</option>\n";
          //console.log(barangdiinput);
          $(barangdiinput).appendTo('select');
        }
        hasil = barangdiinput;
        res.send($('html').html());

    }); //where is taken
    //console.log("ini hasil");
    //console.log(hasil);

    //console.log($('html').html());
  });
  //res.sendFile('stock.html', {root: __dirname});
});

app.post('/stock.html', urlencodedParser, function(req, res){
  console.log("enter post stock");
  var con = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "password",
    database: "dbinvoice"
  });

  var date = new Date(req.body.rentdate);
  //date = extractday(date);
  var date1 = new Date(req.body.returndate);
  //date1 = extractday(date1);
  //console.log(date[0] + " " + date[1] + " " + date[2]+ " " + date[3]+ " " + date[4] + " " + date[5]);

  var rentdate1 = date.getTime();
  var returndate1 = date1.getTime();
  var rnt1 = extractday(date);
  var rtr1 = extractday(date1);
  var barangdiinput;
  var cart;

  var page_template = fs.readFileSync('check_table.html','utf-8');
  var document = new JSDOM(page_template);
  document = document;
  window = document.defaultView;
  var $ = require('jquery')(document.window);

  var hasil;
  var gear, ngear;
  gear = req.body.gear.split(' : ')[0];
  ngear = req.body.gear.split(' : ')[1];
  con.connect(function(err) {
    //console.log($('html').html());
    var ceksql = "SELECT barang1,barang2,barang3,barang4,barang5,barang6,barang7, waktu_kembali, waktu_pengambilan,";
    ceksql += " nbarang1,nbarang2,nbarang3,nbarang4,nbarang5,nbarang6,nbarang7 FROM Invoice WHERE";
    ceksql += " barang1='"+gear+"' OR "+" barang2='"+gear+"' OR "+" barang3='"+gear+"' OR "+" barang4='"+gear+"' OR "+" barang5='"+gear+"' OR "+" barang6='"+gear+"' OR "+" barang7='"+gear+"' ";
    ceksql += " and kembali=0";
    //console.log(ceksql);
    con.query(ceksql, function(err,result,fields){
      //console.log(result);
      //console.log(extractday(new Date(result[0].waktu_kembali)));
      var rentdate; var returndate;
      var lamasewa;
      var realresult = []; var j = 0;

      for(let i=0;i<result.length;i++){
        rentdate = new Date(result[i].waktu_pengambilan).getTime();
        returndate = new Date(result[i].waktu_kembali).getTime();
        if((returndate >= rentdate1 && rentdate <= rentdate1) || (rentdate>=rentdate1 && rentdate <= returndate1)){
          console.log("ini ada satu");
          //cari lama sewa
          realresult[j] = result[i]; j++;
          if(rtr1[2]!=rnt1[2]) lamasewa = (31-rnt1[0]) + (rtr1[0]);
          else {
            if(rtr1[1]!=rnt1[1]){
              if(rnt1[3]%4==0&&rnt1[1]==1) {lamasewa = (29-rnt1[0]) + (rtr1[0]);}
              else if (rent1[1]==1) {lamasewa = (28-rnt1[0]) + (rtr1[0]);}
              else if ((rent1[1]+1)%2==0) {lamasewa = 1*(31-rnt1[0]) + (1*rtr1[0]);}
              else {lamasewa = 1*(30-rnt1[0]) + (1*rtr1[0]);}
            }else {lamasewa = 1*(rtr1[0]-rnt1[0]);}
          }
        }
          //jika memenuhi syarat tulis di check_table.html
      } //out for
      //console.log("realresult");
      //console.log(realresult);
      var stok=0;
      //cari alat banyaknya alat yang kepake di tanggal tertentu
      for(let x=0;x<realresult.length;x++){
        //7 masih hardcoded
        if(realresult[x].barang1==gear) stok+=realresult[x].nbarang1;
        if(realresult[x].barang2==gear) stok+=realresult[x].nbarang2;
        if(realresult[x].barang3==gear) stok+=realresult[x].nbarang3;
        if(realresult[x].barang4==gear) stok+=realresult[x].nbarang4;
        if(realresult[x].barang5==gear) stok+=realresult[x].nbarang5;
        if(realresult[x].barang6==gear) stok+=realresult[x].nbarang6;
        if(realresult[x].barang7==gear) stok+=realresult[x].nbarang7;

        //cari tanggal yang tepat
      }

      var response = "<label> Barang : "+ gear +"</label>";
      response += "<label>Sebanyak : "+ngear +" unit </label>";
      response += "<label>Diambil pada tanggal : "+req.body.rentdate+" </label>";
      response += "<label>Dikembalikan pada tanggal : "+req.body.returndate+" </label>";
      response += "<hr><br>";
      response += "<h4> Stok JG : "+ngear+"</h4>";
      response += "<label> Stok terpakai "+stok +"</label>";
      response += "<label> Stok sisa "+ (parseInt(ngear) - parseInt(stok)) +"</label>";
      //console.log(response);
      $(response).appendTo("divreq");
      res.send($('html').html());
    }); //out ceksql query

  });

  function extractday(a){
    return [a.getDate(),a.getMonth(),a.getFullYear(),a.getHours(),a.getMinutes(),a.getSeconds()];
  }
  //res.sendFile('check_table.html', {root: __dirname});
});

app.get('/input.html', function (req, res) {
  //ambil nilai barang lama dan barang baru jika ada
  var con = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "password",
    database: "dbinvoice"
  });

  var page_template = fs.readFileSync('input.html','utf-8');
  var document = new JSDOM(page_template);
  document = document;
  window = document.defaultView;
  var $ = require('jquery')(document.window);

  var sql = "SELECT nama_barang,total_barang FROM Barang";
  var cqsql = con.query(sql,function(err, result, fields) {
    if (err) throw err;
    console.log(result[0].nama_barang);

      for(var i=0;i<result.length;i++){
        barangdiinput = "<option >"  + result[i].nama_barang + " : stok " + result[i].total_barang;
        barangdiinput += "</option>\n";
        //console.log(barangdiinput);
        $(barangdiinput).appendTo('select');
      }
      hasil = barangdiinput;
      res.send($('html').html());
  }); //end query

  //res.sendFile('input.html' , { root : __dirname});
});

app.post('/baranglama',urlencodedParser,function(req,res){
  var con = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "password",
    database: "dbinvoice"
  });
  var page_template = fs.readFileSync('input.html','utf-8');
  var document = new JSDOM(page_template);
  document = document;
  window = document.defaultView;
  var $ = require('jquery')(document.window);

  var gear = req.body.gear.split(" : stok ")[0];
  var ngear = req.body.gear.split(" : stok ")[1];

  con.connect(function(err){
    if(err) throw err;
    console.log("masuk konek");
    var sql = "UPDATE Barang SET ";
    if(req.body.ngear!='0' && req.body.ubahharga!='0'){
      sql += "total_barang="+req.body.ngear+" , harga_sewa="+req.body.ubahharga;
    }
    if(req.body.ngear!='0' && req.body.ubahharga=='0'){
      sql += "total_barang="+req.body.ngear;
    }
    if(req.body.ngear=='0' && req.body.ubahharga!='0'){
      sql += "harga_sewa"+req.body.ubahharga;
    }
    sql += " WHERE nama_barang='"+gear+"'"; //
    con.query(sql, function(err, result){if(err) throw err;});
    //console.log(sql);

    var sql = "SELECT nama_barang,total_barang FROM Barang";
    var cqsql = con.query(sql,function(err, result, fields) {
      if (err) throw err;
      console.log(result[0].nama_barang);

      for(var i=0;i<result.length;i++){
        barangdiinput = "<option >"  + result[i].nama_barang + " : stok "+result[i].total_barang;
        barangdiinput += "</option>\n";
        //console.log(barangdiinput);
        $(barangdiinput).appendTo('select');
      }
      hasil = barangdiinput;
      res.send($('html').html());
    }); //end query

  });
});

app.post('/inputbarang',urlencodedParser,function(req,res){
  var con = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "password",
    database: "dbinvoice"
  });
  var page_template = fs.readFileSync('input.html','utf-8');
  var document = new JSDOM(page_template);
  document = document;
  window = document.defaultView;
  var $ = require('jquery')(document.window);

  /*var reply='';
  reply += req.body.stuffname;
  reply += " " + req.body.stuffprice;
  reply += " " + req.body.stuffqty;*/

  con.connect(function(err){
    if(err) throw err;
    console.log("masuk konek");
    var sql = "INSERT INTO Barang (nama_barang, harga_sewa, siap_sewa, total_barang) VALUES ?"; //
    var value = [
      [req.body.stuffname, parseInt(req.body.stuffprice,10), parseInt(req.body.stuffqty,10), parseInt(req.body.stuffqty,10)]
    ];
    con.query(sql, [value], function(err, result){if(err) throw err;});
    //console.log(sql);
    //console.log("Data Termasukkan!" + reply);

    var sql = "SELECT nama_barang FROM Barang";
    var cqsql = con.query(sql,function(err, result, fields) {
      if (err) throw err;
      console.log(result[0].nama_barang);

      for(var i=0;i<result.length;i++){
        barangdiinput = "<option >"  + result[i].nama_barang;
        barangdiinput += "</option>\n";
        //console.log(barangdiinput);
        $(barangdiinput).appendTo('select');
      }
      hasil = barangdiinput;
      res.send($('html').html());
    }); //end query
  });
  //res.sendFile('input.html' , { root : __dirname});
});

//ini jadi gakepake
app.post('/input.html', urlencodedParser, function (req, res) {
  var con = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "password",
    database: "dbinvoice"
  });
  var reply='';

  reply += req.body.stuffname;
  reply += " " + req.body.stuffprice;
  reply += " " + req.body.stuffqty;

  con.connect(function(err){
    if(err) throw err;
    console.log("masuk konek");
    var sql = "INSERT INTO Barang (nama_barang, harga_sewa, siap_sewa, total_barang) VALUES ?"; //
    var value = [
      [req.body.stuffname, parseInt(req.body.stuffprice,10), parseInt(req.body.stuffqty,10), parseInt(req.body.stuffqty,10)]
    ];
    //con.query(sql, [value], function(err, result){if(err) throw err;});
    console.log(sql);
  });
  console.log("Data Termasukkan!" + reply);


  res.sendFile('input.html' , { root : __dirname});
  //res.send('data termasukan euy!' + reply);
});

app.get('/file.html', urlencodedParser, function(err, res){
  res.sendFile('file.html', {root: __dirname});
});

app.post('/file.html', urlencodedParser, function(req, res){
  res.sendFile('file.html', {root: __dirname});
});

app.post('/invoice', urlencodedParser, function(req, res){
  //donwload file lalu kemblai
  var con = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "password",
    database: "dbinvoice"
  });

  con.connect(function(err){
    if(err) throw err;
    console.log("masuk konek");
    var sql = "SELECT * FROM Invoice"; //
    con.query(sql, function(err, result,fields){
      if(err) throw err;


      const field = [];
      const mydata = [];
      for(let i=0;i<fields.length;i++){
        field[i]=fields[i].name;
        mydata[i]=result[i];
      }
      console.log(mydata);
      const json2csvParser = new Json2csvParser({ field });
      const csv = json2csvParser.parse(mydata);
      res.send(csv);
      //console.log(result);
    });
  });

  /*
  const fieldsa = ['car', 'price', 'color'];
  const myCars = [
    {
      "car": "Audi",
      "price": 40000,
      "color": "blue"
    }, {
      "car": "BMW",
      "price": 35000,
      "color": "black"
    }, {
      "car": "Porsche",
      "price": 60000,
      "color": "green"
    }
  ];

  const json2csvParser = new Json2csvParser({ fieldsa });
  const csv = json2csvParser.parse(myCars);
  */

  //res.sendFile('file.html', {root: __dirname});
});

app.post('/gear', urlencodedParser, function(err, res){
  //donwload file lalu kembali
  res.sendFile('file.html', {root: __dirname});
});

app.post('/frequentgear', urlencodedParser, function(err, res){
  //donwload file lalu kembali
  res.sendFile('file.html', {root: __dirname});
});

app.post('/frequentdest', urlencodedParser, function(err, res){
  //donwload file lalu kembali
  res.sendFile('file.html', {root: __dirname});
});

app.post('/income', urlencodedParser, function(err, res){
  //donwload file lalu kembali
  res.sendFile('file.html', {root: __dirname});
});

app.post('/a', urlencodedParser, function (req, res){
  var reply='';
  reply += "Your name is " + req.body.name;
  reply += "<br>Your phonenumber id is " + req.body.phonenumber;
  reply += "<br>Your destination is " + req.body.destination;
  var date = new Date(req.body.rentdate);
  reply += "<br>Your rent date " + date.getHours();
  reply += "<br>Your return date " + req.body.returndate;
  reply += "<br>Your tent rent " + req.body.tent;
  reply += "<br>Your tent qty " + req.body.tent4qty;
  reply += "<br>Your tent kind " + req.body.tentkind;
  reply += "<br>Your flysheet rent " + req.body.flysheet;
  reply += "<br>Your tent flysheetqty " + req.body.flysheetqty;
  res.send(reply);
 });
//how to turn nodejs to html?

app.post('/thank', urlencodedParser, function (req, res){
  var reply='';
  reply += "Your name is " + req.body.name;
  reply += "<br>Your phonenumber id is " + req.body.phonenumber;
  reply += "<br>Your destination is " + req.body.destination;
  var date = new Date(req.body.rentdate);
  reply += "<br>Your rent date " + date.getHours();
  reply += "<br>Your return date " + req.body.returndate;
  reply += "<br>Your rent are : \n";
  var page_template = fs.readFileSync('form.html','utf-8');
  var document = new JSDOM(page_template);
  document = document;
  window = document.defaultView;
  var arrayGear = [
    [req.body.gear1, req.body.barang1],
    [req.body.gear2, req.body.barang2],
    [req.body.gear3, req.body.barang3],
    [req.body.gear4, req.body.barang4],
    [req.body.gear5, req.body.barang5],
    [req.body.gear6, req.body.barang6],
    [req.body.gear7, req.body.barang7],
  ];
  var con = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "password",
    database: "dbinvoice"
  });
  for(var i=0;i<7;i++){
    if(arrayGear[i][0]!='-'){
      for(var j=0;j<2;j++){

        con.connect(function(err){
          if(err) throw err;
          console.log("masuk konek");
          var sql = "INSERT INTO Invoice () VALUES ?"; //
          var value = [
            [req.body.stuffname, parseInt(req.body.stuffprice,10), parseInt(req.body.stuffqty,10), parseInt(req.body.stuffqty,10)]
          ];
          //con.query(sql, [value], function(err, result){if(err) throw err;});
          console.log(sql);
        });
      }
    }
  }
  res.send(reply);
 });

app.post('/inputlama', urlencodedParser, function (req, res) {
  res.send('data termasukan!');
});
