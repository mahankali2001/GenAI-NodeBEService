const morgan = require('morgan')
const json = require('morgan-json')
const fs = require('fs');
const path = require('path');
const useragent = require('useragent');

const logDir = path.join(__dirname, '../logs');

// Ensure the logs directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Create a write stream for the access log
const accessLogStream = fs.createWriteStream(
    path.join(logDir, 'access.log'),
    { flags: 'a' } // Append to the file, don't overwrite
);

// Define a custom token for the timestamp
morgan.token('timestamp', () => new Date().toISOString());

// Define custom tokens for OS and browser
morgan.token('useragent', (req) => {
    return useragent.parse(req.headers['user-agent']);
});

const format = json({
    timestamp: ':timestamp',
    method: ':method',
    url: ':url',
    status: ':status',
    contentLength: ':res[content-length]',
    responseTime: ':response-time',
    useragent: ':useragent'
})

// const logger = require('./logger')

// // Third-Party Middleware - HTTP request logger middleware for node.js
// // Export Morgan middleware configured for file logging
const httpLogger = morgan(format, {
    stream: accessLogStream  
});
// module.exports = morgan('combined', { stream: accessLogStream }); 

module.exports = httpLogger