let https = require('https');
let fs = require('fs');

const sslOptions = {
    cert : fs.readFileSync('./proxy.crt'),
    key : fs.readFileSync('./proxy.key')
};

async function onClientRequest (req, res) {
  let info = await fs.promises.stat("notfound.html");

  res.statusCode = 404;
    res.setHeader("Content-Length", info.size);
    res.setHeader("Content-Type", "text/html");

  res.writeHead(404);
 

   
  let rStream = fs.createReadStream("./notfound.html");
   rStream.pipe(res.socket);
  
}

let proxyServer = https.createServer(sslOptions, onClientRequest);

proxyServer.listen(443, ()=>console.log("TLS listen on port 443.."));