const tls = require("tls");
const fs = require("fs");


const sslOptions = {
    cert : fs.readFileSync('./proxy.crt'),
    key : fs.readFileSync('./proxy.key'),
    rejectUnauthorized: false,
};



function readOrUpdateHostFromReq (rawReq, newHost=null) {
  const matched = rawReq.match(/^(Host:\s*([^\n\r]*))/im);

  if(matched){
    //remove white spaces, trailing lines
    let oldHost = matched[2].trim();
     if (newHost) {
      const modifiedRequest = rawReq.replace( new RegExp(`^(Host:\\s*)${oldHost}`, 'im'),
      `$1${newHost}`);
      return {rawRequest:modifiedRequest,host:newHost}
     } else {
          return {rawRequest:rawReq,host: oldHost };
     }

  }
}

 function getResourceFromInternet (host, rawHttpRequest, clientSocket) {
  options={
    rejectUnauthorized: false,
  }
  const requestedSocket = tls.connect(443, host, options, ()=>{
    console.log("Established!");
    //pipe readable part-  to sending respone to the client mashine
    requestedSocket.pipe(clientSocket);
    //send request
    requestedSocket.write(rawHttpRequest);
    //full duplex connection to client mashine - for ability additional requests, when it will be need
    clientSocket.pipe(requestedSocket); 
  })

  requestedSocket.on("error",(e)=>{
    let textMessage = e.stack;
    let size = textMessage.length;
    let failResponse = `HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\nContent-Length: ${size}\r\n\r\n${textMessage}\r\n`;
    clientSocket.write(failResponse);
  })
 
 }
 
/*
async function onClientRequest (socket) {
          socket.setEncoding('utf8'); // Set encoding to handle text data
           let request='';
          socket.on('data', chunk=>{

            request += chunk; 
            let results = readOrUpdateHostFromReq(request,newHost="yahoo.com");

            getResourceFromInternet(results.host,results.rawRequest, socket);
            //const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${results.rawRequest.length}\r\n\r\n${results.rawRequest}\r\n`;
           // socket.write(response);
             
          });

          socket.on('end', ()=>{
           console.log(` ${new Date().toLocaleTimeString()}, socket closed!`);
             
          })

          socket.on("error",(e)=>{
            let textMessage =`Error:${e.stack}`; 
            let size = textMessage.length;
            let failResponse = `HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\nContent-Length: ${size}\r\n\r\n${textMessage}\r\n`;
            console.log(e.stack);
            socket.write(failResponse);
          })
                


 // Line break after the content (\r\n)
}



let proxyServer = tls.createServer(sslOptions, onClientRequest)
proxyServer.listen(443, ()=>console.log("TLS listen on port 443.."));

*/


async function onClientRequest(socket) {
  socket.setEncoding('utf8'); // Set encoding to handle text data
  let request = '';

  socket.on('data', (chunk) => {
    request += chunk;
    let results = readOrUpdateHostFromReq(request);

    getResourceFromInternet(results.host, results.rawRequest, socket);
    // const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${results.rawRequest.length}\r\n\r\n${results.rawRequest}\r\n`;
    // socket.write(response);
  });

  socket.on('end', () => {
    console.log(`${new Date().toLocaleTimeString()}, socket closed!`);
  });

  socket.on("error", (e) => {
    let textMessage = `Error: ${e.stack}`;
    let size = textMessage.length;
    let failResponse = `HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\nContent-Length: ${size}\r\n\r\n${textMessage}\r\n`;
    console.log(e.stack);
    socket.write(failResponse);
  });
}

let proxyServer = tls.createServer(sslOptions, onClientRequest);

proxyServer.on('error', (err) => {
  console.error(`TLS server error: ${err.message}`);
});

proxyServer.listen(443, () => console.log("TLS listen on port 443.."));

