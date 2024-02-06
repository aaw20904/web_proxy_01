
const fs = require('fs');
 const net = require("net");
//https://medium.com/@nimit95/a-simple-http-https-proxy-in-node-js-4eb0444f38fc


let server = net.createServer(onConnect);

server.listen(80, ()=>console.log("Listn on 80..."));

function onConnect(clientSocket){
  let clientData = '';
  //one time listener -    We need only the data once, the starting packet
  clientSocket.once("data", (data)=>{
    
    clientData += data;
    //parsing - throws into strings
    let strings = clientData.split('\r\n');
    //extract host string
    let hostString = strings.find((x)=>/Host:/.test(x));
    //vahe of "host" header:
    let hostValue = /^Host: (.+)$/.exec(hostString);
    //the host value:
    hostValue = hostValue[1];
    //searching port:
    const portMatch = hostValue.match(/:(\d+)/);
    // If port exists, extract it; otherwise, assign default port 80
    const port = portMatch ? portMatch[1] : "443";
    //extracting host:
    const hostMatch = hostValue.match(/^([^:]+)(?::\d+)?/);
    // Extracting the matched host name
    const extractedHostName = hostMatch ? hostMatch[1] : hostValue;
    console.log(`incoming message ${Date.now().toString()}, ${extractedHostName}`);
    //connect to remote host:
   let aimServer= net.createConnection({
      host:extractedHostName,
      port:port,
    },()=>{
        //response to client - when https 
        clientSocket.write('HTTP/1.1 200 OK\r\n\n');
        // Piping the sockets
        clientSocket.pipe(aimServer);
        aimServer.pipe(clientSocket);
    })
  //let hash = Date.now().toString();
  //let msg = `HTTP/1.1 200 OK\r\nContent-Type:text/plain\r\nContent-Length:${hash.length}\r\n\r\n${hash}\r\n`;
  //clientSocket.write(msg);
  //clientSocket.end();
  })


}