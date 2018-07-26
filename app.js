'use strict';

const Hapi = require('hapi');
const superagent = require('superagent');
const cheerio = require('cheerio')
const iconv = require('iconv-lite')
const url = require('url')
const download = require('download')
const crypto = require('crypto')
const QRCode = require('qrcode')
const Spider = require('./spider')


const model = require('./model')

function shorturl(input) {
	const md5 = crypto.createHash('md5')
	const base32 = [
	'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h',
	'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p',
	'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
	'y', 'z', '0', '1', '2', '3', '4', '5'
	];
	const hex = md5.update(input).digest('hex');
	const hexLen = hex.length;
	const subHexLen = hexLen / 8;
	const output = [];
	
	for (let i = 0; i < subHexLen; i++) {
		//把加密字符按照8位一组16进制与0x3FFFFFFF(30位1)进行位与运算
		const subHex = hex.substr(i * 8, 8);
		let int = 0x3FFFFFFF & (1 * ('0x' + subHex));
		
		let out = '';
		for (let j = 0; j < 6; j++) {
			//把得到的值与0x0000001F进行位与运算，取得字符数组chars索引
			const val = 0x0000001F & int;
			out += base32[val];
			int = int >> 5;
		}
		output.push(out);
	}
	return output[0];
}

const server = Hapi.server({
    port: 1000,
    host: 'localhost'
});


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
    path: '/link',
    handler: (request, h) => {
    	const rest = db.query('SELECT * FROM link')	
        return rest;
    }
});

server.route({
  method: 'POST',
  path: '/users',
  config: {
    plugins: {
      'hapi-io': {
        event: 'user',
        mapping: {
          headers: ['accept'],
          query: ['returnType']
        }
      }
    }
  },
  handler: function(request, reply) {
    return 1234
  }
})

server.route({
    method: 'GET',
    path: '/page',
    handler: async (request, h) => {
        //const rest = model.demo
        //console.log(rest.findAll({ limit: 10 }))
        // const data = await rest.findAll({ limit: 10 }).then(function(data){
        // 	return data
        // })
        return shorturl('12341234');
    }
});

server.route({
    method: 'post',
    path: '/api/link',
    handler: async (req, h) => {
    	const { url } = req.payload
    	const code = shorturl(url)
        const link = model.link
        await link.save(code)
        const uri = `http://dc8.in/${code}`
        const image = await QRCode.toDataURL(uri)
		  .then(img => {
		    return img
		  })
		  .catch(err => {
		    console.error(err)
		  })
		const data = {
			link: uri,
			image
		} 
        return data
    }
});

function fetch (url) {
	var self = this
	return new Promise((reslove, reject) => {
		superagent
			.get(url)
			.set(header)
			.end((err, res) => {
				err ? reject(err) : reslove(cheerio.load(res.text))
			})
	})
	.catch((err) => { console.log(err) })
}

server.route({
    method: 'POST',
    path: '/api/post',
    handler: (req, h) => {
		const { url } = req.payload
		let images = []
		if(!url) return 404
		const rest = fetch(url).then(function($){
			$('img').each(function(){
				let src = $(this).attr('src') || $(this).attr('file')
				if(src.indexOf('http') === -1){
					src = 'https:' + src;
				}
				images.push({
					url: src,
					check: false
				})
			})
			return JSON.stringify({images})
		})
		return rest
	}
});

server.route({
    method: 'POST',
    path: '/api/posts',
    handler: async (req, h) => {
		const config = req.payload
		const spider = new Spider(config)
		const rest = await spider.start()
		return rest
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