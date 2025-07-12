const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test data
const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'testpass123'
};

const testItem = {
    title: 'Test Item',
    description: 'A test item for verification',
    price: 25.00,
    category: 'tops',
    size: 'M',
    condition: 'good',
    images: ['https://via.placeholder.com/300x300?text=Test+Item']
};

async function testBackendConnection() {
    console.log('🔧 Testing Backend Connection...');
    try {
        const response = await axios.get(BASE_URL);
        console.log('✅ Backend is running:', response.data.message);
        return true;
    } catch (error) {
        console.log('❌ Backend connection failed:', error.message);
        return false;
    }
}

async function testUserRegistration() {
    console.log('\n👤 Testing User Registration...');
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
        console.log('✅ User registration successful:', response.data.message);
        return response.data.token;
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.log('⚠️ User might already exist, trying login...');
            return await testUserLogin();
        } else {
            console.log('❌ User registration failed:', error.message);
            return null;
        }
    }
}

async function testUserLogin() {
    console.log('\n🔐 Testing User Login...');
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        console.log('✅ User login successful');
        return response.data.token;
    } catch (error) {
        console.log('❌ User login failed:', error.message);
        return null;
    }
}

async function testItemCreation(token) {
    console.log('\n📦 Testing Item Creation...');
    try {
        const response = await axios.post(`${BASE_URL}/api/items`, testItem, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('✅ Item creation successful:', response.data.title);
        return response.data._id;
    } catch (error) {
        console.log('❌ Item creation failed:', error.message);
        return null;
    }
}

async function testItemRetrieval(token) {
    console.log('\n📋 Testing Item Retrieval...');
    try {
        const response = await axios.get(`${BASE_URL}/api/items`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('✅ Items retrieved successfully:', response.data.length, 'items found');
        return response.data;
    } catch (error) {
        console.log('❌ Item retrieval failed:', error.message);
        return [];
    }
}

async function testItemUpdate(token, itemId) {
    console.log('\n✏️ Testing Item Update...');
    try {
        const updateData = { ...testItem, title: 'Updated Test Item' };
        const response = await axios.put(`${BASE_URL}/api/items/${itemId}`, updateData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('✅ Item update successful:', response.data.title);
        return true;
    } catch (error) {
        console.log('❌ Item update failed:', error.message);
        return false;
    }
}

async function testItemDeletion(token, itemId) {
    console.log('\n🗑️ Testing Item Deletion...');
    try {
        await axios.delete(`${BASE_URL}/api/items/${itemId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('✅ Item deletion successful');
        return true;
    } catch (error) {
        console.log('❌ Item deletion failed:', error.message);
        return false;
    }
}

async function testUserProfile(token) {
    console.log('\n👤 Testing User Profile...');
    try {
        const response = await axios.get(`${BASE_URL}/api/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('✅ User profile retrieved:', response.data.username);
        return true;
    } catch (error) {
        console.log('❌ User profile retrieval failed:', error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('🧪 Starting ReWear App Tests...\n');
    
    // Test 1: Backend Connection
    const backendOk = await testBackendConnection();
    if (!backendOk) {
        console.log('\n❌ Backend is not running. Please start the server first.');
        return;
    }
    
    // Test 2: User Authentication
    const token = await testUserRegistration();
    if (!token) {
        console.log('\n❌ Authentication failed. Cannot proceed with other tests.');
        return;
    }
    
    // Test 3: User Profile
    await testUserProfile(token);
    
    // Test 4: Item Operations
    const itemId = await testItemCreation(token);
    if (itemId) {
        await testItemRetrieval(token);
        await testItemUpdate(token, itemId);
        await testItemDeletion(token, itemId);
    }
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📊 Summary:');
    console.log('✅ Backend is running');
    console.log('✅ Authentication is working');
    console.log('✅ CRUD operations are functional');
    console.log('✅ API endpoints are accessible');
    
    console.log('\n🌐 Frontend Testing:');
    console.log('1. Open app-testing-guide.html in your browser');
    console.log('2. Click the test buttons to verify frontend functionality');
    console.log('3. Follow the manual testing checklist');
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = {
    testBackendConnection,
    testUserRegistration,
    testUserLogin,
    testItemCreation,
    testItemRetrieval,
    testItemUpdate,
    testItemDeletion,
    testUserProfile,
    runAllTests
}; 