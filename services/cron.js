const cron = require("node-cron");

const checkDatabase = () => {
  console.log("running a task every minute");
};

module.exports.run = () => {

  cron.schedule(
    "50 14 * * *",
    () => {
      console.log("running a task every 14 50");
    },
    {
      timezone: "Asia/Manila",
    }
  );

  cron.schedule(
    "* * * * *",
    () => {
      checkDatabase();
    },
    {
      timezone: "Asia/Manila",
    }
  );
};
