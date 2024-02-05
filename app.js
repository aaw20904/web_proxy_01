
const fs = require('fs');
 const net = require("net");
//https://medium.com/@nimit95/a-simple-http-https-proxy-in-node-js-4eb0444f38fc


let server = net.createServer(onConnect);

server.listen(80, ()=>console.log("Listn on 80..."));

function onConnect(socket){
  let clientData = '';
  socket.on("data", (data)=>{
    clientData += data;
    let strings = clientData.split('\r\n');
    let hostString = strings.find((x)=>/Host:/.test(x));
    let hostValue = /^Host: (.+)$/.exec(hostString);
    hostValue = hostValue[1];
    //connect to remote host:
    console.log(`incoming...${Date.now()}`);
    //
    net.createConnection(
  let hash = Date.now().toString();
  let msg = `HTTP/1.1 200 OK\r\nContent-Type:text/plain\r\nContent-Length:${hash.length}\r\n\r\n${hash}\r\n`;
  socket.write(msg);
  socket.end();
  })


}