const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

async function testLogin() {
    console.log('🧪 Testing Login...\n');

    try {
        // Test login
        console.log('Testing user login...');
        const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });

        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log('✅ Login successful');
            console.log('Token:', loginData.token.substring(0, 20) + '...');
            console.log('User:', loginData.user.username);

            // Test creating an item
            console.log('\nTesting item creation...');
            const itemResponse = await fetch(`${BASE_URL}/items`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${loginData.token}`
                },
                body: JSON.stringify({
                    title: 'Test Item',
                    description: 'This is a test item',
                    price: 25.00,
                    category: 'clothing',
                    condition: 'good',
                    size: 'M',
                    brand: 'Test Brand',
                    location: 'Test Location',
                    tags: 'test, clothing'
                })
            });

            if (itemResponse.ok) {
                const itemData = await itemResponse.json();
                console.log('✅ Item created successfully');
                console.log('Item ID:', itemData.item._id);
            } else {
                const errorData = await itemResponse.json();
                console.log('❌ Item creation failed:', errorData.message);
            }

        } else {
            const errorData = await loginResponse.json();
            console.log('❌ Login failed:', errorData.message);
        }

    } catch (error) {
        console.error('❌ Error testing API:', error.message);
    }
}

testLogin(); 