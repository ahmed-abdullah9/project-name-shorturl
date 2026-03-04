const express = require('express');
const redirectRoutes = require('./routes/redirect');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());

// Routes
app.use('/', redirectRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        service: 'redirect-service',
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

app.listen(PORT, () => {
    console.log(`Redirect Service running on port ${PORT}`);
});