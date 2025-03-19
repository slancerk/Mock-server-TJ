const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(cookieParser()); // Parse cookies

// File upload setup
const upload = multer({ dest: 'uploads/' });

// JWT Secret for authentication
const JWT_SECRET = process.env.JWT_SECRET || 'mock_secret';

// Middleware for Basic Auth
const basicAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ error: 'Unauthorized - Basic Auth required' });
    }
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    if (username !== 'admin' || password !== 'password') {
        return res.status(403).json({ error: 'Invalid username or password' });
    }
    next();
};

// Middleware for Bearer Token Auth
const bearerAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - Bearer token required' });
    }
    const token = authHeader.split(' ')[1];

    try {
        jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

// OAuth2 Mock Endpoints
app.get('/authorize', (req, res) => {
    const { client_id, redirect_uri, state } = req.query;
    if (!client_id || !redirect_uri || !state) {
        return res.status(400).json({ error: 'Missing required query parameters' });
    }
    res.redirect(`${redirect_uri}?code=mock_code&state=${state}`);
});

app.post('/token', (req, res) => {
    const { code, client_id, client_secret, audience } = req.body;
    if (!code || !client_id || !client_secret || !audience) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }
    if (code === 'mock_code') {
        const token = jwt.sign({ user: 'mock_user', client_id, audience }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ access_token: token, token_type: 'Bearer', expires_in: 3600 });
    } else {
        res.status(400).json({ error: 'invalid_grant' });
    }
});

// REST API Methods with Authentication Options
app.get('/data', (req, res) => res.json({ message: 'GET request successful' }));

app.post('/data', (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.json({ message: 'POST request successful' });
    }

    if (authHeader.startsWith('Basic ')) {
        return basicAuthMiddleware(req, res, next);
    } else if (authHeader.startsWith('Bearer ')) {
        return bearerAuthMiddleware(req, res, next);
    } else {
        return res.status(401).json({ error: 'Invalid or unsupported authentication type' });
    }
}, (req, res) => {
    res.json({ message: 'POST request successful' });
});

app.put('/data', basicAuthMiddleware, (req, res) => res.json({ message: 'PUT request successful' }));
app.patch('/data', (req, res) => res.json({ message: 'PATCH request successful' }));
app.delete('/data', (req, res) => res.json({ message: 'DELETE request successful' }));

// File Upload (Multipart)
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ message: 'File uploaded successfully', file: req.file.originalname });
});

// Start Server
app.listen(port, () => console.log(`Mock server running at http://localhost:${port}`));
