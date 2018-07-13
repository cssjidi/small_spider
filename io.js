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
const IO = require('hapi-io')
const server = Hapi.server({
    port: 1000,
    host: 'localhost'
});
server.route([
	{
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
	}
]);

const init = async () => {
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();