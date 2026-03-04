const express = require('express');
const validator = require('validator');
const UrlModel = require('../models/urlModel');

const router = express.Router();

router.post('/shorten', async (req, res) => {
    try {
        const { url } = req.body;

        // Validate input
        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'URL is required'
            });
        }

        // Validate URL format
        if (!validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true })) {
            return res.status(400).json({
                success: false,
                error: 'Invalid URL format. Please include http:// or https://'
            });
        }

        // Check if URL already exists
        const existingUrl = await UrlModel.findByUrl(url);
        if (existingUrl) {
            const shortUrl = `${req.protocol}://${req.get('host')}/${existingUrl.short_code}`;
            return res.json({
                success: true,
                data: {
                    original_url: existingUrl.original_url,
                    short_url: shortUrl,
                    short_code: existingUrl.short_code,
                    created_at: existingUrl.created_at,
                    click_count: existingUrl.click_count
                }
            });
        }

        // Create new short URL
        const newUrl = await UrlModel.create(url);
        const shortUrl = `${req.protocol}://${req.get('host')}/${newUrl.short_code}`;

        res.status(201).json({
            success: true,
            data: {
                original_url: newUrl.original_url,
                short_url: shortUrl,
                short_code: newUrl.short_code,
                created_at: newUrl.created_at,
                click_count: newUrl.click_count
            }
        });

    } catch (error) {
        console.error('Shorten URL error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

router.get('/health', (req, res) => {
    res.json({
        success: true,
        service: 'api-service',
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;