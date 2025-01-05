const express = require('express');
const morgan = require('morgan'); // HTTP request logger middleware for node.js, Winston, Bunyan,Pino etc. are other popular loggers
const fs = require('fs');
const path = require('path');

const app = express();
const router = express.Router();
const port = 3000;

// logging in log file to track requests
const accessLogStream = fs.createWriteStream( 
    path.join(__dirname, 'access.log'), 
    { flags: 'a' }
);

app.use(morgan('combined', { stream: accessLogStream }));

// Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global / Application-Level Middleware
app.use((req, res, next) => {
    console.log('Application-Level Middleware');
    next();
});

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Router-Level Middleware
router.use((req, res, next) => {
    console.log('Router-Level Middleware');
    next();
});

router.get('/user', (req, res) => {
    res.send('User Profile');
});

app.use('/', router);

app.get('/about', (req, res) => {
    res.send('About Page - Hello, World!');
});

// static file serving
app.use(express.static('public'));

// Third-Party Middleware
app.use(morgan('dev')); // logs incoming requests, status code, response time
// app.use(morgan('combined')); // logs in Apache combined log format, detailed information including IP, user agent, and more.
// app.use(morgan('tiny')); // logs in Apache tiny log format, minimal output
// app.use(morgan('short')); // logs in Apache short log format, essential information like method, URL, and status code
// app.use(morgan('common')); // logs in Apache common log format, essential information like method, URL, and status code

// Error-Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 404 Not Found Middleware
app.use((req, res, next) => {
    res.status(404).send('Page Not Found');
});

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
// Types of middleware: Application-level, Router-level, Error-handling, Built-in (Provided by Express for common tasks - express.json(), express.urlencoded()), Third-party
// Middleware usecases - Logging, Authentication, Authorization, Error Handling, Request Parsing, Response Formatting, Caching, Compression, etc.
