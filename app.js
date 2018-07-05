'use strict';

const Hapi = require('hapi');
const superagent = require('superagent');
const cheerio = require('cheerio')
const iconv = require('iconv-lite')
const url = require('url')
const download = require('download')
const db = require('./db')

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
    method: 'GET',
    path: '/page',
    handler: async (request, h) => {
        const rest = await db.query('SELECT * FROM link').then(function(data){
        	console.log(data)
        })
        console.log(rest)
        return 404;
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
				let src = $(this).attr('src')
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


const init = async () => {

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();