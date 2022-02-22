'use_strict';

const folder = './api';
const fs = require('fs');
module.exports = [];

fs.readdirSync(folder).forEach(file => {
    if (file !== 'index.js') module.exports.push(require('./' + file));
    console.log()
});

