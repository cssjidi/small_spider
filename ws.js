const Nes = require('nes');

var client = new Nes.Client('ws://localhost');

const start = async () => {

    await client.connect();
    const payload = await client.request('hello');  // Can also request '/h'
    // payload -> 'world!'
};

start();