# NodeJSApp

# Install following node modules
- npm install express
- npm install -g nodemon
- npm install morgan
- npm install morgan-json
- npm install winston
- npm install cors
- npm install express-rate-limit
- npm install useragent
- npm install openai
- npm install dotenv
- npm install body-parser  (Middleware to parse JSON and URL-encoded data sent in HTTP requests)
- npm install axios  (Promise-based HTTP client / JS library to make HTTP (async / intercept req/resp / transforms JSON data / can automatically set the XSRF token from cookies, providing built-in support for Cross-Site Request Forgery (CSRF) protection) requests)

# Create .env file in your project root folder and have following entries in the file. 
```
OPENAI_API_KEY="<Provide your API Key>"
OPENAI_URL='https://api.openai.com/v1/chat/completions'
OPENAI_MODEL='gpt-3.5-turbo'
PORT=3001
RATE_LIMIT_WINDOW=15 * 60 * 1000 # 15 minutes
RATE_LIMIT_MAX=5
```

# What you learn in this project (Some of the code you may need to uncomment to try)
- Express web framework
- Using different middlewares - global or applicaiton level, built-in, router level, error handling level, third party level
    - app middlewares - global logging, auth
    - built-in middlewares - Parse JSON or URL-encoded payloads
    - router middlewares - auth / authorization, request validation, rate limiting
    - error handling middlewares - central error handling, logging, provide user-friendly error pages,Logging to file
    - third party level - cors

- Error handling 
    - Use centralized location for Logs and Error Alerting - use structured logging to print errors in a formatted way and send them for safekeeping to a central location, like Sematext Logs, our log management tool.
    - 2 categories of errors to be handled
        - Operational errors - Use Custom Errors to Handle
            - Like, server connection failure, failed to resolve hostname, invalid user input, request timeout, 500 response, socket hang-up, out of memory
        - Programmer errors
            - These errors can often cause issues in your apps like memory leaks and high CPU usage. The best thing to do is to crash the app and restart it gracefully by using the Node.js cluster mode or a tool like PM2
            - Like, passing string Vs object / incorrect parameter in a fn, didn't resolve or catch rejected promise, calling async fn without a callback


# APIs
- GET /api
- GET /api/about
- POST /api/chat -- Integrates with [Open AI](https://api.openai.com/v1/chat/completions) API - gpt-3.5-turbo model. 
- Test rate limiting - rate limit after 2 requests
    - GET /api/users
    - GET /api/users/<userid> 

# Reference - https://roadmap.sh/nodejs