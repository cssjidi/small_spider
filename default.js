const cheerio = require('cheerio')
const superagent = require('superagent');
const path = require('path')
const download = require('download')
const url = require('url')

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
	this.config = Object.assign({}, options)
	this.url = options.pageUrl
	this.pages = []
	for (let i = options.start;i <= options.end;i++) {
		this.pages.push(this.url.replace('%%',i))
	}
	this.images = {}
	this.contentUrl = []
	this.article = {}
}
//开始爬取
Spider.prototype.start = function() {
	this.init()
}
//自动载入下载图片
Spider.prototype.init = function() {
	//this.dowloadImage()
	this.getPost()
}
//获取分页列表
Spider.prototype.getPageList = async function() {
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
		list: self.contentUrl
	}
}
//获取内容，无分页的情况
Spider.prototype.getContent = async function() {
	const page = await this.getPageList()
	let title = ''
	let content = ''
	let imageUrl = []
	const { list } = page
	const self = this
	for (let i = 0; i < list.length; i++) {
		await this.fetch(list[i]).then(function($) {
			title = $(self.config.contentSelector.title).text()
			content = $(self.config.contentSelector.content).html()
			imageUrl = []
			$(self.config.contentSelector.image).each(function() {
				imageUrl.push($(this).attr('src'))
			})
			console.log('正在采集:'+title)
			self.article[list[i]] = {
				title,
				content,
				image: imageUrl
			}
			self.images[list[i]] = {
				title,
				url: imageUrl
			}
		})
	}
	return {
		success: true,
		data: this.article,
		images: this.images
	}
}
//获取图片内容，有分页的情况
Spider.prototype.getImageContent = async function() {
	const page = await this.getPageList()
	let imagePageUrl = []
	const { list } = page
	const self = this
	for (let i = 0; i < list.length; i++) {
		await this.fetch(list[i]).then(function($) {
			if($(self.config.imagePage)){
				$(self.config.imagePage).each(function() {
					//console.log('正在采集:'+$(self.contentSelector.title).text())
					if($(this).attr('href')){
						imagePageUrl.push(url.resolve(self.config.baseUrl, $(this).attr('href')))
					}
				})
			}
		}).catch((err) => console.log(`第${i+1}页采集错误`))
	}
	return {
		success: true,
		data: imagePageUrl,
	}
}
//获取分页的内容
Spider.prototype.getSubPost = async function(list) {
	let imageUrl = []
	const self = this
	for (let i = 0; i < list.length; i++) {
		await this.fetch(list[i]).then(function($) {
			$(self.config.imageSelector).each(function() {
				console.log($(this).attr('src'))
				imageUrl.push($(this).attr('src'))
			})
		})
	}
	console.log(imageUrl)
	return imageUrl
}
//获取详情
Spider.prototype.getPost = async function(){
	const page = await this.getPageList()
	let title = ''
	let content = ''
	let imageUrl = []
	let isPage = false
	const { list } = page
	const self = this
	for (let i = 0; i < list.length; i++) {
		await this.fetch(list[i]).then(function($) {
			isPage = $(self.config.imagePage) ? true : false
			title = $(self.config.contentSelector.title).text()
			content = $(self.config.contentSelector.content).html()
			imageUrl = []
			$(self.config.contentSelector.image).each(function() {
				imageUrl.push($(this).attr('src'))
			})
			console.log('正在采集:'+title)
			let postPageImage = imageUrl
			if($(self.config.imagePage)){
				let subPageUrl = []
				$(self.config.imagePage).each(function(index){
					if(index > 0){
						subPageUrl.push(url.resolve(self.config.baseUrl,$(this).attr('href')))
					}
				})
				const subPage = self.getSubPost(subPageUrl)
				console.log('subPage'+subPage)
				postPageImage = imageUrl.concat(subPage)
			}
			self.article[list[i]] = {
				title,
				content,
				image: postPageImage
			}
		})
	}
	consooe.log(this.article)
	return {
		success: true,
		data: this.article,
		images: this.images
	}
}
//获取所有图片地址
Spider.prototype.getImages = async function() {
	const page = await this.getPost()
	let imageUrl = []
	const { data } = page
	const self = this
	for (let i = 0; i < data.length; i++) {
		await this.fetch(data[i]).then(function($) {
			const title =  $(self.config.contentSelector.title).text()
			console.log()
			$(self.config.imageSelector).each(function() {
				imageUrl.push($(this).attr('src'))
			})
			self.images[data[i]] = {
				title,
				url: imageUrl
			}
		}).catch((err) => console.log('129 line error:'+err))
	}
	console.log(this.images)
	return {
		success: true,
		images: this.images
	}
}
//下载图片
Spider.prototype.dowloadImage = async function() {
	const content = await this.getImages()
	const { images } = content
	for(let key in images) {  
	    Promise.all(images[key].url.map(x => download(x, 'pic'))).then(() => {
			console.log(images[key].title+'下载完成');
		});
	};  
}
//http函数
Spider.prototype.fetch = async function(url) {
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


const spider = new Spider({
	baseUrl: 'http://pic.people.com.cn/GB/159992/',
	pageUrl: 'http://pic.people.com.cn/GB/159992/index%%.html',
	start: 1,
	end:2,
	pageSelector: '.img_box a',
	contentSelector:{
		title: '.title',
		content: '#main_content',
		image:'#main_content img'
	},
	imagePage: '.zdfy a',
	imageSelector: '#picG .a_right+img'
})
spider.start()

