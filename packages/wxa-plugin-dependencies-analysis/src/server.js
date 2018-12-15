require("@babel/register");
const http = require('http');
const WebSocket = require('ws');
const Koa = require('koa');
const koaStatic = require('koa-static');
const app = new Koa();

export function start(stats, options = {}) {
  const {
    port = 8080
  } = options;

  app.use(koaStatic(`${__dirname}/client`));

  const server = http.createServer(app.callback());
  const wss = new WebSocket.Server({
    server
  });

  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      console.log('received: %s', message);
    });

    ws.send(JSON.stringify({ 
      event: 'treemapDataUpdated',
      data: stats
    }));
  });

  server.listen(port);
  console.log(`> DAP Treemap data is rendered on http://localhost:${port}`);

  function updateData(newStats) {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        console.log('treemapDataUpdated');
        client.send(JSON.stringify({
          event: 'treemapDataUpdated',
          data: newStats
        }));
        console.log(`> DAP New treemap data is rendered on http://localhost:${port}`);
      }
    });
  }

  return {
    server,
    updateData
  }
}