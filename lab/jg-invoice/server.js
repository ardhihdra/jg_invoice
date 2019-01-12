var http = require('http');
var url = require('url');
var fs = require('fs');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });
var mysql = require('mysql');
var trct = require('truncate-html');
//var json2csv = require('json2csv');
const Json2csvParser = require('json2csv').Parser;
var dateformat = require('dateformat')
var csvWriter = require('csv-write-stream')
// var popup = require('popups');
var moment = require('moment');
var jsdom = require('jsdom');
var values = require('object.values');
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
  console.log("Terhubung ke %s:%s Port", host, port);
  console.log("Buka browser kesayangan anda dan kunjungi http://localhost:8082/form.html");
});

app.get('/form.html', function (req, res) {
  console.log("ini get form");
  var con = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "password",
    database: "dbinvoice"
  });

  //gear = req.body.gear.split(' : ')[0];
  //ngear = req.body.gear.split(' : ')[1];
  //console.log($('html').html());
  var page_template = fs.readFileSync('form.html','utf-8');
  var document = new JSDOM(page_template);
  document = document;
  window = document.defaultView;
  var $ = require('jquery')(document.window);

  con.connect(function(err){
    if(err) throw err;

    var sql = "SELECT * FROM Barang";
    con.query(sql, function (err, result, fields) {
      if (err) throw err;
        //console.log(result[0].nama_barang);
        //console.log(result);
        var barangdiinput;
        var cart;
        for(var i=0;i<result.length;i++){
          barangdiinput = "<option name= '"+ result[i].nama_barang + "'>"  + result[i].nama_barang ;
          barangdiinput += " : "+ result[i].harga_sewa +"</option>\n";
          //console.log(barangdiinput);
          $(barangdiinput).appendTo('select');

          cart = "<p><a href='#'>"+result[i].nama_barang +"</a> <span class='price' name='harga"+ (i+1)+ "'>"+ result[i].harga_sewa +"</span></p>"
          $(cart).appendTo('div4');
        }
        //console.log($('html').html());
        res.send($('html').html());
      });
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

  var document = new JSDOM(pageform);
  document = document;
  window = document.defaultView;
  var $ = require('jquery')(document.window);

  con.connect(function(err){
    if(err) throw err;
    //console.log("isi body");
    //console.log(req.body.ktp);
    // -----aa
    var kirimbarang = "INSERT INTO Invoice";
    kirimbarang += "(name, email,"
            + "nomor_hp, tujuan, waktu_booking,"
            + "waktu_pengambilan, waktu_kembali,"
            + "barang1, barang2, barang3, barang4, barang5, barang6, barang7,"
            + "nbarang1, nbarang2, nbarang3, nbarang4, nbarang5, nbarang6, nbarang7,"
            + "lama_sewa, total_biaya, uang_muka, sisa, kembali, diambil, jaminan,keterangan,denda"
            + ")"
    kirimbarang += "VALUES ?";
    var taken=0;
    var now = new Date();
    var then = new Date(req.body.rentdate);
    if(now.getDate()==then.getDate() && now.getMonth()==then.getMonth() && now.getFullYear()==then.getFullYear()){
      taken = 1;
    }
    //console.log(taken);
    var value = [
      [req.body.name,req.body.email,req.body.phonenumber,req.body.destination,new Date(),new Date(req.body.rentdate),new Date(req.body.returndate),
        req.body.gear1,req.body.gear2,req.body.gear3,req.body.gear4,req.body.gear5,req.body.gear6,req.body.gear7,
        req.body.barang1,req.body.barang2,req.body.barang3,req.body.barang4,req.body.barang5,req.body.barang6,req.body.barang7,
        req.body.lamasewa,req.body.total,req.body.dp,(parseInt(req.body.total)-parseInt(req.body.dp)),0,taken,req.body.jaminan,req.body.keterangan,0]
    ];
    //console.log("barang2 nya");
    //console.log(req.body.rentdate);;
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

        $("input").on("change", function() {
          this.setAttribute(
                "data-date",
                moment(this.value, "YYYY-MM-DD")
                .format( this.getAttribute("data-date-format") )
            )
        }).trigger("change");

      res.send($('html').html());
      });
  });
});

app.post('/printinvoice', urlencodedParser, function(req,res){
  console.log("request print");
  //post bakal nerima data (data uang muka dan sisa) yang tersubmit dan dikirim dari tag html form cuk
  var con = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "password",
    database: "dbinvoice"
  });
  var pageform = fs.readFileSync('printinvoice.html','utf-8');
  //var pageform = fs.readFileSync('checkout.html','utf-8');

  var document = new JSDOM(pageform);
  document = document;
  window = document.defaultView;
  var $ = require('jquery')(document.window);
  //console.log(req.body.name);
  con.connect(function(err){
    if(err)throw err;

    con.query("SELECT *  FROM Invoice ORDER BY ID DESC LIMIT  1",function(err, result, fields){
      if(err)throw err;
	  console.log(result);
      var inv = '';
      if(result.length==0){
		var id=1;
	  }else{
		var id=parseInt(result[0].ID)+1;}
      //console.log(result);

      inv += "<div class='invoice-box'><table cellpadding='0' cellspacing='0'><tr class='top'>";
      inv += "<td colspan='2'><table><tr><td class='title'><img src='/JG.png' style='width:100%; max-width:100px;'></td>";
      inv += "<td>Invoice #"+id+"<br>Created: "+dateformat(new Date(),"fullDate")+"<br>";
      inv += "Gear rent on: "+dateformat(req.body.rentdate,"fullDate")+"<br>";
      inv += "Gear return on: "+dateformat(req.body.returndate,"fullDate")+"<br>";
      inv += "</td>";
      inv += "</tr></table></td></tr><tr class='information'><td colspan='2'><table><tr>";
      inv += "<td>CV. Jelajah Garut.<br>Jl. Ahmad Yani, Garut<br>0899-2688-000</td>";
      //divprofil
      inv += "<td>"+req.body.name+"<br>"+req.body.phonenumber+"<br>"+req.body.destination+"<br>";
      if(req.body.email!=undefined) inv +=req.body.email;
      inv+= "</td>";
      //divprofil
      inv += "</tr></table></td></tr><tr class='heading'><td>Details</td><td>#</td></tr>";
      //<divdetails>
      inv += "<tr class='details'><td> Jaminan : </td><td>"+req.body.jaminan+"</td></tr>";
      inv += "<tr class='details'><td> Lama sewa : </td><td>"+req.body.lamasewa+" hari</td></tr>";
      inv += "<tr class='details'><td> Keterangan : </td><td><i>"+req.body.keterangan+"</i></td></tr>"
      //</divdetails>
      inv += "<tr class='heading'><td>Gear</td><td>Price</td></tr>";
      //<divgear>
      //lanjut array gear
      if(req.body.gear1!="-"){
        inv += "<tr class='item'><td>";
        inv += req.body.gear1 + " ("+req.body.barang1+" set)";
        inv += "</td><td>"+req.body.harga1+"</td></tr>";
      }
      if(req.body.gear2!="-"){
        inv += "<tr class='item'><td>";
        inv += req.body.gear2+ " ("+req.body.barang2+" set)";
        inv += "</td><td>Rp."+req.body.harga2+"</td></tr>";
      }
      if(req.body.gear3!="-"){
        inv += "<tr class='item'><td>";
        inv += req.body.gear3+ " ("+req.body.barang3+" set)";
        inv += "</td><td>Rp."+req.body.harga3+"</td></tr>";
      }
      if(req.body.gear4!="-"){
        inv += "<tr class='item'><td>";
        inv += req.body.gear4+ " ("+req.body.barang4+" set)";
        inv += "</td><td>Rp."+req.body.harga4+"</td></tr>";
      }
      if(req.body.gear5!="-"){
        inv += "<tr class='item'><td>";
        inv += req.body.gear5+ " ("+req.body.barang5+" set)";
        inv += "</td><td>"+req.body.harga5+"</td></tr>";
      }
      if(req.body.gear6!="-"){
        inv += "<tr class='item'><td>";
        inv += req.body.gear6+ " ("+req.body.barang6+" set)";
        inv += "</td><td>"+req.body.harga6+"</td></tr>";
      }
      if(req.body.gear7!="-"){
        inv += "<tr class='item'><td>";
        inv += req.body.gear7+ " ("+req.body.barang7+" set)";
        inv += "</td><td>"+req.body.harga7+"</td></tr>";
      }
      inv +="<tr class='total'><td></td>";
      inv +="<td>Total: Rp."+req.body.total+"</td></tr>";
      inv +="<tr class='total'><td></td><td>Uang Muka: Rp."+req.body.dp+"</td></tr>";
      inv +="<tr class='total'><td></td><td>Sisa: Rp."+(parseInt(req.body.total)-parseInt(req.body.dp))+"</td></tr></table></div>";

      $(inv).appendTo('body');
      res.send($('html').html());
    });
  })
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
  var jaminan = [];
  var page_template = fs.readFileSync('checkout.html','utf-8');
  var document = new JSDOM(page_template);
  document = document;
  window = document.defaultView;
  var $ = require('jquery')(document.window);
  con.connect(function(err){
    if(err) throw err;
    //console.log("isi body");
    if(req.body.ktp!=undefined){jaminan.push(req.body.ktp);}
    if(req.body.sim!=undefined){jaminan.push(req.body.sim);}
    if(req.body.ktm!=undefined){jaminan.push(req.body.ktm)}
    if(req.body.kp!=undefined){jaminan.push(req.body.kp)}
    if(req.body.dll!=undefined){jaminan.push(req.body.dll)}
    //console.log(jaminan);

  //console.log(req.body.name);
    var d = new Date();
    var drnt = new Date(req.body.rentdate);
    var drtr = new Date(req.body.returndate);

    //console.log(d.getDate());
    //handle profil peminjam yang muncul
    var profil = "<label>Atas nama :</label><input type='text' class='col-50' name='name' value='"+ req.body.name + "'></input>";
    profil += "<label>Nomor HP : </label><input type='text' class='col-50' name='phonenumber' value='"+req.body.phonenumber+"'></input>";
    profil += "<label>Tujuan : </label><input type='text' class='col-50' name='destination' value='"+req.body.destination+"'></input>";
    profil += "<label>Email : </label><input type='text' class='col-50' name='email' value='"+req.body.email+"'></input>";
    profil += "<label>Tanggal Sewa : </label><input type='text' class='col-50' name='datenow' value='" + d + "'></input>";
    profil += "<label>Tanggal Pengambilan : </label><input type='text' class='col-50' name='rentdate' value='"+drnt +"'></input>";
    profil += " <label>Tanggal Pengembalian : </label><input type='text' class='col-50' name='returndate' value='"+drtr +"'></input><br>";
    //console.log(profil);
    $(profil).appendTo('div1');
////
    var a = req.body.gear1.split(" : ")[0];
    //console.log(req.body.gear4.split(" : ")[1]);
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

    //console.log(d1 + " " + m1 + " " + y1);

    var barang = '';
    for(let i=0;i<arrayGear.length;i++){
      if(arrayGear[i][0]=='-') {
        //console.log('nyettt');
        harga.push(0);
      }else{
        harga.push(arrayGear[i][1]);
      }
      //console.log("harga tes " + harga[i]*10000);
      //console.log(" gear tes " + arrayGear[i][0]);
      //console.log(d1 + " " +m1+" ");
      if(y2!=y1) {
        lamasewa = ((31-d1)) + (d2); //ini masih bug wkwkwk
      } else {
        if(m2!=m1){
          if(y1%4==0&&m1==1) {lamasewa = ((29-d1)) + (d2);}
          else if (m1==1) {lamasewa = (m2-m1-1)*30 + ((28-d1)) + (d2);}
          else if ((m1+1)%2==0) {lamasewa = (m2-m1-1)*30 +(1*(30-d1)) + (1*d2);}
          else {lamasewa = (m2-m1-1)*30 +(1*(31-d1)) + (1*d2);}
        }else {lamasewa = ((d2-d1));if(d2==d1) lamasewa = 1;}
      }
      //console.log(arrayGear[i][1]);
      //console.log(lamasewa);
      //console.log(arrayGear[i][2]);
      cost = arrayGear[i][1]*lamasewa*arrayGear[i][2];

      //harga[i] = harga[i]*lamasewa;
      barang += "<div class='row'>";
      barang += "<input type='text' class='col-50' name='gear"+(i+1)+"' value='"+arrayGear[i][0]+"'></input>";
      barang += "<input type='text' class='col-50' name='harga"+(i+1)+"' value='"+harga[i]+"'></input>";
      barang += "<input type='text' class='col-50' name='barang"+(i+1)+"' value ='"+arrayGear[i][2]+"'></input>";
      barang += "</div>";
      total += cost;
      //console.log($('html').html());
    } //for lop
    //console.log(req.body.name);
    //console.log(req.body.keterangan);
    barang += "<br><br>";
    barang += "<label>Keterangan : <input type='text' name='keterangan' value='"+req.body.keterangan+"'></input></label>";

    $(barang).appendTo('div2');

      var tagihan ="<label>Jaminan :  <input type='textnumber' name='jaminan' value ='";
      for(let y=0;y<jaminan.length;y++){
          tagihan += jaminan[y];
          if(y!=jaminan.length-1) tagihan += ",";
      }
      tagihan += "'></label>";
      tagihan += "<label >Lama sewa (hari): <input type='textnumber' name='lamasewa' value='"+lamasewa+"'></label>";
      tagihan += "<br><label>Total Tagihan Rp <input type='textnumber' name='total' value='"+ total+ "'></label>";
      //console.log($('html').html());
      $(tagihan).appendTo('div3');
      // ----

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
   var sql = "SELECT * ";
   sql += " FROM Invoice WHERE diambil=0 or kembali=0 and name!='' ORDER BY waktu_pengambilan ASC"; //
   //console.log(sql);

   con.query(sql,function(err,result,fields){
     //console.log(result);
     for(let i=0;i<result.length;i++){
       //console.log(result[i].name);
       var profil = "<div class='container'>";
       profil +=  "   <form action='/return.html' method='post' name='form1'>";
       profil +=  "     <div class='row'>";
       profil +=          "<divv class='col-50'>";
       profil +=            "<label>ID : <input name='id' value='"+result[i].ID+"'></label>";
       profil +=            "<label>Nama Penyewa : <input name='name' value='"+result[i].name+"'></label>";
       profil +=            "<label>Nomor HP : <input name='phonenumber' value='"+ result[i].nomor_hp +"'></label>";
       profil +=            "<label>Tujuan : <input name='destination' value='"+ result[i].tujuan+"'></label>";
       profil +=            "<label><i class='fa fa-date'></i>Tanggal Ambil Barang: "+ dateformat(result[i].waktu_pengambilan,"fullDate") +"</label>";
       profil +=            "<label>Sisa pembayaran : "+result[i].sisa +"</label>";
       profil +=            "<label><i class='fa fa-date'></i>Tanggal Pengembalian : "+dateformat(result[i].waktu_kembali,"fullDate")+"</label>";
       if(result[i].diambil==1) profil +=            "<label><i>BARANG SUDAH DIAMBIL "+"</i></label>";
       else profil +=            "<label> <i>BARANG BELUM DIAMBIL "+"</i></label>";
       if(result[i].kembali==1) profil +=            "<label><i> BARANG SUDAH KEMBALI "+"</i></label>";
       else profil +=            "<label><i> BARANG BELUM KEMBALI "+"</i></label>";
       profil +=            "<label>Jaminan : "+ result[i].jaminan+"</label>";
       profil +=         "</divv>";
       profil +=          "<div class='col-50'>";
       profil +=          "<h3>Gear Set</h3>";
       profil +=          "<ol class='col-50'>";
       if(result[i].barang1!="-"){
         profil +=            "<li>Gear "+ result[i].barang1 + " <br>Jumlah : "+ result[i].nbarang1 +"<br>";
         profil +=            "denda jika rusak: <input type='textnumber' name='denda' value="+result[i].denda+"> </li><br>";
       }
       if(result[i].barang2!="-"){
       profil +=            "<li>Gear "+ result[i].barang2 + " <br>Jumlah : "+ result[i].nbarang2 +"<br>";
       profil +=            "denda jika rusak: <input type='textnumber' name='denda' value="+result[i].denda+"> </li><br>";
       }
       if(result[i].barang3!="-"){
       profil +=            "<li>Gear "+ result[i].barang3 + " <br>Jumlah : "+ result[i].nbarang3 +"<br>";
       profil +=            "denda jika rusak: <input type='textnumber' name='denda' value="+result[i].denda+"> </li><br>";
     }
     if(result[i].barang4!="-"){
       profil +=            "<li>Gear "+ result[i].barang4 + " <br>Jumlah : "+ result[i].nbarang4 +"<br>";
       profil +=            "denda jika rusak: <input type='textnumber' name='denda' value="+result[i].denda+"> </li><br>";
     }
     if(result[i].barang5!="-"){
       profil +=            "<li>Gear "+ result[i].barang5 + " <br>Jumlah : "+ result[i].nbarang5 +"<br>";
       profil +=            "denda jika rusak: <input type='textnumber' name='denda' value="+result[i].denda+"> </li><br>";
     }
     if(result[i].barang6!="-"){
       profil +=            "<li>Gear "+ result[i].barang6 + " <br>Jumlah : "+ result[i].nbarang6 +"<br>";
       profil +=            "denda jika rusak: <input type='textnumber' name='denda' value="+result[i].denda+"> </li><br>";
     }
     if(result[i].barang7!="-"){
       profil +=            "<li>Gear "+ result[i].barang7 + " <br>Jumlah : "+ result[i].nbarang7 +"<br>";
       profil +=            "denda jika rusak: <input type='textnumber' name='denda' value="+result[i].denda+"> </li><br>";
     }
       profil +=          "</ol>";
       profil +=        "<label>Keterangan : <input type='text' name='keterangan' value='"+result[i].keterangan+"'>";
       profil +=        "<input type='submit' class='btn3' formaction='/updateketerangan' value='Tambahkan Keterangan'></label>"
       profil +=        "</div>";
       profil +=      "</div>";
       profil +=      "<divi>";
       profil +=        "<input type='submit' value='Konfirmasi Pengembalian' class='btn'>";
       profil +=      "</divi></form></div>";
       //console.log(profil);
       //console.log(result[i].ID);
       $(profil).appendTo("body");
       //var update = "UPDATE Invoice SET keterangan='"+req.body.keterangan+"'";
       //con.query(update,function(err){if(err) throw err;});


     } // end loop

     res.send($('html').html());
   });
 });


 //res.sendFile('return.html', { root : __dirname});
});

app.post('/updateketerangan',urlencodedParser, function(req,res){

  console.log("tambah keterangan ditambahkan");
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
    //console.log("ini denda");
    //console.log(req.body.denda);
    var set = "UPDATE Invoice SET keterangan ='"+req.body.keterangan+"' , denda="+req.body.denda;
    set += " WHERE ID = "+req.body.id+" and name ='"+req.body.name+"' and nomor_hp='"+req.body.phonenumber+"' and tujuan ='"+ req.body.destination+"'";
    //console.log(set);
    con.query(set,function(err,result,fields){
      if(err) throw err;
    });

    var sql = "SELECT * ";
    sql += " FROM Invoice WHERE diambil=0 or kembali=0 and name!='' ORDER BY waktu_pengambilan ASC"; //
    //console.log(sql);

    con.query(sql,function(err,result,fields){
      //console.log(result);
      for(let i=0;i<result.length;i++){
        //console.log(result[i].name);
        var profil = "<div class='container'>";
        profil +=  "   <form action='/return.html' method='post' name='form1'>";
        profil +=  "     <div class='row'>";
        profil +=          "<divv class='col-50'>";
        profil +=            "<label>ID : <input name='id' value='"+result[i].ID+"'></label>";
        profil +=            "<label>Nama Penyewa : <input name='name' value='"+result[i].name+"'></label>";
        profil +=            "<label>Nomor HP : <input name='phonenumber' value='"+ result[i].nomor_hp +"'></label>";
        profil +=            "<label>Tujuan : <input name='destination' value='"+ result[i].tujuan+"'></label>";
        profil +=            "<label><i class='fa fa-date'></i>Tanggal Ambil Barang: "+ dateformat(result[i].waktu_pengambilan,"fullDate") +"</label>";
        profil +=            "<label>Sisa pembayaran : "+result[i].sisa +"</label>";
        profil +=            "<label><i class='fa fa-date'></i>Tanggal Pengembalian : "+dateformat(result[i].waktu_kembali,"fullDate")+"</label>";
        if(result[i].diambil==1) profil +=            "<label><i>BARANG SUDAH DIAMBIL "+"</i></label>";
        else profil +=            "<label> <i>BARANG BELUM DIAMBIL "+"</i></label>";
        if(result[i].kembali==1) profil +=            "<label><i> BARANG SUDAH KEMBALI "+"</i></label>";
        else profil +=            "<label><i> BARANG BELUM KEMBALI "+"</i></label>";
        profil +=            "<label>Jaminan : "+ result[i].jaminan+"</label>";
        profil +=         "</divv>";
        profil +=          "<div class='col-50'>";
        profil +=          "<h3>Gear Set</h3>";
        profil +=          "<ol class='col-50'>";
        if(result[i].barang1!="-"){
          profil +=            "<li>Gear "+ result[i].barang1 + " <br>Jumlah : "+ result[i].nbarang1 +"<br>";
          profil +=            "denda jika rusak: <input type='textnumber' name='denda' value="+result[i].denda+"> </li><br>";
        }
        if(result[i].barang2!="-"){
        profil +=            "<li>Gear "+ result[i].barang2 + " <br>Jumlah : "+ result[i].nbarang2 +"<br>";
        profil +=            "denda jika rusak: <input type='textnumber' name='denda' value="+result[i].denda+"> </li><br>";
        }
        if(result[i].barang3!="-"){
        profil +=            "<li>Gear "+ result[i].barang3 + " <br>Jumlah : "+ result[i].nbarang3 +"<br>";
        profil +=            "denda jika rusak: <input type='textnumber' name='denda' value="+result[i].denda+"> </li><br>";
      }
      if(result[i].barang4!="-"){
        profil +=            "<li>Gear "+ result[i].barang4 + " <br>Jumlah : "+ result[i].nbarang4 +"<br>";
        profil +=            "denda jika rusak: <input type='textnumber' name='denda' value="+result[i].denda+"> </li><br>";
      }
      if(result[i].barang5!="-"){
        profil +=            "<li>Gear "+ result[i].barang5 + " <br>Jumlah : "+ result[i].nbarang5 +"<br>";
        profil +=            "denda jika rusak: <input type='textnumber' name='denda' value="+result[i].denda+"> </li><br>";
      }
      if(result[i].barang6!="-"){
        profil +=            "<li>Gear "+ result[i].barang6 + " <br>Jumlah : "+ result[i].nbarang6 +"<br>";
        profil +=            "denda jika rusak: <input type='textnumber' name='denda' value="+result[i].denda+"> </li><br>";
      }
      if(result[i].barang7!="-"){
        profil +=            "<li>Gear "+ result[i].barang7 + " <br>Jumlah : "+ result[i].nbarang7 +"<br>";
        profil +=            "denda jika rusak: <input type='textnumber' name='denda' value="+result[i].denda+"> </li><br>";
      }
        profil +=          "</ol>";
        profil +=        "<label>Keterangan : <input type='text' name='keterangan' value='"+result[i].keterangan+"'>";
        profil +=        "<input type='submit' class='btn3' formaction='/updateketerangan' value='Tambahkan Keterangan'></label>"
        profil +=        "</div>";
        profil +=      "</div>";
        profil +=      "<divi>";
        profil +=        "<input type='submit' value='Konfirmasi Pengembalian' class='btn'>";
        profil +=      "</divi></form></div>";
        //console.log(profil);
        //console.log(result[i].ID);
        $(profil).appendTo("body");
        //var update = "UPDATE Invoice SET keterangan='"+req.body.keterangan+"'";
        //con.query(update,function(err){if(err) throw err;});
      } // end loop

      res.send($('html').html());
    });
  });//connection
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
    //console.log(req.body.denda);
    var sum = 0;
    //sum = (req.body.denda).reduce((a, b) => parseInt(a) + parseInt(b), 0);

    var set = "UPDATE Invoice SET kembali = 1, diambil=1, denda="+req.body.denda+" ";
    set += " WHERE name ='"+req.body.name+"' and nomor_hp='"+req.body.phonenumber+"' and tujuan ='"+ req.body.destination+"'";
    con.query(set,function(err,result,fields){
      if(err) throw err;
    });

    var sql = "SELECT * ";
    sql += " FROM Invoice WHERE diambil=0 or kembali=0 and name!='' ORDER BY waktu_pengambilan ASC"; //
    //console.log(sql);

    con.query(sql,function(err,result,fields){
      //console.log(result);
      for(let i=0;i<result.length;i++){
        //console.log(result[i].name);
        var profil = "<div class='container'>";
        profil +=  "   <form action='/return.html' method='post' name='form1'>";
        profil +=  "     <div class='row'>";
        profil +=          "<divv class='col-50'>";
        profil +=            "<label>ID : <input name='id' value='"+result[i].ID+"'></label>";
        profil +=            "<label>Nama Penyewa : <input name='name' value='"+result[i].name+"'></label>";
        profil +=            "<label>Nomor HP : <input name='phonenumber' value='"+ result[i].nomor_hp +"'></label>";
        profil +=            "<label>Tujuan : <input name='destination' value='"+ result[i].tujuan+"'></label>";
        profil +=            "<label><i class='fa fa-date'></i>Tanggal Ambil Barang: "+ dateformat(result[i].waktu_pengambilan,"fullDate") +"</label>";
        profil +=            "<label>Sisa pembayaran : "+result[i].sisa +"</label>";
        profil +=            "<label><i class='fa fa-date'></i>Tanggal Pengembalian : "+dateformat(result[i].waktu_kembali,"fullDate")+"</label>";
        if(result[i].diambil==1) profil +=            "<label><i>BARANG SUDAH DIAMBIL "+"</i></label>";
        else profil +=            "<label> <i>BARANG BELUM DIAMBIL "+"</i></label>";
        if(result[i].kembali==1) profil +=            "<label><i> BARANG SUDAH KEMBALI "+"</i></label>";
        else profil +=            "<label><i> BARANG BELUM KEMBALI "+"</i></label>";
        profil +=            "<label>Jaminan : "+ result[i].jaminan+"</label>";
        profil +=         "</divv>";
        profil +=          "<div class='col-50'>";
        profil +=          "<h3>Gear Set</h3>";
        profil +=          "<ol class='col-50'>";
        if(result[i].barang1!="-"){
          profil +=            "<li>Gear "+ result[i].barang1 + " <br>Jumlah : "+ result[i].nbarang1 +"<br>";
          profil +=            "denda jika rusak: <input type='textnumber' name='denda' value="+result[i].denda+"> </li><br>";
        }
        if(result[i].barang2!="-"){
        profil +=            "<li>Gear "+ result[i].barang2 + " <br>Jumlah : "+ result[i].nbarang2 +"<br>";
        profil +=            "denda jika rusak: <input type='textnumber' name='denda' value="+result[i].denda+"> </li><br>";
        }
        if(result[i].barang3!="-"){
        profil +=            "<li>Gear "+ result[i].barang3 + " <br>Jumlah : "+ result[i].nbarang3 +"<br>";
        profil +=            "denda jika rusak: <input type='textnumber' name='denda' value="+result[i].denda+"> </li><br>";
      }
      if(result[i].barang4!="-"){
        profil +=            "<li>Gear "+ result[i].barang4 + " <br>Jumlah : "+ result[i].nbarang4 +"<br>";
        profil +=            "denda jika rusak: <input type='textnumber' name='denda' value="+result[i].denda+"> </li><br>";
      }
      if(result[i].barang5!="-"){
        profil +=            "<li>Gear "+ result[i].barang5 + " <br>Jumlah : "+ result[i].nbarang5 +"<br>";
        profil +=            "denda jika rusak: <input type='textnumber' name='denda' value="+result[i].denda+"> </li><br>";
      }
      if(result[i].barang6!="-"){
        profil +=            "<li>Gear "+ result[i].barang6 + " <br>Jumlah : "+ result[i].nbarang6 +"<br>";
        profil +=            "denda jika rusak: <input type='textnumber' name='denda' value="+result[i].denda+"> </li><br>";
      }
      if(result[i].barang7!="-"){
        profil +=            "<li>Gear "+ result[i].barang7 + " <br>Jumlah : "+ result[i].nbarang7 +"<br>";
        profil +=            "denda jika rusak: <input type='textnumber' name='denda' value="+result[i].denda+"> </li><br>";
      }
        profil +=          "</ol>";
        profil +=        "<label>Keterangan : <input type='text' name='keterangan' value='"+result[i].keterangan+"'>";
        profil +=        "<input type='submit' class='btn3' formaction='/updateketerangan' value='Tambahkan Keterangan'></label>"
        profil +=        "</div>";
        profil +=      "</div>";
        profil +=      "<divi>";
        profil +=        "<input type='submit' value='Konfirmasi Pengembalian' class='btn'>";
        profil +=      "</divi></form></div>";
        //console.log(profil);
        //console.log(result[i].ID);
        $(profil).appendTo("body");
        //var update = "UPDATE Invoice SET keterangan='"+req.body.keterangan+"'";
        //con.query(update,function(err){if(err) throw err;});
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
      //console.log(result[0].nama_barang);

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

app.post('/check_table.html', urlencodedParser, function(req, res){
  console.log("enter post stock");
  var con = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "password",
    database: "dbinvoice"
  });

  //date = extractday(date);
  //date1 = extractday(date1);
  //console.log(date[0] + " " + date[1] + " " + date[2]+ " " + date[3]+ " " + date[4] + " " + date[5]);
  var page_template = fs.readFileSync('check_table.html','utf-8');
  var document = new JSDOM(page_template);
  document = document;
  window = document.defaultView;
  var $ = require('jquery')(document.window);

  var date = new Date(req.body.rentdate);
  var date1 = new Date(req.body.returndate);
  var rentdate1 = date.getTime();
  var returndate1 = date1.getTime();
  var rnt1 = extractday(date);
  var rtr1 = extractday(date1);
  var barangdiinput;
  var cart;


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
      var rentdate = dateformat(req.body.rentdate, 'fullDate');
      var returndate = dateformat(req.body.returndate,"fullDate");
      var response = "<label> Barang : "+ gear +"</label>";
      response += "<label>Sebanyak : "+ngear +" unit </label>";
      response += "<label>Diambil pada tanggal : "+rentdate+" </label>";
      response += "<label>Dikembalikan pada tanggal : "+returndate+" </label>";
      response += "<hr><br>";
      response += "<h4> Stok JG : "+ngear+"</h4>";
      response += "<h4> Stok terpakai "+stok +"</h4>";
      response += "<h4> Stok sisa "+ (parseInt(ngear) - parseInt(stok)) +"</h4>";
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
  var barangdiinput;
  var sql = "SELECT nama_barang,total_barang FROM Barang";
  var cqsql = con.query(sql,function(err, result, fields) {
    if (err) throw err;
    //console.log(result[0].nama_barang);

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

  console.log("post barang lama");

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
  //console.log(req.body.hapus);
  con.connect(function(err){
    if(err) throw err;
    console.log("masuk konek");
    if(req.body.hapus=="1"){
      var sql = "DELETE FROM Barang WHERE nama_barang='"+gear+"' and total_barang="+ngear;
    } else {
      var sql = "UPDATE Barang SET ";
      if(req.body.ngear!='0' && req.body.ubahharga!='0'){
        sql += "total_barang="+req.body.ngear+" , harga_sewa="+req.body.ubahharga;
      }
      if(req.body.ngear!='0' && req.body.ubahharga=='0'){
        sql += "total_barang="+req.body.ngear;
      }
      if(req.body.ngear=='0' && req.body.ubahharga!='0'){
        sql += "harga_sewa="+req.body.ubahharga;
      }
      sql += " WHERE nama_barang='"+gear+"'"; //
      console.log(sql);
    }
    con.query(sql, function(err, result){if(err) throw err;});

    var sql = "SELECT nama_barang,total_barang FROM Barang";
    var cqsql = con.query(sql,function(err, result, fields) {
      if (err) throw err;
      //console.log(result[0].nama_barang);
      var barangdiinput;
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
  console.log("sent input barang");
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
    var barangdiinput;

    var sql = "SELECT nama_barang, total_barang FROM Barang";
    var cqsql = con.query(sql,function(err, result, fields) {
      if (err) throw err;
      //console.log(result[0].nama_barang);

      for(var i=0;i<result.length;i++){
        barangdiinput = "<option >"  + result[i].nama_barang + " : stok " + result[i].total_barang;
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
  console.log("post input");
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
    //console.log(sql);
  });
  console.log("Data Termasukkan!" + reply);


  res.sendFile('input.html' , { root : __dirname});
  //res.send('data termasukan euy!' + reply);
});

app.get('/broke.html',urlencodedParser, function(req,res){
  console.log("get broke");
  var con = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "password",
    database: "dbinvoice"
  });
  var page_template = fs.readFileSync('broke.html','utf-8');
  var document = new JSDOM(page_template);
  document = document;
  window = document.defaultView;
  var $ = require('jquery')(document.window);
  var barangdiinput;
  var sql = "SELECT nama_barang,total_barang FROM Barang";
  var cqsql = con.query(sql,function(err, result, fields) {
    if (err) throw err;
    //console.log(result[0].nama_barang);

      for(var i=0;i<result.length;i++){
        barangdiinput = "<option >"  + result[i].nama_barang + " : stok " + result[i].total_barang;
        barangdiinput += "</option>\n";
        //console.log(barangdiinput);
        $(barangdiinput).appendTo('select');
      }
      hasil = barangdiinput;
      res.send($('html').html());

  });

});

app.post('/broke.html',urlencodedParser, function(req,res){
  console.log("post broke");

  var con = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "password",
    database: "dbinvoice"
  });

  var page_template = fs.readFileSync('broke.html','utf-8');
  var document = new JSDOM(page_template);
  document = document;
  window = document.defaultView;
  var $ = require('jquery')(document.window);

  var gear = req.body.gear.split(" : stok ")[0];
  var ngear = req.body.gear.split(" : stok ")[1];
  //console.log(req.body.hapus);
  con.connect(function(err){
    if(err) throw err;
    if(req.body.hapus=='1'){
      var sql = "DELETE FROM Barang WHERE nama_barang='"+gear+"'";
      con.query(sql, function(err, result){if(err) throw err;});
    } else {
      var sqll = "INSERT INTO BarangRusak (nama_barang_rusak, total_barang_rusak,penyervis,tanggal_servis, keterangan,biaya,kembali) VALUES ?";
      var value = [[gear,parseInt(req.body.ngear),req.body.servis,new Date(req.body.tanggalservis),req.body.keterangan,parseInt(req.body.biaya),0]];
      console.log(sqll);
      console.log(value);
      con.query(sqll, [value], function(err, result){if(err) throw err;});
      var update="UPDATE Barang SET total_barang="+(ngear-parseInt(req.body.ngear))+" WHERE nama_barang='"+gear+"'";
      con.query(update);
    }

    var barangdiinput;
    var sql = "SELECT nama_barang,total_barang FROM Barang";
    var cqsql = con.query(sql,function(err, result, fields) {
      if (err) throw err;
      //console.log(result[0].nama_barang);a

        for(var i=0;i<result.length;i++){
          barangdiinput = "<option >"  + result[i].nama_barang + " : stok " + result[i].total_barang;
          barangdiinput += "</option>\n";
          //console.log(barangdiinput);
          $(barangdiinput).appendTo('select');
        }
        hasil = barangdiinput;
        res.send($('html').html());


    });


  });
});

app.get('/returnbroke.html',urlencodedParser,function(err,res){
  console.log("enter get return broke");

  var con = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "password",
    database: "dbinvoice"
  });
  var page_template = fs.readFileSync('returnbroke.html','utf-8');
  var document = new JSDOM(page_template);
  document = document;
  window = document.defaultView;
  var $ = require('jquery')(document.window);

  con.connect(function(err){
    if(err) throw err;
    var sql = "SELECT * ";
    sql += " FROM BarangRusak WHERE kembali=0 ORDER BY tanggal_servis ASC"; //
    //console.log(sql);

    con.query(sql,function(err,result,fields){
	  console.log("ini result");
	  console.log(result);
	  if(result!=undefined || result.length==0){
		  for(let i=0;i<result.length;i++){
			var date = dateformat(result[i].tanggal_servis,"fullDate");
			//console.log(result[i].name);
			var profil = "<div class='container'>";
			profil +=  "   <form action='/returnbroke.html' method='post' name='form1'>";
			profil +=  "     <div class='row'>";
			profil +=          "<divv class='col-50'>";
			profil +=            "<label>ID : <input name='id' value='"+result[i].ID+"'></label>";
			profil +=            "<label>Nama Barang : <input name='name' value='"+result[i].nama_barang_rusak+"'></label>";
			profil +=            "<label>Banyak Barang : <input name='ngear' value="+result[i].total_barang_rusak+"></label>";
			profil +=            "<label>Penyervis : <input name='penyervis' value='"+ result[i].penyervis+"'></label>";
			profil +=            "<label><i class='fa fa-date'></i>Tanggal Servis: "+ date  +"</label>";
			profil +=            "<label> <i>BARANG BELUM KEMBALI "+"</i></label>";
			profil +=            "<label>Keterangan : <input type='text' name='keterangan' value='"+result[i].keterangan+"'>";
			profil +=            "<input type='submit' class='btn3' formaction='/updateservis' value='Tambahkan Keterangan'></label>"
			profil +=         "</divv>";
			profil +=        "</div>";
			profil +=      "<divi>";
			profil +=      "<input type='submit' value='Konfirmasi Pengembalian' class='btn'>";
			profil +=      "</divi></form></div>";
			//console.log(profil);
			//console.log(result[i].ID);
			$(profil).appendTo("body");
			//var update = "UPDATE Invoice SET keterangan='"+req.body.keterangan+"'";
			//con.query(update,function(err){if(err) throw err;});
		  } // end loop
	  }
      res.send($('html').html());
    });
  });
});

app.post('/returnbroke.html',urlencodedParser,function(req,res){
  console.log("enter post return broke");

  var con = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "password",
    database: "dbinvoice"
  });
  var page_template = fs.readFileSync('returnbroke.html','utf-8');
  var document = new JSDOM(page_template);
  document = document;
  window = document.defaultView;
  var $ = require('jquery')(document.window);

  con.connect(function(err){
    if(err) throw err;
    con.query("UPDATE BarangRusak SET kembali=1 WHERE ID="+req.body.id);
    con.query("UPDATE Barang SET total_barang=total_barang+1 WHERE nama_barang='"+req.body.name+"'",function(err){if(err){throw err;}});

    var sql = "SELECT * ";
    sql += " FROM BarangRusak WHERE kembali=0 ORDER BY tanggal_servis ASC"; //
    //console.log(sql);

    con.query(sql,function(err,result,fields){
      //console.log(result);
      for(let i=0;i<result.length;i++){
        var date = dateformat(result[i].tanggal_servis,"fullDate");
        //console.log(result[i].name);
        var profil = "<div class='container'>";
        profil +=  "   <form action='/returnbroke.html' method='post' name='form1'>";
        profil +=  "     <div class='row'>";
        profil +=          "<divv class='col-50'>";
        profil +=            "<label>ID : <input name='id' value='"+result[i].ID+"'></label>";
        profil +=            "<label>Nama Barang : <input name='name' value='"+result[i].nama_barang_rusak+"'></label>";
        profil +=            "<label>Banyak Barang : <input name='ngear' value="+result[i].total_barang_rusak+"></label>";
        profil +=            "<label>Penyervis : <input name='penyervis' value='"+ result[i].penyervis+"'></label>";
        profil +=            "<label><i class='fa fa-date'></i>Tanggal Servis: "+ date  +"</label>";
        profil +=            "<label> <i>BARANG BELUM KEMBALI "+"</i></label>";
        profil +=            "<label>Keterangan : <input type='text' name='keterangan' value='"+result[i].keterangan+"'>";
        profil +=            "<input type='submit' class='btn3' formaction='/updateservis' value='Tambahkan Keterangan'></label>"
        profil +=         "</divv>";
        profil +=        "</div>";
        profil +=      "<divi>";
        profil +=      "<input type='submit' value='Konfirmasi Pengembalian' onclick='konfirbarang()' class='btn'>";
        profil +=      "</divi></form></div>";
        //console.log(profil);
        //console.log(result[i].ID);
        $(profil).appendTo("body");
        //var update = "UPDATE Invoice SET keterangan='"+req.body.keterangan+"'";
        //con.query(update,function(err){if(err) throw err;});
      } // end loop
      res.send($('html').html());
    });
  });
});

app.post('/updateservis',urlencodedParser,function(req,res){
  console.log("post update broke");
  var con = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "password",
    database: "dbinvoice"
  });
  var page_template = fs.readFileSync('returnbroke.html','utf-8');
  var document = new JSDOM(page_template);
  document = document;
  window = document.defaultView;
  var $ = require('jquery')(document.window);

  con.connect(function(err){
    if(err) throw err;
    con.query("UPDATE BarangRusak SET keterangan='"+req.body.keterangan+"' WHERE ID="+req.body.id);


    var sql = "SELECT * ";
    sql += " FROM BarangRusak WHERE kembali=0 ORDER BY tanggal_servis ASC"; //
    //console.log(sql);

    con.query(sql,function(err,result,fields){
      //console.log(result);
      for(let i=0;i<result.length;i++){
        var date = dateformat(result[i].tanggal_servis,"fullDate");
        //console.log(result[i].name);
        var profil = "<div class='container'>";
        profil +=  "   <form action='/returnbroke.html' method='post' name='form1'>";
        profil +=  "     <div class='row'>";
        profil +=          "<divv class='col-50'>";
        profil +=            "<label>ID : <input name='id' value='"+result[i].ID+"'></label>";
        profil +=            "<label>Nama Barang : <input name='name' value='"+result[i].nama_barang_rusak+"'></label>";
        profil +=            "<label>Banyak Barang : <input name='ngear' value="+result[i].total_barang_rusak+"></label>";
        profil +=            "<label>Penyervis : <input name='penyervis' value='"+ result[i].penyervis+"'></label>";
        profil +=            "<label><i class='fa fa-date'></i>Tanggal Servis: "+ date  +"</label>";
        profil +=            "<label> <i>BARANG BELUM KEMBALI "+"</i></label>";
        profil +=            "<label>Keterangan : <input type='text' name='keterangan' value='"+result[i].keterangan+"'>";
        profil +=            "<input type='submit' class='btn3' formaction='/updateservis' value='Tambahkan Keterangan'></label>"
        profil +=         "</divv>";
        profil +=        "</div>";
        profil +=      "<divi>";
        profil +=      "<input type='submit' value='Konfirmasi Pengembalian' class='btn'>";
        profil +=      "</divi></form></div>";
        //console.log(profil);
        //console.log(result[i].ID);
        $(profil).appendTo("body");
        //var update = "UPDATE Invoice SET keterangan='"+req.body.keterangan+"'";
        //con.query(update,function(err){if(err) throw err;});
      } // end loop
      res.send($('html').html());
    });
  });
});

app.get('/file.html', urlencodedParser, function(err, res){
  res.sendFile('file.html', {root: __dirname});
  var con = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "password",
    database: "dbinvoice"
  });

  con.connect(function(err){
  // data invoice
    var sql = "SELECT * FROM Invoice"; //
    con.query(sql, function(err, result,fields){
      if(err) throw err;

      const field = [];
      const mydata = [];
      for(let i=0;i<fields.length;i++){
        if(fields[i].name!=undefined) field[i]=fields[i].name;
        if(result[i]!=undefined) mydata[i]=values(result[i]);
      }
      //console.log(field);
      //console.log(mydata);

      var writer = csvWriter({ headers: field})
      writer.pipe(fs.createWriteStream('invoice.csv'))
      for(let i = 0; i < mydata.length; i++){
        mydata[i][5]=dateformat(mydata[i][5],"dd/mmmm/yyyy");
        mydata[i][6]=dateformat(mydata[i][6],"dd/mmmm/yyyy");
        mydata[i][4]=dateformat(mydata[i][4],"dd/mmmm/yyyy");
        writer.write(mydata[i]);
      }
      writer.end()
    });
    // data gear
    var sql = "SELECT * FROM Barang"; //
    con.query(sql, function(err, result,fields){
      if(err) throw err;

      const field = [];
      const mydata = [];
      for(let i=0;i<fields.length;i++){
        if(fields[i].name!=undefined) field[i]=fields[i].name;
        if(result[i]!=undefined) mydata[i]=values(result[i]);
      }
      //console.log(field);
      //console.log(mydata);

      var writer = csvWriter({ headers: field})
      writer.pipe(fs.createWriteStream('list_gear.csv'))
      for(let i = 0; i < mydata.length; i++){ writer.write(mydata[i]);}
      writer.end()
    });
    //kerusakan gear
    sql = "SELECT * FROM BarangRusak"; //
    con.query(sql, function(err, result,fields){
      if(err) throw err;

      const field = [];
      const mydata = [];
      for(let i=0;i<fields.length;i++){
        if(fields[i].name!=undefined) field[i]=fields[i].name;
        if(result[i]!=undefined) mydata[i]=values(result[i]);
      }
      //console.log(field);
      //console.log(mydata);

      var csvWriter = require('csv-write-stream')
      var writer = csvWriter()

      var writer = csvWriter({ headers: field})
      writer.pipe(fs.createWriteStream('kerusakan.csv'))
      for(let i = 0; i < mydata.length; i++){ writer.write(mydata[i]);}
      writer.end()
    });
    // jginvoice
    sql = "SELECT waktu_pengambilan, barang1, barang2, barang3, barang4, barang5, barang6, barang7, nbarang1, nbarang2, nbarang3, nbarang4, nbarang5, nbarang6, nbarang7, lama_sewa FROM Invoice ORDER BY waktu_pengambilan ASC" //
    con.query(sql, function(err, result,fields){
      if(err) throw err;
      const field = []
      const mydata = []
      for(let i=0;i<fields.length;i++){
        if(fields[i].name!=undefined) field[i]=fields[i].name;
        if(result[i]!=undefined) mydata[i]=values(result[i]);
      }
      //console.log(field);
      //console.log(mydata);

      var writer = csvWriter({ headers: field})
      writer.pipe(fs.createWriteStream('penyewaan_gear.csv'))
      for(let i = 0; i < mydata.length; i++){
        mydata[i][0] = dateformat(mydata[i][0],"dd/mmmm/yyyy");
        writer.write(mydata[i]);
      }
      writer.end()
    });
    //penyewa
    sql = "SELECT name,nomor_hp,email,tujuan FROM Invoice"; //
    con.query(sql, function(err, result,fields){
      if(err) throw err;

      const field = [];
      const mydata = [];
      for(let i=0;i<fields.length;i++){
        if(fields[i].name!=undefined) field[i]=fields[i].name;
        if(result[i]!=undefined) mydata[i]=values(result[i]);
      }
      //console.log(field);
      //console.log(mydata);

      var writer = csvWriter({ headers: field})
      writer.pipe(fs.createWriteStream('profil.csv'))
      for(let i = 0; i < mydata.length; i++){ writer.write(mydata[i]);}
      writer.end()
    });

    sql = "SELECT waktu_pengambilan,tujuan FROM Invoice ORDER BY waktu_pengambilan ASC"; //
    con.query(sql, function(err, result,fields){
      if(err) throw err;

      const field = [];
      const mydata = [];
      for(let i=0;i<fields.length;i++){
        if(fields[i].name!=undefined) field[i]=fields[i].name;
        if(result[i]!=undefined) mydata[i]=values(result[i]);
      }
      //console.log(field);
      //console.log(mydata);

      var writer = csvWriter({ headers: field})
      writer.pipe(fs.createWriteStream('tujuan.csv'))
      for(let i = 0; i < mydata.length; i++){
        mydata[i][0] = dateformat(mydata[i][0],"dd/mmmm/yyyy");
        writer.write(mydata[i]);
      }
      writer.end()
    });

    sql = "SELECT waktu_pengambilan,total_biaya,denda FROM Invoice ORDER BY waktu_pengambilan ASC"; //
    con.query(sql, function(err, result,fields){
      if(err) throw err;

      const field = [];
      const mydata = [];
      for(let i=0;i<fields.length;i++){
        if(fields[i].name!=undefined) field[i]=fields[i].name;
        if(result[i]!=undefined) mydata[i]=values(result[i]);
      }
      //console.log(field);
      //console.log(mydata);

      var writer = csvWriter({ headers: field})
      writer.pipe(fs.createWriteStream('pemasukan.csv'))
      for(let i = 0; i < mydata.length; i++){
        mydata[i][0] = dateformat(mydata[i][0],"dd/mmmm/yyyy");
        writer.write(mydata[i]);
      }
      writer.end()
    });
    });
});

app.post('/file.html', urlencodedParser, function(req, res){
  res.sendFile('file.html', {root: __dirname});
});

app.post('/invoice', urlencodedParser, function(req, res){
  //donwload file lalu kemblai
  res.download("invoice.csv", "invoice_gear.csv");
});

app.post('/gear', urlencodedParser, function(err, res){
  //donwload file lalu kembali
  res.download("list_gear.csv", "list_gear.csv");
});

app.post('/frequentgear', urlencodedParser, function(err, res){
  //donwload file lalu kembali
  res.download("penyewaan_gear.csv", "penyewaan_gear.csv");
});

app.post('/gearrusak', urlencodedParser, function(err, res){
  //donwload file lalu kembali
  res.download("kerusakan.csv", "list_kerusakan.csv");
});

app.post('/penyewa', urlencodedParser, function(err, res){
  //donwload file lalu kembali
  res.download("profil.csv", "profil_penyewa.csv");
});

app.post('/frequentdest', urlencodedParser, function(err, res){
  //donwload file lalu kembali
  res.download("tujuan.csv", "list_tujuan.csv");
});

app.post('/income', urlencodedParser, function(err, res){
  //donwload file lalu kembali
  res.download("pemasukan.csv", "pemasukan.csv");
});
