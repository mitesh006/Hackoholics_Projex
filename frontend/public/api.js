// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Token management
let authToken = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');

// API Helper Functions
class API {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        // Add auth token if available
        if (authToken) {
            defaultOptions.headers['Authorization'] = `Bearer ${authToken}`;
        }

        const config = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentication Methods
    static async register(userData) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        this.setAuthData(data.token, data.user);
        return data;
    }

    static async login(credentials) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        this.setAuthData(data.token, data.user);
        return data;
    }

    static async getProfile() {
        return await this.request('/auth/profile');
    }

    static async updateProfile(profileData) {
        return await this.request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    // Item Methods
    static async getAllItems(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = queryParams ? `/items?${queryParams}` : '/items';
        return await this.request(endpoint);
    }

    static async getItemById(id) {
        return await this.request(`/items/${id}`);
    }

    static async createItem(itemData, images = []) {
        const formData = new FormData();
        
        // Add item data
        Object.keys(itemData).forEach(key => {
            formData.append(key, itemData[key]);
        });
        
        // Add images
        images.forEach(image => {
            formData.append('images', image);
        });

        return await this.request('/items', {
            method: 'POST',
            headers: {}, // Let browser set Content-Type for FormData
            body: formData
        });
    }

    static async updateItem(id, itemData, images = []) {
        const formData = new FormData();
        
        // Add item data
        Object.keys(itemData).forEach(key => {
            formData.append(key, itemData[key]);
        });
        
        // Add images
        images.forEach(image => {
            formData.append('images', image);
        });

        return await this.request(`/items/${id}`, {
            method: 'PUT',
            headers: {}, // Let browser set Content-Type for FormData
            body: formData
        });
    }

    static async deleteItem(id) {
        return await this.request(`/items/${id}`, {
            method: 'DELETE'
        });
    }

    static async getUserItems() {
        return await this.request('/items/user/items');
    }

    // Auth Helper Methods
    static setAuthData(token, user) {
        authToken = token;
        currentUser = user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }

    static clearAuthData() {
        authToken = null;
        currentUser = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    static isAuthenticated() {
        return !!authToken;
    }

    static getCurrentUser() {
        return currentUser;
    }

        static logout() {
      this.clearAuthData();
      window.location.href = '../views/index.html';
    }
}

// UI Helper Functions
class UI {
    static showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `alert alert-${type}`;
        messageDiv.textContent = message;
        
        document.body.insertBefore(messageDiv, document.body.firstChild);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    static showLoading(element) {
        element.disabled = true;
        element.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
    }

    static hideLoading(element, originalText) {
        element.disabled = false;
        element.innerHTML = originalText;
    }

    static formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }

    static formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    static createItemCard(item) {
        return `
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <img src="${item.images[0] || '/images/placeholder.jpg'}" 
                         class="card-img-top" alt="${item.title}"
                         style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">${item.title}</h5>
                        <p class="card-text">${item.description.substring(0, 100)}...</p>
                        <p class="card-text"><strong>${this.formatPrice(item.price)}</strong></p>
                        <p class="card-text"><small class="text-muted">${item.condition} • ${item.size}</small></p>
                        <a href="/itemDetail.html?id=${item._id}" class="btn btn-primary">View Details</a>
                    </div>
                </div>
            </div>
        `;
    }
}

// Global error handler
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    UI.showMessage('An error occurred. Please try again.', 'danger');
});

// Export for use in other files
window.API = API;
window.UI = UI; 