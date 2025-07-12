// Database Loader - Handles all data loading and display functionality
class DatabaseLoader {
    constructor() {
        this.currentUser = null;
        this.allItems = [];
        this.userItems = [];
        this.cart = [];
        this.filters = {
            category: '',
            size: '',
            condition: '',
            priceRange: '',
            searchQuery: ''
        };
    }

    // Initialize the loader
    async init() {
        try {
            // Check authentication
            if (API.isAuthenticated()) {
                this.currentUser = API.getCurrentUser();
                await this.loadUserData();
            }
            
            // Load initial data
            await this.loadAllItems();
            this.setupEventListeners();
            this.updateUI();
        } catch (error) {
            console.error('Database loader initialization failed:', error);
            UI.showMessage('Failed to load data. Please refresh the page.', 'error');
        }
    }

    // Load all items from database
    async loadAllItems() {
        try {
            const items = await API.getAllItems();
            this.allItems = items;
            this.displayItems(items);
            return items;
        } catch (error) {
            console.error('Failed to load items:', error);
            UI.showMessage('Failed to load items from database.', 'error');
            return [];
        }
    }

    // Load user-specific data
    async loadUserData() {
        try {
            if (!this.currentUser) return;

            // Load user's items
            this.userItems = await API.getUserItems();
            
            // Load user profile
            const profile = await API.getProfile();
            this.updateUserProfile(profile);
            
            return { userItems: this.userItems, profile };
        } catch (error) {
            console.error('Failed to load user data:', error);
            return { userItems: [], profile: null };
        }
    }

    // Display items in browse page
    displayItems(items = this.allItems) {
        const container = document.getElementById('products-grid');
        if (!container) return;

        container.innerHTML = '';

        if (items.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                    <h3>No items found</h3>
                    <p>Try adjusting your filters or add some items!</p>
                </div>
            `;
            return;
        }

        items.forEach(item => {
            const itemCard = this.createItemCard(item);
            container.appendChild(itemCard);
        });
    }

    // Create item card element
    createItemCard(item) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">
                ${item.images && item.images.length > 0 
                    ? `<img src="${item.images[0]}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">` 
                    : '<div class="no-image">📷 No Image</div>'}
            </div>
            <div class="product-title">${item.title}</div>
            <div class="product-details">
                Size: ${item.size} | Condition: ${item.condition}
            </div>
            <div class="product-price">$${UI.formatPrice(item.price)}</div>
            <div class="product-points">${Math.round(item.price / 10)} Points</div>
            <div class="product-actions">
                <button class="btn btn-secondary" onclick="databaseLoader.addToCart('${item._id}')">Add to Cart</button>
                <button class="btn btn-secondary" onclick="databaseLoader.viewItemDetails('${item._id}')">View Details</button>
            </div>
        `;
        return card;
    }

    // Display user's items in dashboard
    displayUserItems() {
        const container = document.getElementById('user-items-grid');
        if (!container) return;

        container.innerHTML = '';

        if (this.userItems.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                    <h3>No items yet</h3>
                    <p>Start by adding some items to your collection!</p>
                    <a href="add_items.html" class="btn">Add Your First Item</a>
                </div>
            `;
            return;
        }

        this.userItems.forEach(item => {
            const itemCard = this.createUserItemCard(item);
            container.appendChild(itemCard);
        });
    }

    // Create user item card for dashboard
    createUserItemCard(item) {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-image">
                ${item.images && item.images.length > 0 
                    ? `<img src="${item.images[0]}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/200x150?text=No+Image'">` 
                    : '<div class="no-image">📷</div>'}
            </div>
            <div class="item-title">${item.title}</div>
            <div class="item-price">$${UI.formatPrice(item.price)}</div>
            <div class="item-status status-${item.status || 'available'}">${item.status || 'Available'}</div>
            <div class="item-actions">
                <button class="btn btn-small" onclick="databaseLoader.editItem('${item._id}')">Edit</button>
                <button class="btn btn-small btn-danger" onclick="databaseLoader.deleteItem('${item._id}')">Delete</button>
            </div>
        `;
        return card;
    }

    // Update user profile display
    updateUserProfile(profile) {
        if (!profile) return;

        // Update user info in dashboard
        const userNameElement = document.getElementById('userNameLarge');
        const userAvatarElement = document.getElementById('userAvatarLarge');
        const userDisplayElement = document.getElementById('user-display');

        if (userNameElement) {
            userNameElement.textContent = profile.username;
        }
        if (userAvatarElement) {
            userAvatarElement.textContent = profile.username.substring(0, 2).toUpperCase();
        }
        if (userDisplayElement) {
            userDisplayElement.textContent = `👤 Welcome, ${profile.username}`;
        }

        // Update stats
        this.updateUserStats();
    }

    // Update user statistics
    updateUserStats() {
        const stats = {
            totalItems: this.userItems.length,
            activeItems: this.userItems.filter(item => item.status === 'available').length,
            totalValue: this.userItems.reduce((sum, item) => sum + item.price, 0),
            pointsEarned: this.userItems.reduce((sum, item) => sum + Math.round(item.price / 10), 0)
        };

        // Update dashboard stats
        const statsElements = {
            'total-items': stats.totalItems,
            'active-items': stats.activeItems,
            'total-value': UI.formatPrice(stats.totalValue),
            'points-earned': stats.pointsEarned
        };

        Object.keys(statsElements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = statsElements[id];
            }
        });
    }

    // Filter items based on criteria
    filterItems() {
        let filteredItems = [...this.allItems];

        // Apply category filter
        if (this.filters.category) {
            filteredItems = filteredItems.filter(item => 
                item.category === this.filters.category
            );
        }

        // Apply size filter
        if (this.filters.size) {
            filteredItems = filteredItems.filter(item => 
                item.size === this.filters.size
            );
        }

        // Apply condition filter
        if (this.filters.condition) {
            filteredItems = filteredItems.filter(item => 
                item.condition === this.filters.condition
            );
        }

        // Apply price range filter
        if (this.filters.priceRange) {
            const [min, max] = this.filters.priceRange.split('-').map(Number);
            filteredItems = filteredItems.filter(item => 
                item.price >= min && item.price <= max
            );
        }

        // Apply search query
        if (this.filters.searchQuery) {
            const query = this.filters.searchQuery.toLowerCase();
            filteredItems = filteredItems.filter(item => 
                item.title.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query)
            );
        }

        this.displayItems(filteredItems);
        return filteredItems;
    }

    // Add item to cart
    addToCart(itemId) {
        const item = this.allItems.find(item => item._id === itemId);
        if (!item) return;

        const existingItem = this.cart.find(cartItem => cartItem._id === itemId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ ...item, quantity: 1 });
        }

        this.updateCartDisplay();
        UI.showMessage(`${item.title} added to cart!`, 'success');
    }

    // Update cart display
    updateCartDisplay() {
        const cartCount = document.getElementById('cart-count');
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        const cartPoints = document.getElementById('cart-points');

        if (cartCount) {
            cartCount.textContent = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        }

        if (cartItems) {
            if (this.cart.length === 0) {
                cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            } else {
                cartItems.innerHTML = this.cart.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-image">
                            ${item.images && item.images.length > 0 
                                ? `<img src="${item.images[0]}" alt="${item.title}">` 
                                : '📷'}
                        </div>
                        <div class="cart-item-details">
                            <div class="cart-item-title">${item.title}</div>
                            <div class="cart-item-price">$${UI.formatPrice(item.price)}</div>
                            <div class="cart-item-quantity">Qty: ${item.quantity}</div>
                        </div>
                        <button class="btn btn-small btn-danger" onclick="databaseLoader.removeFromCart('${item._id}')">Remove</button>
                    </div>
                `).join('');
            }
        }

        if (cartTotal && cartPoints) {
            const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const points = this.cart.reduce((sum, item) => sum + (Math.round(item.price / 10) * item.quantity), 0);
            
            cartTotal.textContent = `Total: $${UI.formatPrice(total)}`;
            cartPoints.textContent = `Points: ${points}`;
        }
    }

    // Remove item from cart
    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item._id !== itemId);
        this.updateCartDisplay();
        UI.showMessage('Item removed from cart', 'info');
    }

    // View item details
    viewItemDetails(itemId) {
        const item = this.allItems.find(item => item._id === itemId);
        if (!item) return;

        // Store item data for detail page
        localStorage.setItem('selectedItem', JSON.stringify(item));
        window.location.href = 'itemDetail.html';
    }

    // Edit item
    async editItem(itemId) {
        const item = this.userItems.find(item => item._id === itemId);
        if (!item) return;

        // Store item data for edit page
        localStorage.setItem('editingItem', JSON.stringify(item));
        window.location.href = 'add_items.html?edit=true';
    }

    // Delete item
    async deleteItem(itemId) {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            await API.deleteItem(itemId);
            this.userItems = this.userItems.filter(item => item._id !== itemId);
            this.displayUserItems();
            this.updateUserStats();
            UI.showMessage('Item deleted successfully', 'success');
        } catch (error) {
            UI.showMessage('Failed to delete item', 'error');
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Filter event listeners
        const categoryFilter = document.getElementById('categoryFilter');
        const sizeFilter = document.getElementById('sizeFilter');
        const conditionFilter = document.getElementById('conditionFilter');
        const searchInput = document.getElementById('searchInput');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.filterItems();
            });
        }

        if (sizeFilter) {
            sizeFilter.addEventListener('change', (e) => {
                this.filters.size = e.target.value;
                this.filterItems();
            });
        }

        if (conditionFilter) {
            conditionFilter.addEventListener('change', (e) => {
                this.filters.condition = e.target.value;
                this.filterItems();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.searchQuery = e.target.value;
                this.filterItems();
            });
        }

        // Cart toggle
        const cartToggle = document.getElementById('cart-toggle');
        if (cartToggle) {
            cartToggle.addEventListener('click', () => {
                const cartSection = document.getElementById('cart-section');
                if (cartSection) {
                    cartSection.classList.toggle('show');
                }
            });
        }
    }

    // Update UI based on current page
    updateUI() {
        const currentPage = window.location.pathname.split('/').pop();

        switch (currentPage) {
            case 'browse.html':
                this.displayItems();
                this.updateCartDisplay();
                break;
            case 'dashboard.html':
                this.displayUserItems();
                this.updateUserStats();
                break;
            case 'LandingPage.html':
                this.updateLandingPage();
                break;
        }
    }

    // Update landing page with recent items
    updateLandingPage() {
        const recentItemsContainer = document.getElementById('recent-items');
        if (!recentItemsContainer) return;

        const recentItems = this.allItems.slice(0, 6); // Show 6 most recent items
        recentItemsContainer.innerHTML = recentItems.map(item => `
            <div class="recent-item">
                <div class="recent-item-image">
                    ${item.images && item.images.length > 0 
                        ? `<img src="${item.images[0]}" alt="${item.title}">` 
                        : '<div class="no-image">📷</div>'}
                </div>
                <div class="recent-item-title">${item.title}</div>
                <div class="recent-item-price">$${UI.formatPrice(item.price)}</div>
            </div>
        `).join('');
    }

    // Load item details for detail page
    loadItemDetails() {
        const itemData = localStorage.getItem('selectedItem');
        if (!itemData) {
            window.location.href = 'browse.html';
            return;
        }

        const item = JSON.parse(itemData);
        this.displayItemDetails(item);
    }

    // Display item details
    displayItemDetails(item) {
        const container = document.getElementById('item-details');
        if (!container) return;

        container.innerHTML = `
            <div class="item-detail-container">
                <div class="item-images">
                    ${item.images && item.images.length > 0 
                        ? item.images.map(img => `<img src="${img}" alt="${item.title}">`).join('')
                        : '<div class="no-image">📷 No Images Available</div>'}
                </div>
                <div class="item-info">
                    <h1>${item.title}</h1>
                    <div class="item-price">$${UI.formatPrice(item.price)}</div>
                    <div class="item-description">${item.description}</div>
                    <div class="item-details">
                        <p><strong>Category:</strong> ${item.category}</p>
                        <p><strong>Size:</strong> ${item.size}</p>
                        <p><strong>Condition:</strong> ${item.condition}</p>
                        <p><strong>Seller:</strong> ${item.seller?.username || 'Unknown'}</p>
                        <p><strong>Listed:</strong> ${UI.formatDate(item.createdAt)}</p>
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-primary" onclick="databaseLoader.addToCart('${item._id}')">Add to Cart</button>
                        <button class="btn btn-secondary" onclick="databaseLoader.contactSeller('${item.seller?._id}')">Contact Seller</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Contact seller
    contactSeller(sellerId) {
        if (!this.currentUser) {
            UI.showMessage('Please login to contact seller', 'warning');
            return;
        }
        // Implement contact functionality
        UI.showMessage('Contact feature coming soon!', 'info');
    }

    // Buy with cash
    buyWithCash() {
        if (this.cart.length === 0) {
            UI.showMessage('Your cart is empty', 'warning');
            return;
        }
        UI.showMessage('Payment processing coming soon!', 'info');
    }

    // Buy with points
    buyWithPoints() {
        if (this.cart.length === 0) {
            UI.showMessage('Your cart is empty', 'warning');
            return;
        }
        UI.showMessage('Points redemption coming soon!', 'info');
    }
}

// Initialize database loader
const databaseLoader = new DatabaseLoader();

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    databaseLoader.init();
}); 