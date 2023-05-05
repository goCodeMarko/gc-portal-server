'use_strict';

const folder = './routes';
const fs = require('fs');
module.exports = [];

fs.readdirSync(folder).forEach(file => {
    if (file !== 'index.js') module.exports.push(require('./' + file));
});
    
