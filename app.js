const https = require('https');
const fs = require('fs');

// Read the SSL certificate and private key
const sslOptions = {
  cert: fs.readFileSync('cert.pem'),
  key: fs.readFileSync('cert-key.pem'),
  rejectUnauthorized: false
};

function onClientRequest(req, res) {
  const { method, url, headers } = req;

  const matched = headers.host;
  const host = matched ? matched.trim() : null;

  const requestOptions = {
    method: method,
    path: url,
    host: host,
    headers: headers,
  };

  const proxyRequest = https.get(requestOptions, (proxyResponse) => {
    // Forward the headers from the remote server to the client
    res.writeHead(proxyResponse.statusCode, proxyResponse.headers);

    // Pipe the proxy response to the client response
    proxyResponse.pipe(res, { end: true });
  });

  proxyRequest.on('error', (e) => {
    console.error('Error connecting to the server:', e.message);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Error connecting to the server: ${e.message}`);
  });
}

const proxyServer = https.createServer(sslOptions, onClientRequest);

proxyServer.on('error', (err) => {
  console.error(`HTTPS server error: ${err.message}`);
});

proxyServer.listen(443, () => console.log('HTTPS proxy server is listening on port 443'));
