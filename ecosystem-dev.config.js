module.exports = {
    apps: [
      {
        "name": "main-app",
        "script": "server.js",
        "args": ["--port", "3002"],
        "exec_mode"  : "fork",
        watch: true,
        env: {
          "PORT": 3002,
          "NODE_ENV": "dev",
          "JWT_PRIVATE_KEY" : "9d4238e6c1af65300e56984b7e9c2749ab65843ed1a353d33e672a058a101c7e9338f88600ccc47a055d41693286cd19ae1e66196da42d6baaae6aa568be12b7",
          "CLOUDINARY_CLOUD_NAME" : "dhmkfau4h",
          "CLOUDINARY_API_KEY" : "253497192239911",
          "CLOUDINARY_API_SECRET" : "SOYQGwp2FqH6MRe0Y-x5AgqY5Ak",
          "ATLAS_URI" : "mongodb://172.24.209.111:27017/gc-portal",
          "NODEMAILER_TEST_EMAIL" : "patrickmarckdulaca@gmail.com",
          "NODEMAILER_TEST_PW" : "bcsg nwok pkgy knrg",
          "NODEMAILER_TEST_RECIPIENT" : "patrickmarckdulaca@gmail.com",
          "NODEMAILER_EMAIL" : "",
          "NODEMAILER_PW" : ""
        }
      },
      { 
        name: 'child-process',
        "script": "server.js",
        "args": ["--port", "3001"],
        "instances"  : '-1',
        "exec_mode"  : "cluster",
        watch: true,
        env: {
          "PORT": 3001,
          "NODE_ENV": "dev",
          "JWT_PRIVATE_KEY" : "9d4238e6c1af65300e56984b7e9c2749ab65843ed1a353d33e672a058a101c7e9338f88600ccc47a055d41693286cd19ae1e66196da42d6baaae6aa568be12b7",
          "CLOUDINARY_CLOUD_NAME" : "dhmkfau4h",
          "CLOUDINARY_API_KEY" : "253497192239911",
          "CLOUDINARY_API_SECRET" : "SOYQGwp2FqH6MRe0Y-x5AgqY5Ak",
          "ATLAS_URI" : "mongodb://172.24.209.111:27017/gc-portal",
          "NODEMAILER_TEST_EMAIL" : "patrickmarckdulaca@gmail.com",
          "NODEMAILER_TEST_PW" : "bcsg nwok pkgy knrg",
          "NODEMAILER_TEST_RECIPIENT" : "patrickmarckdulaca@gmail.com",
          "NODEMAILER_EMAIL" : "",
          "NODEMAILER_PW" : ""
        }
      },
    ],
  };
  