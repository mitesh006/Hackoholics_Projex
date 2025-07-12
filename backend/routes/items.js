const express = require('express');
const { 
  getItems, 
  getItem, 
  createItem, 
  updateItem, 
  deleteItem, 
  getUserItems,
  toggleLike,
  getCategories
} = require('../controllers/itemController');
const { authMiddleware, optionalAuthMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', optionalAuthMiddleware, getItems);
router.get('/categories', getCategories);
router.get('/:id', optionalAuthMiddleware, getItem);

// Protected routes
router.post('/', authMiddleware, createItem);
router.put('/:id', authMiddleware, updateItem);
router.delete('/:id', authMiddleware, deleteItem);
router.get('/user/my-items', authMiddleware, getUserItems);
router.post('/:id/like', authMiddleware, toggleLike);

module.exports = router;