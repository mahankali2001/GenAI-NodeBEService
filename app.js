require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const rateLimit = require('express-rate-limit'); // Rate limiting middleware for Express
const cors = require('cors'); // Cross-Origin Resource Sharing (CORS) middleware
const axios = require('axios'); // HTTP client for Node.js


const port = process.env.PORT || 3001;
// Allow requests from the client-side / another domain
app.use(cors());

// custom logger
const httpStatusCodes = require('./loggers/httpStatusCodes')
const api404Error = require('./loggers/api404Error'); 

// centralized error handling
const logger = require('./loggers/logger') 
const httpLogger = require('./loggers/httpLogger')
const { logError, isOperationalError } = require('./loggers/errorHandler')

// static file serving
app.use(express.static('public'));

// Built-in middleware - Parse JSON or URL-encoded payloads for all requests.
app.use(bodyParser.json());

// Global or Application-Level Middleware - global logging, authentication, cors
app.use((req, res, next) => {
    console.log('Application-Level Middleware');
    // Log every incoming HTTP request for monitoring or debugging.
    console.log(`${req.method} ${req.url}`);
    // Verify user tokens or credentials for all incoming requests - future use
    // if (!req.headers.authorization) {
    //     return res.status(401).send('Unauthorized');
    // }
    next();
});

// Throttle requests to prevent abuse or overloading.
const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW, 10), 
    max: parseInt(process.env.RATE_LIMIT_MAX, 10),
    handler: (req, res, next) => {
        console.log('Too many requests, please try again later.');
        const error = new Error('Too many requests, please try again later.');
        error.status = 429;
        next(error);
    }
});

app.get('/api', (req, res) => {
    res.send('Node JS Server App APIs - /chat');
});

app.post('/api/chat', apiLimiter, async (req, res, next) => {
    try {
        const { message } = req.body;
        const response = await axios.post(
            process.env.OPENAI_URL,
            {
                model: process.env.OPENAI_MODEL,
                messages: [{ role: 'user', content: message }],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            }
        );
        // console.log(response.data.choices[0].message.content);
        res.json(response.data.choices[0].message.content);
    } catch (error) {
        // logError(error.stack);
        next(error)
        // res.status(500).send(error.message);
    }
});

// Error-Handling Middleware - centralized error handling, logging, and provide user-friendly error pages based on status codes
// app.use(logger);
app.use(httpLogger) // log every incoming HTTP request for monitoring or debugging

app.use((err, req, res, next) => {
    // console.error("centralized error handling");
    if (err.status === httpStatusCodes.NOT_FOUND) {
        // return res.status(404).send('Page Not Found');
        throw new Api404Error('Page Not Found') // custom error
    }
    res.status(500).send('Internal Server Error'); // generic error
});

// Test uncaughtException handler
// setTimeout(() => {
//     throw new Error('Test uncaught exception');
// }, 1000);

process.on('uncaughtException', error => {
    logError(error)

    if (!isOperationalError(error)) {
        // console.log('uncaughtException - isOperationalError');
        process.exit(1)
    }
});
// process.on('unhandledRejection', error => {
//     throw error
// });

// Server Listening
app.listen(port, () => {
    console.log(`App running at http://localhost:${port}`);
});







// Test code snippets


// Middleware - function that execute during the lifecycle of an HTTP request to the server
// got access to request (req), response (res) objects, as well as call next middleware using next() function
// can modify objects, short-circuit the request-response cycle / end the request-response cycle
// Execution Flow: Middleware 1 → next() → Middleware 2 → next() → Route Handler → Response Sent.
// request-response cycle ends if next() is missing
// Types: Application-level (global logging, authentication, cors), Router-level, Error-handling, Built-in (Provided by Express for common tasks - express.json(), express.urlencoded()), Third-party
// Middleware usecases - Logging, Authentication, Authorization, Error Handling, Request Parsing, Response Formatting, Caching, Compression, etc.

// Built-in middleware - Parse JSON or URL-encoded payloads for all requests.
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.get('/api/about', (req, res) => {
//     res.send('nodejs app - Gen AI features!');
// });

// const adminrouter = express.Router();

// // Router-Level Middleware - authentication, authorization, request validation, rate limiting
// adminrouter.use((req, res, next) => {
//     console.log('Router-Level Middleware');
//     // Authenticate only specific routes like /prompt, /admin 
//     // Verify admin tokens or credentials for all incoming requests to the admin routes
//     // if (!req.headers.adminToken) {
//     //     return res.status(403).send('Forbidden');
//     // }
//     next();
// });

// app.use('/api/users', apiLimiter);

// adminrouter.get('/api/users', (req, res) => {
//     // try {
//     //     res.send('User list');
//     // } catch (error) {
//     //     next(error) //forward errors to the error handler middleware
//     // }

//     // Missing error handling in real use case - centralized error handling
//     res.send('User list');
    
//     // Centralized error handling 
//     process.on('uncaughtException', error => {
//         logError(error)
    
//         if (!isOperationalError(error)) {
//             process.exit(1)
//         }
//     })
//     process.on('unhandledRejection', error => {
//         throw error
//     })
// });

// adminrouter.use('/api/users/:id', (req, res, next) => {
//     // Validate request parameters or payloads for a particular route group.
//     if (!Number.isInteger(Number(req.params.id))) {
//         return res.status(400).send('Invalid User ID');
//     }
//     next();
// });

// adminrouter.get('/api/users/:id', (req, res) => {
//     res.send(`User ID: ${req.params.id}`);
// });

// app.use('/', adminrouter);

// Test uncaughtException handler
// setTimeout(() => {
//     throw new Error('Test uncaught exception');
// }, 1000);

// 404 Not Found Middleware
// app.use((req, res, next) => {
//     res.status(404).send('Page Not Found');
// });

// More logging options
// app.use(morgan('dev')); // logs incoming requests, status code, response time
// app.use(morgan('tiny')); // logs in Apache tiny log format, minimal output
// app.use(morgan('short')); // logs in Apache short log format, essential information like method, URL, and status code
// app.use(morgan('common')); // logs in Apache common log format, essential information like method, URL, and status code

// JS window vs global
// console.log(this);    // log {}
// module.exports.foo = 5;
// console.log(this);   // log { foo:5 }
// console.log(global); 
//setTimeout(() => console.log('setTimeout'), 0);
// clearTimeout(1);
// setInterval(() => console.log('setInterval'), 1000);
// clearInterval(1);
// console.log(module);

//CORS - Cross-Origin Resource Sharing - allows restricted resources on a web page to be requested from another domain outside the domain from which the resource originated
//Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers, Access-Control-Allow-Credentials, Access-Control-Max-Age
//prevent Cross-Site Request Forgery (CSRF) attacks
// const corsOptions = {
//     origin: 'http://example.com', // Allow only this origin
//     methods: 'GET,POST', // Allow only GET and POST methods
//     allowedHeaders: 'Content-Type,Authorization', // Allow only these headers
//   };
  
// app.use(cors(corsOptions));