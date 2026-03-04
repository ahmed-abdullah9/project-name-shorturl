const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'shorturl'
};

class UrlModel {
    static async createConnection() {
        try {
            const connection = await mysql.createConnection(dbConfig);
            return connection;
        } catch (error) {
            console.error('Database connection failed:', error);
            throw error;
        }
    }

    static generateShortCode(length = 6) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    static async findByUrl(originalUrl) {
        const connection = await this.createConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT * FROM urls WHERE original_url = ?',
                [originalUrl]
            );
            return rows[0] || null;
        } finally {
            await connection.end();
        }
    }

    static async findByShortCode(shortCode) {
        const connection = await this.createConnection();
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

    static async create(originalUrl) {
        const connection = await this.createConnection();
        try {
            let shortCode;
            let existing;
            
            // Generate unique short code
            do {
                shortCode = this.generateShortCode();
                existing = await this.findByShortCode(shortCode);
            } while (existing);

            const [result] = await connection.execute(
                'INSERT INTO urls (original_url, short_code) VALUES (?, ?)',
                [originalUrl, shortCode]
            );

            return {
                id: result.insertId,
                original_url: originalUrl,
                short_code: shortCode,
                created_at: new Date(),
                click_count: 0
            };
        } finally {
            await connection.end();
        }
    }

    static async incrementClickCount(shortCode) {
        const connection = await this.createConnection();
        try {
            await connection.execute(
                'UPDATE urls SET click_count = click_count + 1 WHERE short_code = ?',
                [shortCode]
            );
        } finally {
            await connection.end();
        }
    }
}

module.exports = UrlModel;