
// const fs = require('fs');
// const path = require('path');
// const morgan = require('morgan'); // HTTP request logger middleware for node.js, Winston, Bunyan,Pino etc. are other popular loggers

// const logDir = path.join(__dirname, 'logs');

// // Ensure the logs directory exists
// if (!fs.existsSync(logDir)) {
//     fs.mkdirSync(logDir);
// }

// // Create a write stream for the access log
// const accessLogStream = fs.createWriteStream(
//     path.join(__dirname, 'logs', 'access.log'),
//     { flags: 'a' } // Append to the file, don't overwrite
// );

// // Third-Party Middleware - HTTP request logger middleware for node.js
// // Export Morgan middleware configured for file logging
// module.exports = morgan('combined', { stream: accessLogStream }); // logs in Apache combined log format, detailed information including IP, user agent, and more.

const winston = require('winston')
// const Logsene = require('winston-logsene')

// get JSON formatted logs from the console and send them to Logsene
const options = {
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true
    }
    // ,logsene: {
    //     token: process.env.LOGS_TOKEN,
    //     level: 'debug',
    //     type: 'app_logs',
    //     url: 'https://logsene-receiver.sematext.com/_bulk'
    // }
}

const logger = winston.createLogger({
    levels: winston.config.npm.levels,
    transports: [
        new winston.transports.Console(options.console) //,
        // new Logsene(options.logsene)
    ],
    exitOnError: false 
})

module.exports = logger