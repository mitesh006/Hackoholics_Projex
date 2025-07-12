const Item = require('../models/Item');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create Item
const createItem = async (req, res) => {
    try {
        const {
            title,
            description,
            price,
            category,
            condition,
            size,
            brand,
            location,
            tags
        } = req.body;

        // Handle image uploads
        const imageUrls = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
                imageUrls.push(imageUrl);
            });
        }

        const item = new Item({
            title,
            description,
            price,
            category,
            condition,
            size,
            brand,
            location,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            images: imageUrls,
            seller: req.user._id
        });

        await item.save();

        res.status(201).json({
            message: 'Item created successfully',
            item
        });
    } catch (error) {
        console.error('Create item error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get All Items
const getAllItems = async (req, res) => {
    try {
        const { 
            category, 
            condition, 
            minPrice, 
            maxPrice, 
            search,
            page = 1,
            limit = 10
        } = req.query;

        const filter = { status: 'available' };

        if (category) filter.category = category;
        if (condition) filter.condition = condition;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } }
            ];
        }

        const items = await Item.find(filter)
            .populate('seller', 'username')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Item.countDocuments(filter);

        res.json({
            items,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Get all items error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Item by ID
const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id)
            .populate('seller', 'username email');

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json(item);
    } catch (error) {
        console.error('Get item by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update Item
const updateItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check if user is the seller or admin
        if (item.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updateData = { ...req.body };

        // Handle new image uploads
        if (req.files && req.files.length > 0) {
            const newImageUrls = [];
            req.files.forEach(file => {
                const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
                newImageUrls.push(imageUrl);
            });

            // Add new images to existing ones
            updateData.images = [...item.images, ...newImageUrls];
        }

        const updatedItem = await Item.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('seller', 'username');

        res.json({
            message: 'Item updated successfully',
            item: updatedItem
        });
    } catch (error) {
        console.error('Update item error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete Item
const deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check if user is the seller or admin
        if (item.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Delete associated images from filesystem
        item.images.forEach(imageUrl => {
            const filename = imageUrl.split('/').pop();
            const filepath = path.join(uploadsDir, filename);
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
        });

        await Item.findByIdAndDelete(req.params.id);

        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Delete item error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get User's Items
const getUserItems = async (req, res) => {
    try {
        const items = await Item.find({ seller: req.user._id })
            .sort({ createdAt: -1 });

        res.json(items);
    } catch (error) {
        console.error('Get user items error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createItem,
    getAllItems,
    getItemById,
    updateItem,
    deleteItem,
    getUserItems
};