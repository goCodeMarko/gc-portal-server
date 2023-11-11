const cron = require("node-cron");

const checkDatabase = () => {
  console.log("running a task every minute");
};

module.exports.run = () => {
  cron.schedule(
    "17 19 * * *",
    () => {
      console.log("running a task every 17 19");
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
