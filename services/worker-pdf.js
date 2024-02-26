const { parentPort } = require("worker_threads");

let counter = 0;
for (let index = 0; index < 10_000_000_000; index++) {
  counter++;
}

parentPort.postMessage(counter);
