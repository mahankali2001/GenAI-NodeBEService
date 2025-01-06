const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const logger = require('./loggers/logger') // Import the custom logger
const httpLogger = require('./loggers/httpLogger')
const { logError, isOperationalError } = require('./loggers/errorHandler')

const httpStatusCodes = require('./loggers/httpStatusCodes')
const api404Error = require('./loggers/api404Error'); 

const app = express();
const port = 3000;

// Use the logger middleware
// app.use(logger);
app.use(httpLogger)

// static file serving
app.use(express.static('public'));

// Global or Application-Level Middleware - global logging, authentication, cors
app.use((req, res, next) => {
    console.log('Application-Level Middleware');
    // Log every incoming HTTP request for monitoring or debugging.
    console.log(`${req.method} ${req.url}`);
    // Verify user tokens or credentials for all incoming requests.
    // if (!req.headers.authorization) {
    //     return res.status(401).send('Unauthorized');
    // }
    next();
});

// Enable Cross-Origin Resource Sharing (CORS) for all requests.
app.use(cors());


// Built-in middleware - Parse JSON or URL-encoded payloads for all requests.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.send('Node JS App APIs - /about, /users, /users/:id, /prompt');
});

app.get('/about', (req, res) => {
    res.send('nodejs app - Gen AI features!');
});

const adminrouter = express.Router();

// Router-Level Middleware - authentication, authorization, request validation, rate limiting
adminrouter.use((req, res, next) => {
    console.log('Router-Level Middleware');
    // Authenticate only specific routes like /prompt, /admin 
    // Verify admin tokens or credentials for all incoming requests to the admin routes
    // if (!req.headers.adminToken) {
    //     return res.status(403).send('Forbidden');
    // }
    next();
});

adminrouter.get('/prompt', (req, res) => {
    try {
        res.send('User prompt');
    } catch (error) {
        next(error) //forward errors to the error handler middleware
    }
});

// Throttle requests to prevent abuse or overloading.
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2 // Limit each IP to 100 requests per window
});

app.use('/users', apiLimiter);

adminrouter.get('/users', (req, res) => {
    try {
        res.send('User list');
    } catch (error) {
        next(error) //forward errors to the error handler middleware
    }

    process.on('uncaughtException', error => {
        logError(error)
    
        if (!isOperationalError(error)) {
            process.exit(1)
        }
    })
    process.on('unhandledRejection', error => {
        throw error
    })
});

adminrouter.use('/users/:id', (req, res, next) => {
    // Validate request parameters or payloads for a particular route group.
    if (!Number.isInteger(Number(req.params.id))) {
        return res.status(400).send('Invalid User ID');
    }
    next();
});

adminrouter.get('/users/:id', (req, res) => {
    res.send(`User ID: ${req.params.id}`);
});

app.use('/', adminrouter);


// Error-Handling Middleware - centralized error handling, logging, and provide user-friendly error pages based on status codes
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err.status === httpStatusCodes.NOT_FOUND) {
        // throw new Api404Error(`User with id: ${req.params.id} not found.`)
        throw new Api404Error('Page Not Found') // 
        // return res.status(404).send('Page Not Found');
    }
    res.status(500).send('Internal Server Error');
});

// 404 Not Found Middleware
app.use((req, res, next) => {
    res.status(404).send('Page Not Found');
});

process.on('uncaughtException', error => {
    logError(error)

    if (!isOperationalError(error)) {
        process.exit(1)
    }
})
process.on('unhandledRejection', error => {
    throw error
})

// Server Listening
app.listen(port, () => {
    console.log(`App running at http://localhost:${port}`);
});










// Middleware is a function that execute during the lifecycle of an HTTP request to the server
// Middleware functions - 
// can access objects like request (req), response (res) objects, as well as call next middleware using next() function
// can modify objects, short-circuit the request-response cycle (end the request-response cycle)
// Middleware Execution Flow: 
// Middleware 1 → next() → Middleware 2 → next() → Route Handler → Response Sent.
// request-response cycle ends after the middleware if next() is missing
// Types of middleware: Application-level (global logging, authentication, cors), Router-level, Error-handling, Built-in (Provided by Express for common tasks - express.json(), express.urlencoded()), Third-party
// Middleware usecases - Logging, Authentication, Authorization, Error Handling, Request Parsing, Response Formatting, Caching, Compression, etc.


// app.use(morgan('dev')); // logs incoming requests, status code, response time
// app.use(morgan('tiny')); // logs in Apache tiny log format, minimal output
// app.use(morgan('short')); // logs in Apache short log format, essential information like method, URL, and status code
// app.use(morgan('common')); // logs in Apache common log format, essential information like method, URL, and status code

// console.log(this);    // logs {}
// module.exports.foo = 5;
// console.log(this);   // log { foo:5 }
// console.log(global); 
//setTimeout(() => console.log('setTimeout'), 0);
// clearTimeout(1);
// setInterval(() => console.log('setInterval'), 1000);
// clearInterval(1);
// console.log(module);
