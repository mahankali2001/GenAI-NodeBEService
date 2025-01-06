const morgan = require('morgan')
const json = require('morgan-json')
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, 'logs');

// Ensure the logs directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Create a write stream for the access log
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'logs', 'access.log'),
    { flags: 'a' } // Append to the file, don't overwrite
);

// Define a custom token for the timestamp
morgan.token('timestamp', () => new Date().toISOString());

const format = json({
    timestamp: ':timestamp',
    method: ':method',
    url: ':url',
    status: ':status',
    contentLength: ':res[content-length]',
    responseTime: ':response-time'
})

const logger = require('./logger')

// // Third-Party Middleware - HTTP request logger middleware for node.js
// // Export Morgan middleware configured for file logging
const httpLogger = morgan(format, {
    stream: accessLogStream  
});
// module.exports = morgan('combined', { stream: accessLogStream }); 

module.exports = httpLogger