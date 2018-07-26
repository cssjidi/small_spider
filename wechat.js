'use strict';
const express = require('express');
const app = express();
const crypto = require('crypto')
const wechat = require('wechat');
const WechatAPI = require('wechat-api');

const api = new WechatAPI('wxc98afaaa54715ddc', '79fa3f304aa233f866c997dcba81fa1c');

const config = {
  token: 'wechat',
  appid: 'wxc98afaaa54715ddc',
  encodingAESKey: 'bjPGbhD3mpQJqCbZNKTkPcTq7j529PerxgLwy41KI5u',
  checkSignature: false // 可选，默认为true。由于微信公众平台接口调试工具在明文模式下不发送签名，所以如要使用该测试工具，请将其设置为false
};

api.createMenu({
	 "button":[
	   {
	     "type":"click",
	     "name":"今日歌曲",
	     "key":"V1001_TODAY_MUSIC"
	   },
	   {
	     "name":"菜单",
	     "sub_button":[
	       {
	         "type":"view",
	         "name":"搜索",
	         "url":"http://www.soso.com/"
	       },
	       {
	         "type":"click",
	         "name":"赞一下我们",
	         "key":"V1001_GOOD"
	       }]
	   }
	 ]
	}, function(data){
		console.log(data)
	});

app.use(express.query());
app.use('/', wechat(config, function (req, res, next) {
  // 微信输入信息都在req.weixin上
  var message = req.weixin;
	
  if (message.FromUserName === 'diaosi') {
    // 回复屌丝(普通回复)
    res.reply('hehe');
  } else if (message.FromUserName === 'text') {
    //你也可以这样回复text类型的信息
    res.reply({
      content: 'text object',
      type: 'text'
    });
  } else if (message.FromUserName === 'hehe') {
    // 回复一段音乐
    res.reply({
      type: "music",
      content: {
        title: "来段音乐吧",
        description: "一无所有",
        musicUrl: "http://mp3.com/xx.mp3",
        hqMusicUrl: "http://mp3.com/xx.mp3",
        thumbMediaId: "thisThumbMediaId"
      }
    });
  } else {
    // 回复高富帅(图文回复)
    res.reply([
      {
        title: '你来我家接我吧',
        description: '这是女神与高富帅之间的对话',
        picurl: 'http://nodeapi.cloudfoundry.com/qrcode.jpg',
        url: 'http://nodeapi.cloudfoundry.com/'
      }
    ]);
  }
}));

const server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});