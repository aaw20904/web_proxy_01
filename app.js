let https = require('https');
let fs = require('fs');

const sslOptions = {
    cert : fs.readFileSync('./proxy.crt'),
    key : fs.readFileSync('./proxy.key')
};

function allowBootstrapCORS(res){
  res.setHeader('Access-Control-Allow-Origin', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css'); // You may want to specify your domain instead of '*'
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function onClientRequest (req, res) {
    let info = await fs.promises.stat("notfound.html");
    allowBootstrapCORS(res);
    res.statusCode = 404;
    let jobject = JSON.stringify(req.headers);
    res.setHeader ('Content-Type','application/json');
   res.setHeader ("Content-Length", jobject.length);
   res.writeHead (404);
   res.end (jobject);
   await getResourceFromInternet(req, null);
   /* res.setHeader("Content-Length", info.size);
    res.setHeader("Content-Type", "text/html");
   
   res.writeHead(404);
   let rStream = fs.createReadStream("./notfound.html");
   rStream.pipe(res.socket);
   let data = await getResourceFromInternet(req, null);
   console.log(data);*/
   
}

async function getResourceFromInternet (request, clientSocket) {
 return new Promise((resolve, reject) => {
        let received ="";
        const options = {
          hostname: 'example.com',
          port: 443,
          path: '/',
          method: 'GET',
        }

     const req = https.request(options, (res) => {
        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);

         res.on('data', (d) => {
          received += d;
        }); 
    
        res.on ('end', ()=>{
          resolve(received)
        })

      });

      req.on('finish', ()=>{

      })

      req.on ('error', (e) => {
            throw new Error(e);
      });

      req.on ('end',()=>{
          resolve('g')
      })

       req.end(); 
        

  });

}

let proxyServer = https.createServer(sslOptions, onClientRequest);

proxyServer.listen(443, ()=>console.log("TLS listen on port 443.."));