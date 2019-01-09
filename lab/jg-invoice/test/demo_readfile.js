var http = require('http');
var fs = require('fs');
var formidable = require('formidable');

http.createServer(function(req,res){
  fs.readFile('demofile1.html',function(err,data){
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });

  fs.appendFile('mynewfile1.txt','Assalamualaikum!', function(err){
    if(err) throw err;
    console.log('Created!');
  });

  fs.open('mynewfile2.txt', 'w', function(err,file){
    if(err) throw err;
    console.log('Saved!');
  });
  //create file also
  fs.writeFile('mynewfile3.txt', 'Hello content!', function(err){
    if(err) throw err;
    console.log('Saved!');
  });

  //update file
  fs.appendFile('mynewfile1.txt', 'Assalamualaikum, this is my text.', function(err){
    if(err) throw err;
    console.log('Updated!');
  });

  //replace the Content
  fs.writeFile('mynewfile3.txt', 'This is my text', function(err){
    if(err) throw err;
    console.log('Replaced!');
  });
  //delete file
  fs.unlink('mynewfile2.txt', function(err){
    if(err) throw err;
    console.log('Deleted!');
  });

  fs.rename('mynewfile1.txt', 'myrenamedfile.txt', function(err){
    if (err) throw err;
    console.log('File Renamed!');
  });

}).listen(8080);
