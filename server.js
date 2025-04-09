const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 3000;
let retryLimit = 0; // Default: No retries

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate Limiting Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// File upload setup
const upload = multer({ dest: 'uploads/' });

// Constants from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'mock_secret';
const STATIC_TOKEN = process.env.STATIC_TOKEN || 'mock_token'; // Constant token for authentication
const VALID_BEARER_TOKEN = process.env.VALID_BEARER_TOKEN || 'd6200704e337b3f9d696fabace52c92746c53abc2436fdbf8ba72acee1c70702'; 
const VALID_USERNAME = process.env.VALID_USERNAME || 'admin';  // Set valid username
const VALID_PASSWORD = process.env.VALID_PASSWORD || 'password'; // Set valid password

const RETRY_LIMIT_ENABLED = process.env.RETRY_LIMIT_ENABLED === 'true';

// Custom Error Class
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Middleware for enforcing Content-Type
const enforceContentTypeMiddleware = (req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method) && !req.headers['content-type']) {
    console.log('Request headers:', req.headers); // Log all headers for debugging
    return next(new ApiError("Bad Request - Missing Content-Type header", 400));
  }
  next();
};

// None Authentication Middleware
const NoneAuthMiddleware = (req, res, next) => {
  console.log("No authentication required for this request.");
  next(); // Allows the request without any authentication
};

// Basic Authentication Middleware
const basicAuthMiddleware = (req, res, next) => {
  console.log("Checking Basic Auth...");
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return next(new ApiError('Unauthorized - Basic Auth required', 401));
  }
  const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8').split(':');
  if (credentials.length !== 2 || credentials[0] !== VALID_USERNAME || credentials[1] !== VALID_PASSWORD) {
    return next(new ApiError('Unauthorized - Invalid username or password', 401));
  }
  console.log("Basic Auth successful");
  next();
};

// Bearer Authentication Middleware
const bearerAuthMiddleware = (req, res, next) => {
  console.log("Checking Bearer Token...");
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError('Unauthorized - Bearer Token required', 401));
  }
  if (authHeader.split(' ')[1] !== VALID_BEARER_TOKEN) {
    return next(new ApiError('Unauthorized - Invalid token', 401));
  }
  console.log("Bearer Token authentication successful");
  next();
};

// Authentication Middleware Handler
const authMiddleware = (req, res, next) => {
  if (!req.headers.authorization) {
    return NoneAuthMiddleware(req, res, next); // If no auth, allow access
  }
  if (req.headers.authorization.startsWith('Basic ')) {
    return basicAuthMiddleware(req, res, next);
  }
  if (req.headers.authorization.startsWith('Bearer ')) {
    return bearerAuthMiddleware(req, res, next);
  }
  return next(new ApiError('Invalid or unsupported authentication type', 401));
};

// OAuth2 Mock Endpoints
app.get('/authorize', (req, res) => {
  const { client_id, redirect_uri, state } = req.query;
  if (!client_id || !redirect_uri || !state) {
    throw new ApiError('Missing required query parameters', 400);
  }
  res.redirect(`${redirect_uri}?code=mock_code&state=${state}`);
});

app.post('/token', (req, res) => {
  const { code, client_id, client_secret, audience } = req.body;
  if (!code || !client_id || !client_secret || !audience) {
    throw new ApiError('Missing required parameters for token', 400);
  }
  res.json({ access_token: "mock_access_token", token_type: 'Bearer', expires_in: 3600 });
});

// Request Handler
const handleRequest = (req, res) => {
  res.json({
    message: `${req.method} request successful`,
    method: req.method,
    url: req.originalUrl,
    headers: req.headers
  });
};

// Data Endpoints with Correct Authentication Handling
app.get('/data', authMiddleware, handleRequest);
app.post('/data', authMiddleware, enforceContentTypeMiddleware, handleRequest);
app.put('/data', authMiddleware, enforceContentTypeMiddleware, handleRequest);
app.patch('/data', authMiddleware, enforceContentTypeMiddleware, handleRequest);
app.delete('/data', authMiddleware, handleRequest);

// Toggle Retry Endpoint
app.post('/toggle-retry', (req, res) => {
  retryLimit = req.body.enable ? 2 : 0;
  res.json({ message: `Retry limit set to ${retryLimit}` });
});

// File Upload Endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    throw new ApiError('No file uploaded', 400);
  }
  res.json({
    message: 'File uploaded successfully',
    file: req.file.originalname,
    fileType: req.file.mimetype
  });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err);
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
app.listen(port, () => console.log(`Mock server running at http://localhost:${port}`));
