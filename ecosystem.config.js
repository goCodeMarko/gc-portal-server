module.exports = {
  apps: [
    {
      name: "server",
      script: "server.js",
      instances: 3,
      exec_mode: "cluster",
      env_production: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      },
    },
  ],
};
