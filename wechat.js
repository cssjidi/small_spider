'use strict';

const Hapi = require('hapi');
const superagent = require('superagent');
const url = require('url')
const crypto = require('crypto')

const server = Hapi.server({
    port: 1000,
    host: 'localhost'
});
const TOKEN = 'weixin'
function checkSignature(payload)
{
	const { signature, timestamp, nonce } = payload
    const token = TOKEN
    const tmpArr = [token, timestamp, nonce]
    sort(tmpArr)
    tmpStr = tmpArr.join()
    tmpStr = crypto.createHmac('sha1').update(tmpStr).digest('hex') 
    console.log(tmpStr)
    if(tmpStr == signature){
        return true;
    }else{
        return false;
    }
}

const header = {
	"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
	"Accept-Encoding": "gzip, deflate, br",
	"Accept-Language": "zh-CN,zh;q=0.8",
	"Cache-Control": "max-age=0",
	"Connection": "keep-alive",
	"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.79 Safari/537.36",
}

server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
    	const payload = req
    	const rest = db.query('SELECT * FROM link')	
        return rest;
    }
});

const init = async () => {
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();