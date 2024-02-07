
const fs = require('fs');
 const net = require("net");
//https://medium.com/@nimit95/a-simple-http-https-proxy-in-node-js-4eb0444f38fc


let server = net.createServer(onConnect);

server.listen(80, ()=>console.log("Listn on 80..."));

 function onConnect(clientSocket){

 let clientData = '';
  //one time listener -    We need only the data once, the starting packet
  clientSocket.once("data", async (data)=>{
    clientData += data;
    let hostInfo = getTypeOfRequest(clientData);
    console.log(`incoming message ${Date.now().toString()}, ${hostInfo.host}`);

    //connect to the remote host:
         await connectToRemoteServer(clientData, clientSocket, hostInfo.port, hostInfo.host, hostInfo.isSecure);

        // Error event listener for clientSocket
        clientSocket.on('error', (error) => {
            console.error('clientSocket connection:', error.code);
        });

  })
   

}

async function connectToRemoteServer(rawRequest, clientSocket, port, host, isHTTPS){
  return new Promise((resolve, reject) => {
      let aimServerSocket = net.createConnection({
        host:host,
        port:port
      },()=>{
          //is it a https?
          if(isHTTPS){
            //sends 200
             clientSocket.write('HTTP/1.1 200 OK\r\n\n');
          }else{
            //write a raw request to a server
             clientSocket.write(rawRequest);
          }
          //pipe each other
            clientSocket.pipe(aimServerSocket);
          aimServerSocket.pipe(clientSocket);
      });

      aimServerSocket.on("error",(error)=>{
        console.error('Error with aimServer connection:', error.code);
            //cheking-has a site not been found?
            let msg404 = `<!DOCTYPE html>
            <head>
             <meta charset="UTF-8">
              <style>
              body{
                background-color:burlywood;
              }
              h2{
                color:darkred;
              }
              h4{
                color:#303030;
              }
              .wrapper{
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: flex-start;
                padding:3vw;
              }
              </style>
            </head>
            <body>
            <div class="wrapper">
            <h2>Page Not Found!</h2>
            <h4>Myproxyserver (R)  ${new Date().toUTCString()}</h4>
            </div>
            </body>
            </html>`;
            if (error.errno === -3008){
              let msg = `HTTP/1.1 404 Not Found\r\nContent-Type:text/html\r\nContent-Length:${msg404.length}\r\n\r\n${msg404}\r\n`;
              clientSocket.write(msg);
              clientSocket.end();
              aimServerSocket.end();
            }else{
              resolve();
            }
      })

      clientSocket.on("end",()=>{
        resolve();
      })
  });
}

function getTypeOfRequest (rawRequest) {
     //parsing - throws into strings
    let strings = rawRequest.split('\r\n');
    //is it a "GET" (http) or a "CONNECT" (https) query?
    let isHTTPS = strings.find((x)=>/CONNECT /.test(x));
    let isHTTP = strings.find((x)=>/GET /.test(x));
    //extract host string
    let hostString = strings.find((x)=>/Host:/.test(x));
    //vahe of "host" header:
    let hostValue = /^Host: (.+)$/.exec(hostString);
    //the host value:
    hostValue = hostValue[1];
    //searching port:
    const portMatch = hostValue.match(/:(\d+)/);
    // If port exists, extract it; otherwise, assign default port 80
    const port = portMatch ? portMatch[1] : "80";
    //extracting host:
    const hostMatch = hostValue.match(/^([^:]+)(?::\d+)?/);
    // Extracting the matched host name
    const extractedHostName = hostMatch ? hostMatch[1] : hostValue;
    return { port, host:extractedHostName, isSecure:Boolean(isHTTPS)}
}