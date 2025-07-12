const Item = require('../models/Item');
const User = require('../models/User');

// Get all items with filtering and pagination
const getItems = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      subcategory,
      condition,
      minPrice, 
      maxPrice,
      city,
      state,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = { isActive: true, status: 'available' };
    
    // Add filters
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (condition) query.condition = condition;
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (state) query['location.state'] = new RegExp(state, 'i');
    
    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const items = await Item.find(query)
      .populate('createdBy', 'username profile.firstName profile.lastName')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Item.countDocuments(query);

    res.json({
      success: true,
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch items' 
    });
  }
};

// Get single item
const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('createdBy', 'username profile.firstName profile.lastName profile.phone')
      .populate('likes', 'username');
    
    if (!item) {
      return res.status(404).json({ 
        success: false,
        message: 'Item not found' 
      });
    }

    // Increment view count
    item.views += 1;
    await item.save();

    res.json({
      success: true,
      item,
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch item' 
    });
  }
};

// Create new item
const createItem = async (req, res) => {
  try {
    const itemData = {
      ...req.body,
      createdBy: req.user.id,
    };

    const item = new Item(itemData);
    await item.save();
    await item.populate('createdBy', 'username profile.firstName profile.lastName');

    res.status(201).json({
      success: true,
      message: 'Item listed successfully on ReWear!',
      item,
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to create item' 
    });
  }
};

// Update item
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ 
        success: false,
        message: 'Item not found' 
      });
    }

    // Check if user owns the item or is admin
    if (item.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this item' 
      });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username profile.firstName profile.lastName');

    res.json({
      success: true,
      message: 'Item updated successfully',
      item: updatedItem,
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to update item' 
    });
  }
};

// Delete item
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ 
        success: false,
        message: 'Item not found' 
      });
    }

    // Check if user owns the item or is admin
    if (item.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this item' 
      });
    }

    await Item.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete item' 
    });
  }
};

// Get user's items
const getUserItems = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { createdBy: req.user.id };
    
    if (status) {
      query.status = status;
    }

    const items = await Item.find(query)
      .populate('createdBy', 'username profile.firstName profile.lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      items,
      count: items.length
    });
  } catch (error) {
    console.error('Get user items error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch your items' 
    });
  }
};

// Toggle like item
const toggleLike = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ 
        success: false,
        message: 'Item not found' 
      });
    }

    const userId = req.user.id;
    const isLiked = item.likes.includes(userId);

    if (isLiked) {
      item.likes = item.likes.filter(id => id.toString() !== userId);
    } else {
      item.likes.push(userId);
    }

    await item.save();

    res.json({
      success: true,
      message: isLiked ? 'Item unliked' : 'Item liked',
      isLiked: !isLiked,
      likesCount: item.likes.length
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to toggle like' 
    });
  }
};

// Get categories
const getCategories = async (req, res) => {
  try {
    const categories = await Item.distinct('category');
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch categories' 
    });
  }
};

module.exports = {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getUserItems,
  toggleLike,
  getCategories,
};
