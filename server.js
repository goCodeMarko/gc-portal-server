"use_strict";

(async () => {
  const express = require("express"),
    morgan = require("morgan"),
    cors = require("cors"),
    { Init, requestLogger } = require("./services/padayon"),
    path = require("path"),
    routes = require("./routes"),
    app = express(),
    config = require("./config"),
    server = require("http").createServer(app),
    fs = require("fs"),
    fsPromise = require("fs").promises,
    cookieParser = require("cookie-parser"),
    bodyParser = require("body-parser"),
    passportSetup = require("./services/passport");
  // clientFolder =
  //   config.server.type == "local" ? "sandbox-client/client" : "public";

  Init.Mongoose();
  //Init.CronJobs();

  app
    .use(requestLogger)

    .use(cors())

    // .use(express.static(path.join(__dirname, clientFolder)))

    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(cookieParser())

    .use(
      morgan(
        " :method :url :status " +
          `pid: ${process.pid}` +
          " :remote-addr - :remote-user [:date[clf]] - :response-time ms"
      )
    )

    .use(routes)

    .use((req, res) => {
      const error = Error("API not found");
      res.statusCode = 404;
      res.send({ error: error.message });
    });

  server.listen(config.server.port, () => {
    console.log(
      "\x1b[36m",
      `
      ██████╗ ██████╗  ██████╗      ██╗███████╗ ██████╗████████╗    ███████╗██╗     ██╗      █████╗ 
      ██╔══██╗██╔══██╗██╔═══██╗     ██║██╔════╝██╔════╝╚══██╔══╝    ██╔════╝██║     ██║     ██╔══██╗
      ██████╔╝██████╔╝██║   ██║     ██║█████╗  ██║        ██║       █████╗  ██║     ██║     ███████║
      ██╔═══╝ ██╔══██╗██║   ██║██   ██║██╔══╝  ██║        ██║       ██╔══╝  ██║     ██║     ██╔══██║
      ██║     ██║  ██║╚██████╔╝╚█████╔╝███████╗╚██████╗   ██║       ███████╗███████╗███████╗██║  ██║
      ╚═╝     ╚═╝  ╚═╝ ╚═════╝  ╚════╝ ╚══════╝ ╚═════╝   ╚═╝       ╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝
                                                                                                    
    `
    );
    console.log(
      "\x1b[36m",
      `You're now listening on port http://${config.server.hostname}:${config.server.port}/`
    );
  });
})();
