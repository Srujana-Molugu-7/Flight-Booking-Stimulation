/**
 * Express Server for SkyVoyage Flight Booking Application
 * 
 * This server serves the static files and provides a foundation
 * for future API endpoints that can connect to a FastAPI backend.
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'SkyVoyage API is running' });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`SkyVoyage server running on http://0.0.0.0:${PORT}`);
});
