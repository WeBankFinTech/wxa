require("@babel/register");
const http = require('http');
const WebSocket = require('ws');
const Koa = require('koa');
const koaStatic = require('koa-static');
const app = new Koa();

async function start(options = {}) {
    const {
        port = 8080
    } = options;

    app.use(koaStatic(`${__dirname}/client`));
    
    const server = http.createServer(app.callback());
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        ws.on('message', (message) => {
            console.log('received: %s', message);
        });

        ws.send('ws message test');
    });

    server.listen(port);
    console.log(`listening on port ${port}`); 
}

// test
start();
module.exports = {
    start,
}