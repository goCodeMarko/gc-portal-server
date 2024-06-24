"use_strict";

(async () => {
  const express = require("express"),
    morgan = require("morgan"),
    cors = require("cors"),
    { Init, requestLogger } = require("./services/padayon"),
    routes = require("./routes"),
    app = express(),
    config = require("./config"),
    server = require("http").createServer(app),
    cookieParser = require("cookie-parser"),
    bodyParser = require("body-parser"),
    hbs = require("handlebars"),
    passportSetup = require("./services/passport"),
    moment = require('moment'),
    // Redis = require("ioredis"),
    // redis = new Redis({
    //   port: 6379, // Redis port
    //   host: "127.0.0.1", // Redis host,
    // }),
    title =  `
    ██████╗ ██████╗  ██████╗      ██╗███████╗ ██████╗████████╗    ███████╗██╗     ██╗      █████╗ 
    ██╔══██╗██╔══██╗██╔═══██╗     ██║██╔════╝██╔════╝╚══██╔══╝    ██╔════╝██║     ██║     ██╔══██╗
    ██████╔╝██████╔╝██║   ██║     ██║█████╗  ██║        ██║       █████╗  ██║     ██║     ███████║
    ██╔═══╝ ██╔══██╗██║   ██║██   ██║██╔══╝  ██║        ██║       ██╔══╝  ██║     ██║     ██╔══██║
    ██║     ██║  ██║╚██████╔╝╚█████╔╝███████╗╚██████╗   ██║       ███████╗███████╗███████╗██║  ██║
    ╚═╝     ╚═╝  ╚═╝ ╚═════╝  ╚════╝ ╚══════╝ ╚═════╝   ╚═╝       ╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝
                                                                                                  
  `;
  // clientFolder =
  //   config.server.type == "local" ? "sandbox-client/client" : "public";

  Init.Mongoose();
  
  if(process.env.name === 'main-app' || process.env.CLUSTER_MODE === 'NO'){
    // Init.CronJobs();
    console.log('Process Environment: ', process.env)
  }
  
  module.exports.io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  this.io.on("connection", (socket) => {
    const socketId = socket.id;
    console.log(`A client id ${socketId} connected`);

    socket.on("message", (message) => {
      // Broadcast the message to all sockets except the sender
      socket.broadcast.emit("message", message);
    });

    socket.on("disconnect", () => {
      console.log("A client disconnected");
    });
  });
  
  //handlebars custom helpers
  hbs.registerHelper('formatDate', (date, format, timezone) => {
    return moment.utc(date).tz(timezone).format(format);
  });
  hbs.registerHelper('sum', (...numbers) => {
    numbers.pop();
    const sum = numbers.reduce((a,b) => a + b, 0);
    return sum.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });
  }) 
  hbs.registerHelper('currency', (cash) => {
    const currency = cash.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });
    return currency;
  }) 
  hbs.registerHelper('formatStatus', (status) => {
    let result = '';
    const css = "display: inline-block;padding: 4.2px 7.88px;border-radius: .375rem;font-size: 12px;"
    switch (status) {
      case 1:
        result = `<span style="${css}background-color: #f8f9fa;color: #000000;">Pending</span>`
      break;
      case 2:
        result = `<span style="${css}background-color: #0dcaf0;color: #000000;">Approved</span>`
      break;
      case 3:
        result = `<span style="${css}background-color: #dc3545;color: #ffffff;">Failed</span>`
      break;
      case 4:
        result = `<span style="${css}background-color: #6c757d;color: #ffffff;">Cancelled</span>`
      break;
    }

    return  result; 
  });

  app
    .use(requestLogger)
    .use(cors())
    // .use(express.static(path.join(__dirname, clientFolder)))
    .use(bodyParser.json({ limit: "100mb" }))
    .use(bodyParser.urlencoded({ limit: '100mb', extended: true }))
    .use(cookieParser())

    .use(
      morgan(
        " :method :url :status " +
          `pid: ${process.pid}` +
          " :remote-addr - :remote-user [:date[clf]] - :response-time ms"
      )
    )
  
    .use(routes)
    .get('/', (req,res) => {
      res.send(`<p style="font-style:verdana;">Welcome to GC Portal API!</p></br>
        <pre>powered by \n ${title}</pre>
      `);
    })

    .use((req, res) => {
      const error = Error("API not found");
      res.statusCode = 404;
      res.send({ error: error.message });
    });

  server.listen(config.server.port, () => {
    if(process.env.name === 'main-app' || process.env.CLUSTER_MODE === 'NO'){
      console.log("\x1b[36m", title);
    }
    console.log(
      "\x1b[36m",
      `You're now listening on port http://${config.server.hostname}:${config.server.port}/`
    );
  });
})();
