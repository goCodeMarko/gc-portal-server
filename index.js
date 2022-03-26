'use_strict';

const
    express = require('express'),
    morgan = require('morgan'),
    cors = require('cors'),
    init = require('./library').init,
    path = require('path'),
    api = require('./api'),
    app = express(),
    config = require('./config'),
    server = require('http').createServer(app);


init.mongoose();

app
    .use(cors())

    .use(express.static(path.join(__dirname, '../sandbox-client/client')))

    .use(express.urlencoded({ extended: false }))

    .use(express.json())

    .use(morgan('dev'))

    .use(api);


server.listen(config.server.port, () => {
    console.log('\x1b[36m', `You're now listening on port http://${config.server.hostname}:${config.server.port}/`);
});



