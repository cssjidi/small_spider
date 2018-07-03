


function Spider(options){
	this.config = Object.assign({}, options)
	//console.log(this.config)
}

Spider.prototype.start = function() {
	this.download()
}
Spider.prototype.list = async function() {
	console.log('list')
	let Things = [1,2,3,4,5,6]
	for (var i = Things.length - 1; i >= 0; i--) {
		this.fetch(Things[i])
	}
}
Spider.prototype.content = async function() {
	const content = await this.list()
	console.log('content')
}
Spider.prototype.download = async function() {
	const content = await this.content()
	console.log('download')
}
Spider.prototype.fetch = async function(url) {
	console.log('fetch'+url)
	return url
}

const spider = new Spider({
	baseUrl: 'http://www.baidu.com'
})
spider.start()