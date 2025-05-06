let password = require("crypto").randomBytes(100).toString('hex')
var http = require("http");
http.createServer(function (clientRequest, clientResponse) {
	let p = clientRequest.url.split("/")
	if(p[1] !== password) return clientResponse.end()
	p = "/"+p.slice(2).join("/")
  var options = { 
    hostname: '127.0.0.1',
    port: 1106, 
    path: p,
    method: clientRequest.method,
		headers: clientRequest.headers
  };  

  var googleRequest = http.request(options, function(googleResponse) {
		googleResponse.pipe(clientResponse, {
			end: true
		});
		clientResponse.headers
  }); 
	clientRequest.pipe(googleRequest)
	console.log(p)
}).listen(3001)

console.log(password)