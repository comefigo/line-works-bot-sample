const Ngrok = require('ngrok');
Ngrok.connect({
    proto: 'http',
    addr: 3000,
    region: 'ap'
});

Ngrok.once('connect', function(url) {
    console.log(url);
});