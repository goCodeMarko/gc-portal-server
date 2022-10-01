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
    cookieParser = require('cookie-parser'),
    clientFolder = config.server.type == 'local' ? 'sandbox-client/client' : 'public';

init.mongoose();
init.cron();

app
    .use(requestLogger)

    .use(cookieParser())

    .use(cors())

    .use(express.static(path.join(__dirname, clientFolder)))

    .use(express.urlencoded({ extended: false }))

    .use(express.json())

    .use(morgan('dev'))
    
    .use(routes)

if (clientFolder == 'public'){
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, './public/index.html'));
    });
}


server.listen(config.server.port, () => {
    console.log('\x1b[36m', `You're now listening on port http://${config.server.hostname}:${config.server.port}/`);
});

})();