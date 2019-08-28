const http = require('http');
const net = require('net');
const url = require('url');

// Create an HTTP tunneling proxy
const proxy = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({code: 0}));
});
proxy.on('request', (req, cltSocket, head) => {
    // connect to an origin server
    debugger;
    let body ='';
    const srvUrl = url.parse(`http://${req.url}`);
    req.on('data', function(chunk) {
        body += chunk;
        console.log(body);
    });

    req.on('end', function() {
        debugger;
    });
});

// now that proxy is running
proxy.listen(1337, '127.0.0.1', () => {
    const postData = {name: 123, arr: [123]};
    // make a request to a tunneling proxy
    const options = {
        port: 1337,
        host: '127.0.0.1',
        method: 'POST',
        path: '/record',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    };

    const req = http.request(options, (res)=>{
        console.log(res.statusCode, res.statusMessage);
    });

    req.on('error', console.error.bind(console));

    req.write(JSON.stringify(postData));
    req.end();
});
