'use_strict';

( async () => {

const
    express = require('express'),
    morgan = require('morgan'),
    cors = require('cors'),
    { init, requestLogger } = require('./helpers/padayon'),
    path = require('path'),
    routes = require('./routes'),
    app = express(),
    config = require('./config'),
    server = require('http').createServer(app),
    fs = require('fs'),
    fsPromise = require('fs').promises,
    cookieParser = require('cookie-parser');
/*
if(!fs.existsSync(path.join(__dirname, 'txt'))){
    fs.mkdirSync(path.join(__dirname, 'txt'));
}
let  x = fs.writeFileSync(path.join(__dirname, 'txt', 'xxxxxxxxx.txt'), 'ertertertretre');
console.log(x);

fs.readdirSync(path.join(__dirname, 'api')).forEach(file =>{
    console.log(file);
    fs.readFile(path.join(__dirname, 'api', file), 'utf8' , (err, data) => {
        fs.writeFileSync(path.join(__dirname, 'txt', 'xxxxxxxxx.js'), data);
    });
})
 fs.readdir(path.join(__dirname, 'api'), (err, file) => {
        console.log(file)
 });

const writing = await fsPromise.writeFile(path.join(__dirname, 'sample.html'), '<h1>Hello World!</h1>');

app.get('/', (req, res, next) =>{
    res.sendFile(path.join(__dirname, 'sample.txt'));
});

app.get('/x', (req, res) => {
    console.log('x')
})
*/

init.mongoose();
init.cron();

app
    .use(requestLogger)

    .use(cookieParser())

    .use(cors())

    .use(express.static(path.join(__dirname, '/sandbox-client/client')))

    .use(express.urlencoded({ extended: false }))

    .use(express.json())

    .use(morgan('dev'))
    
    .use(routes);


server.listen(config.server.port, () => {
    console.log('\x1b[36m', `You're now listening on port http://${config.server.hostname}:${config.server.port}/`);
});

})();