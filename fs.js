'use strict';
//这是一个简单的应用
var path         = require('path');
var fs = require("fs") ;
var mkdirp = require('mkdirp')
global.l = console.log;
const dir = 'phot11o/asdfasf2323'
const asy = function(){
	try{
		fs.statSync(path.join(__dirname,dir))
	}catch(e){
		mkdirp.sync(path.join(__dirname,dir))
	}
	return path.join(__dirname,dir) 
}
l(asy())
