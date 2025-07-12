# Backend Setup Guide

## Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** (v4.4 or higher)
3. **npm** or **yarn**

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install MongoDB:**
   - Download and install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Or use MongoDB Atlas (cloud service)

3. **Start MongoDB locally:**
   ```bash
   # On Windows
   mongod
   
   # On macOS/Linux
   sudo systemctl start mongod
   ```

4. **Create environment variables:**
   Create a `.env` file in the root directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/rewear
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=development
   ```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Items
- `GET /api/items` - Get all items (with filtering)
- `GET /api/items/:id` - Get item by ID
- `POST /api/items` - Create new item (protected, with image upload)
- `PUT /api/items/:id` - Update item (protected, with image upload)
- `DELETE /api/items/:id` - Delete item (protected)
- `GET /api/items/user/items` - Get user's items (protected)

## Image Upload

The backend supports image uploads with the following features:

- **File Types:** JPEG, PNG, GIF, WebP
- **Max File Size:** 5MB per file
- **Max Files:** 5 files per request
- **Storage:** Local filesystem in `backend/uploads/`
- **URL Format:** `http://localhost:5000/uploads/filename.jpg`

### Example Image Upload Request

```javascript
const formData = new FormData();
formData.append('title', 'Vintage T-Shirt');
formData.append('description', 'Classic vintage t-shirt');
formData.append('price', '25.00');
formData.append('category', 'clothing');
formData.append('condition', 'good');
formData.append('size', 'M');
formData.append('brand', 'Nike');
formData.append('location', 'New York');
formData.append('tags', 'vintage, t-shirt, nike');

// Add images
formData.append('images', file1);
formData.append('images', file2);

fetch('/api/items', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`
    },
    body: formData
});
```

## Database Schema

### User Model
```javascript
{
    username: String (required, unique),
    email: String (required, unique),
    password: String (required, hashed),
    role: String (enum: ['user', 'admin']),
    profileImage: String,
    createdAt: Date
}
```

### Item Model
```javascript
{
    title: String (required),
    description: String (required),
    price: Number (required),
    category: String (enum: ['clothing', 'accessories', 'shoes', 'bags', 'jewelry', 'other']),
    condition: String (enum: ['new', 'like-new', 'good', 'fair', 'poor']),
    size: String (required),
    brand: String,
    images: [String] (required),
    seller: ObjectId (ref: User),
    status: String (enum: ['available', 'sold', 'reserved']),
    location: String (required),
    tags: [String],
    createdAt: Date,
    updatedAt: Date
}
```

## Testing the API

You can test the API using tools like:
- **Postman**
- **Insomnia**
- **cURL**

### Example cURL Commands

1. **Register a user:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

3. **Get all items:**
   ```bash
   curl http://localhost:5000/api/items
   ```

## Troubleshooting

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running
   - Check if the connection string is correct
   - Verify MongoDB is installed and accessible

2. **Image Upload Issues:**
   - Check if the uploads directory exists
   - Verify file size and type restrictions
   - Ensure proper form data format

3. **Authentication Issues:**
   - Verify JWT secret is set
   - Check token format in Authorization header
   - Ensure token hasn't expired

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- File type validation for uploads
- File size limits
- CORS enabled for cross-origin requests
- Input validation and sanitization 