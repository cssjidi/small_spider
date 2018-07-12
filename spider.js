const cheerio = require('cheerio')
const superagent = require('superagent');
require('superagent-charset')(superagent)
const path = require('path')
const download = require('download')
const url = require('url')
const iconv = require('iconv-lite')
const mkdirp = require('mkdirp');

const header = {
	"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
	"Accept-Encoding": "gzip, deflate, br",
	"Accept-Language": "zh-CN,zh;q=0.8",
	"Cache-Control": "max-age=0",
	"Connection": "keep-alive",
	"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.79 Safari/537.36",
}

//爬虫类
function Spider(options){
	this.config = Object.assign({}, options, {
		chartset: 'utf-8'
	})
	this.url = options.pageUrl
	//this.pages = []
	// for (let i = options.start;i <= options.end;i++) {
	// 	this.pages.push(this.url.replace('%%',i))
	// }
	this.images = {}
	//this.contentUrl = []
	this.article = {}
}
//开始爬取
Spider.prototype.start = async function() {
	this.init()
}
//自动载入下载图片
Spider.prototype.init = async function() {
	//this.dowloadImage()
	this.pages = []
	if(this.config.start){
		for (let i = this.config.start;i <= this.config.end;i++) {
			this.pages.push(this.url.replace('%%',i))
		}
	}else{
		this.pages.push(this.url)
	}
	return this.pages
}
//获取分页列表
Spider.prototype.getPostList = async function() {
	const self = this
	for (let i = 0; i < this.pages.length; i++) {
		await this.fetch(this.pages[i]).then(function($) {
			$(self.config.pageSelector).each(function() {
				let href = $(this).attr('href')
				if(href){
					if(href.indexOf('http')===-1 && href){
						href = url.resolve(self.config.baseUrl,href)
						self.contentUrl.push(href)
					}else{
						self.contentUrl.push(href)
					}
				}
				
			})
		})
	}
	return {
		success: true,
		list: this.contentUrl
	}
}
//获取分页的内容
Spider.prototype.getPostByPaging = async function(list) {
	let imageUrl = []
	const self = this
	if(list instanceof Object){
		for(let key in list) {
			const page = list[key].page
			for (let i = 0; i < page.length; i++) {
				//console.log('69:'+page[i])
				const imageArray = []
				await this.fetch(page[i]).then(function($) {
					$(self.config.imageSelector).each(function() {
						const href = url.resolve(self.config.baseUrl,$(this).attr('src'))
						imageArray.push(href)
						imageUrl.push(href)
					})
				})
				self.article[key].image = imageArray
			}
			
		}
	}else{
		for (let i = 0; i < list.length; i++) {
			await this.fetch(list[i]).then(function($) {
				$(self.config.imageSelector).each(function() {
					imageUrl.push(url.resolve(self.config.baseUrl,$(this).attr('src')))
				})
			})
		}
	}
	//console.log(imageUrl)
	return imageUrl
}
Spider.prototype.fetchPost = async function(uri) {
	const self = this
	this.contentUrl = []
	await this.fetch(uri).then(function($) {
		$(self.config.pageSelector).each(function() {
			let href = $(this).attr('href')

			if(href){
				if(href.indexOf('http')===-1 && href){
					href = url.resolve(self.config.baseUrl,href)
					self.contentUrl.push(href)
				}else{
					self.contentUrl.push(href)
				}
			}
			
		})
	})
	//console.log('spider:'+this.contentUrl)
	//if(this.contentUrl.length === 0) return
	return this.contentUrl
}
Spider.prototype.fetchImage = async function(uri){
	let title = ''
	let content = ''
	let imageUrl = []
	let isPage = false
	const self = this
	let postPageImage = []
	let postPageUrl = []
	let postPage = {}
	this.article = []
	await this.fetch(uri).then(function($) {
		isPage = $(self.config.isPage) ? true : false
		title = $(self.config.title).text()
		content = $(self.config.content).html()
		imageUrl = []
		console.log(self.config.image)
		$(self.config.image).each(function() {
			imageUrl.push(url.resolve(self.config.baseUrl,$(this).attr('src')))
		})
		console.log(`正在采集${uri}`)
		postPageImage = imageUrl
		if($(self.config.isPage)){
			$(self.config.contentPage).each(function(index){
				if(index > 0){
					const href = url.resolve(self.config.baseUrl,$(this).attr('href'))
					//console.log(postPageUrl.indexOf(href))
					postPageUrl.indexOf(href) === -1 && postPageUrl.push(href)
				}

			})
		}
		//console.log(postPageImage)
		// postPage[uri] = {
		// 	page: postPageUrl
		// }
		// const article = {
		// 	title,
		// 	content,
		// 	image: postPageImage
		// }
		self.article.push({
			title,
			content,
			image: postPageImage
		})
	}).catch(function(err){
		console.log('140 error:'+err)
	})
	// if(this.config.isPage){
	// 	await this.getPostByPaging(postPage)
	// }
	return this.article
}
Spider.prototype.fetchPostImage = async function(uri){
	console.log(url)
	let title = ''
	let content = ''
	let imageUrl = []
	let isPage = false
	const self = this
	let postPageImage = []
	let postPageUrl = []
	let postPage = {}
	await this.fetch(uri).then(function($) {
		isPage = $(self.config.isPage) ? true : false
		title = $(self.config.title).text()
		content = $(self.config.content).html()
		imageUrl = []
		console.log(self.config.image)
		$(self.config.image).each(function() {
			imageUrl.push(url.resolve(self.config.baseUrl,$(this).attr('src')))
		})
		console.log(`正在采集${uri}`)
		postPageImage = imageUrl
		if($(self.config.isPage)){
			$(self.config.contentPage).each(function(index){
				if(index > 0){
					const href = url.resolve(self.config.baseUrl,$(this).attr('href'))
					//console.log(postPageUrl.indexOf(href))
					postPageUrl.indexOf(href) === -1 && postPageUrl.push(href)
				}

			})
		}
		postPage[uri] = {
			page: postPageUrl
		}
		self.article[uri] = {
			title,
			content,
			image: postPageImage
		}
	}).catch(function(err){
		console.log('140 error:'+err)
	})
	if(this.config.isPage){
		await this.getPostByPaging(postPage)
	}
	return {
		data: this.article,
		images: this.images
	}
}
//获取详情
Spider.prototype.getPost = async function(){
	const page = await this.getPostList()
	let title = ''
	let content = ''
	let imageUrl = []
	let isPage = false
	const { list } = page
	const self = this
	let postPageImage = []
	let postPageUrl = []
	let postPage = {}
	for (let i = 0; i < list.length; i++) {
		await this.fetch(list[i]).then(function($) {
			isPage = $(self.config.isPage) ? true : false
			title = $(self.config.title).text()
			content = $(self.config.content).html()
			imageUrl = []
			$(self.config.image).each(function() {
				imageUrl.push(url.resolve(self.config.baseUrl,$(this).attr('src')))
			})
			console.log(`正在采集${list[i]}`)
			postPageImage = imageUrl
			if($(self.config.isPage)){
				$(self.config.contentPage).each(function(index){
					if(index > 0){
						const href = url.resolve(self.config.baseUrl,$(this).attr('href'))
						//console.log(postPageUrl.indexOf(href))
						postPageUrl.indexOf(href) === -1 && postPageUrl.push(href)
					}

				})
			}
			postPage[list[i]] = {
				page: postPageUrl
			}
			self.article[list[i]] = {
				title,
				content,
				image: postPageImage
			}
		}).catch(function(err){
			console.log('140 error:'+err)
		})
	}
	if(this.config.isPage){
		await this.getPostByPaging(postPage)
	}
	return {
		data: this.article,
		images: this.images
	}
}
//获取所有图片地址
Spider.prototype.getImage = async function() {
	const page = await this.getPost()
	let imageUrl = []
	const { data } = page
	const self = this
	for (let i = 0; i < data.length; i++) {
		await this.fetch(data[i]).then(function($) {
			const title =  $(self.config.title).text()
			$(self.config.image).each(function() {
				imageUrl.push($(this).attr('src'))
			})
			self.images[data[i]] = {
				title,
				url: imageUrl
			}
		}).catch((err) => console.log('getImage is error:'+err))
	}
	console.log(this.images)
	return this.images
}
Spider.prototype.downloadImage = async function(title,image){
	console.log(image)
    Promise.all(image.map(function(img,index){
    	const directory = 'photos/'+title;
		mkdirp(directory, function (err) {
		    if (err) console.error(err)
		    console.log(img)
		    download(img, directory).then(function(data){
		    	console.log(`${directory}下载完成`)
		    })
		});
	}))
	return true
}
//下载图片
Spider.prototype.downloadImage_old = async function() {
	let content 
	if(this.config.isPage) {
		content = await this.getImage()
	}else {
		content = await this.getPost()
	}
	const { data } = content
	console.log(data)
	for(let key in data) {  
	    Promise.all(data[key].image.map(x => download(x, 'pic'))).then(() => {
			console.log(data[key].title+'下载完成');
		})
	}
}
//http函数
Spider.prototype.fetch = async function(url) {
	const self = this
	return new Promise((reslove, reject) => {
		superagent
			.get(url)
			.charset(self.config.charset)
			.set(header)
			.end((err, res) =>  err ? reject(err) : reslove(cheerio.load(res.text)))
	})
	.catch((err) => { console.log(err) })
}

Spider.prototype.corvert = async function(str){
	const buf = new Buffer(str, this.config.chartset);
	buf.write(str, this.config.chartset);
	str = buf.toString(this.config.chartset);
	///iconv.decode(buf);
	return str
}

module.exports = Spider

/*
const spider = new Spider({
	baseUrl: 'http://www.jpmsg.com/',
	pageUrl: 'http://www.jpmsg.com/meinv/nzmt_%%.html',
	start: 199,
	end:199,
	chartset:'gb2312',
	pageSelector: '.presently_li>a',
	title: '.bttitke h2',
	content: '#MyContent',
	image: '#MyContent img',
	isPage: false,
	contentPage: null
})
spider.start()
*/
