const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Item name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Item description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['clothing', 'shoes', 'accessories', 'bags', 'electronics', 'books', 'home', 'sports', 'other'],
      message: 'Category must be one of: clothing, shoes, accessories, bags, electronics, books, home, sports, other'
    }
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: [50, 'Subcategory cannot exceed 50 characters']
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [50, 'Brand name cannot exceed 50 characters']
  },
  size: {
    type: String,
    trim: true,
    maxlength: [20, 'Size cannot exceed 20 characters']
  },
  color: {
    type: String,
    trim: true,
    maxlength: [30, 'Color cannot exceed 30 characters']
  },
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: {
      values: ['new', 'like-new', 'good', 'fair', 'poor'],
      message: 'Condition must be one of: new, like-new, good, fair, poor'
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    max: [1000000, 'Price cannot exceed 10,00,000']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  images: [{
    type: String,
    trim: true
  }],
  location: {
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode']
    }
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved', 'inactive'],
    default: 'available'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better search performance
itemSchema.index({ name: 'text', description: 'text', brand: 'text' });
itemSchema.index({ category: 1, subcategory: 1 });
itemSchema.index({ 'location.city': 1, 'location.state': 1 });
itemSchema.index({ price: 1 });
itemSchema.index({ createdBy: 1 });
itemSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Item', itemSchema);