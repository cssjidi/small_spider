var express = require('express');
var bodyParser=require('body-parser');
var app = express();
var ejs = require('ejs');
var superagent = require('superagent');
var jsonParser = bodyParser.json()
var cheerio = require('cheerio')
var iconv = require('iconv-lite')
var url = require('url')
var download = require('download')
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var header = {
	"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
	"Accept-Encoding": "gzip, deflate, br",
	"Accept-Language": "zh-CN,zh;q=0.8",
	"Cache-Control": "max-age=0",
	"Connection": "keep-alive",
	"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.79 Safari/537.36",
}
app.use('/static', express.static('static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('views', __dirname + '/views');
app.engine('ejs', ejs.__express);
app.set('view engine', 'ejs');

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

app.get('/', function (req, res) {
	res.render('index'); 
});

app.post('/api/saveImage', urlencodedParser, function(req, res){
	const { images, savePath } = req.body
	Promise.all(images.map(x => download(x, savePath))).then(() => {
	    console.log('files downloaded!');
	    res.writeHead(200, {'Content-Type': 'application/json'});
  		res.end(JSON.stringify({success: 0}));
	});
})

app.post('/api/post',urlencodedParser, function (req, res) {
	const { url } = req.body
	console.log(req.body, req.params,req.query)
	var images = []
	if(!url) res.send(404)
	fetch(url).then(function($){
		$('img').each(function(){
			var src = $(this).attr('src')
			if(src.indexOf('http') === -1){
				src = 'https:' + src;
			}
			images.push({
				url: src,
				check: false
			})
		})
		// res.send({
		// 	images
		// }); 
		//res.sendfile('image.html',{images:images}); 
		//res.send(images)
		//console.log(data)
		//res.send(data)
		res.writeHead(200, {'Content-Type': 'application/json'});
  		res.end(JSON.stringify({images}));
	})
});

var server = app.listen(1000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});