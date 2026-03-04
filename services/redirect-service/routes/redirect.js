const express = require('express');
const mysql = require('mysql2/promise');

const router = express.Router();

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'shorturl'
};

async function findByShortCode(shortCode) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute(
            'SELECT * FROM urls WHERE short_code = ?',
            [shortCode]
        );
        return rows[0] || null;
    } finally {
        await connection.end();
    }
}

async function incrementClickCount(shortCode) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        await connection.execute(
            'UPDATE urls SET click_count = click_count + 1 WHERE short_code = ?',
            [shortCode]
        );
    } finally {
        await connection.end();
    }
}

router.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;
        
        // Find the original URL
        const urlRecord = await findByShortCode(code);
        
        if (!urlRecord) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>ShortURL - Link Not Found</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            text-align: center; 
                            margin-top: 100px;
                            background-color: #f5f5f5;
                        }
                        .container {
                            background: white;
                            padding: 40px;
                            border-radius: 8px;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                            display: inline-block;
                            margin: 20px;
                        }
                        h1 { color: #e74c3c; }
                        a { color: #3498db; text-decoration: none; }
                        a:hover { text-decoration: underline; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>404 - Link Not Found</h1>
                        <p>The short link you're looking for doesn't exist.</p>
                        <p><a href="/">Create a new short link</a></p>
                    </div>
                </body>
                </html>
            `);
        }

        // Increment click count asynchronously
        incrementClickCount(code).catch(err => {
            console.error('Failed to increment click count:', err);
        });

        // Redirect to original URL
        res.redirect(301, urlRecord.original_url);

    } catch (error) {
        console.error('Redirect error:', error);
        res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>ShortURL - Error</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        text-align: center; 
                        margin-top: 100px;
                        background-color: #f5f5f5;
                    }
                    .container {
                        background: white;
                        padding: 40px;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        display: inline-block;
                        margin: 20px;
                    }
                    h1 { color: #e74c3c; }
                    a { color: #3498db; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>500 - Server Error</h1>
                    <p>Something went wrong. Please try again later.</p>
                    <p><a href="/">Go back to homepage</a></p>
                </div>
            </body>
            </html>
        `);
    }
});

module.exports = router;