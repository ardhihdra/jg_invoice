var http = require('http');
var dt = require('./myfirstmodule')

http.createServer(function (req, res) {
  console.log('assalamualaikum');
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write("The date and time are currently: "+ dt.myDateTime()+ "\n");
  res.end('Hello World!');
}).listen(8080);
