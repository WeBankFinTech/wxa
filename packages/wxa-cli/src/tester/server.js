import http from 'http';
import url from 'url';

export default class Server {
    constructor({port}, logger) {
        this.port = port;
        this.postQueue = new Map;
        this.logger = logger;
    }

    post(url, callback) {
        this.postQueue.set(url, callback);
    }

    start() {
        this.$server = http.createServer();

        this.$server.on('request', (request, response)=>{
            // only support post request;
            if (request.method.toUpperCase() !== 'POST') return;
            let url = request.url;
            let body = '';

            let shouldRecord = this.postQueue.has(url);

            request.on('data', (chunk)=>{
                if (shouldRecord) body += chunk;
            });

            request.on('end', async ()=>{
                if (!shouldRecord) return;

                try {
                    await this.postQueue.get(url)(JSON.parse(body));
                    response.writeHead(200, {'content-Type': 'application/json'});
                    response.end(JSON.stringify({code: 0, msg: '处理成功'}));
                } catch (e) {
                    this.logger.error(e);
                    response.writeHead(200, {'content-Type': 'application/json'});
                    response.end(JSON.stringify({code: -1, msg: 'json数据有误'}));
                }
            });
        });

        this.$server.listen(this.port, '127.0.0.1', ()=>{
            this.logger.info('server start listenning: ' + '127.0.0.1:' + this.port);
        });
    }
}
