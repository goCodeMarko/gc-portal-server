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
    console.log('\x1b[36m', `
            8 888888888o      .8.          8 888888888o.            .8.    8. 8888.      ,8'  ,o888888o.     b.             8 
            8 8888     88.   .888.         8 8888     ^888.        .888.    8. 8888.    ,8'. 8888      88.   888o.          8 
            8 8888      88  :88888.        8 8888         88.     :88888.    8. 8888.  ,8',8 8888        8b  Y88888o.       8 
            8 8888     ,88 .  88888.       8 8888          88    .  88888.    8. 8888.,8' 88 8888         8b.Y888888o.      8 
            8 8888.   ,88'.8.  88888.      8 8888          88   .8.  88888.    8. 88888'  88 8888         88 8o.  Y888888o. 8 
            8 888888888P'.8 8.  88888.     8 8888          88  .8 8.  88888.    8. 8888   88 8888         88 8 Y8o.  Y88888o8 
            8 8888      .8'  8.  88888.    8 8888         ,88 .8'  8.  88888.    8 8888   88 8888        ,8P 8    Y8o.  Y8888 
            8 8888     .8'    8.  88888.   8 8888        ,88'.8'    8.  88888.   8 8888    8 8888      , 8P  8       Y8o.  Y8 
            8 8888    .888888888.  88888.  8 8888    ,o88P' .888888888.  88888.  8 8888      8888     ,88'   8          Y8o.  
            8 8888   .8'        8.  88888. 8 888888888P'   .8'        8.  88888. 8 8888        8888888P'     8             Yo 
    `);
    console.log('\x1b[36m', `You're now listening on port http://${config.server.hostname}:${config.server.port}/`);
});

})();