const Hapi = require('hapi');
const Nes = require('nes');
const Spider = require('./spider')

const server = new Hapi.Server({
	port: 1000,
    host: 'localhost'
});

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

const start = async () => {
	await server.register(Nes);
	server.route({
        method: 'POST',
        path: '/h',
        config: {
            id: 'hello',
            handler: async (request, h) => {
            	const { name } = request.payload
            	await setTimeout(()=>{
					request.socket.send(name)
            	},1000)
            	//await request.socket.send(request.payload.name)
                return 'world!';
            }
        }
    });
	server.route({
        method: 'POST',
        path: '/post',
        config: {
            handler: async (request, h) => {
				const post = await fetchPost() 	
            	await request.socket.send(post)
                return 'world!';
            }
        }
    });

    await server.start();
};

const fetchPost = async () => {
	return await spider.getPost()
}

const things = async () => {
	var Things = ['a','b','c','d','e','f','x','y','t']
	for (var i = Things.length - 1; i >= 0; i--) {
		return async function(t,r){
			console.log(t)
			await request.socket.send(t)
			return '2323'
		}(Things[i],request)
	}
}

const init = async () => {
    await start()
    console.log(`Server running at: ${server.info.uri}`);
};

init();