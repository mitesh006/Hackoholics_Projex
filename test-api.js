const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
    console.log('🧪 Testing Rewear Backend API...\n');

    try {
        // Test 1: Check if server is running
        console.log('1. Testing server connection...');
        const response = await fetch('http://localhost:5000');
        const data = await response.json();
        console.log('✅ Server is running:', data.message);

        // Test 2: Register a user
        console.log('\n2. Testing user registration...');
        const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            })
        });

        if (registerResponse.ok) {
            const registerData = await registerResponse.json();
            console.log('✅ User registered successfully');
            console.log('Token:', registerData.token.substring(0, 20) + '...');
            
            // Test 3: Login
            console.log('\n3. Testing user login...');
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

                // Test 4: Get user profile
                console.log('\n4. Testing protected route (get profile)...');
                const profileResponse = await fetch(`${BASE_URL}/auth/profile`, {
                    headers: {
                        'Authorization': `Bearer ${loginData.token}`
                    }
                });

                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    console.log('✅ Profile retrieved successfully');
                    console.log('Username:', profileData.username);
                    console.log('Email:', profileData.email);
                } else {
                    console.log('❌ Profile retrieval failed');
                }

                // Test 5: Get all items
                console.log('\n5. Testing get all items...');
                const itemsResponse = await fetch(`${BASE_URL}/items`);
                
                if (itemsResponse.ok) {
                    const itemsData = await itemsResponse.json();
                    console.log('✅ Items retrieved successfully');
                    console.log('Total items:', itemsData.total || 0);
                } else {
                    console.log('❌ Items retrieval failed');
                }

            } else {
                console.log('❌ Login failed');
            }
        } else {
            console.log('❌ Registration failed');
        }

    } catch (error) {
        console.error('❌ Error testing API:', error.message);
    }
}

testAPI(); 