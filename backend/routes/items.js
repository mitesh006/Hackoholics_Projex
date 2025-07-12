const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
    createItem,
    getAllItems,
    getItemById,
    updateItem,
    deleteItem,
    getUserItems
} = require('../controllers/itemController');

const { auth, adminAuth } = require('../middlewares/authMiddleware');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 5 // Maximum 5 files
    }
});

// Public routes
router.get('/', getAllItems);
router.get('/:id', getItemById);

// Protected routes
router.post('/', auth, upload.array('images', 5), createItem);
router.get('/user/items', auth, getUserItems);
router.put('/:id', auth, upload.array('images', 5), updateItem);
router.delete('/:id', auth, deleteItem);

// Error handling for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ message: 'Too many files. Maximum is 5 files.' });
        }
    }
    if (error.message === 'Only image files are allowed!') {
        return res.status(400).json({ message: error.message });
    }
    next(error);
});

module.exports = router;