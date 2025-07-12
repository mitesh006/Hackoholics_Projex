require('dotenv').config();

module.exports = {
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/rewear'
    },
    server: {
        port: process.env.PORT || 5000
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
        expiresIn: '7d'
    },
    upload: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        maxFiles: 5,
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    }
}; 