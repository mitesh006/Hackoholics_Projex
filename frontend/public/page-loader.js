// Page Loader - Handles page-specific data loading and initialization
class PageLoader {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.isAuthenticated = API.isAuthenticated();
    }

    // Get current page name
    getCurrentPage() {
        const path = window.location.pathname;
        return path.split('/').pop() || 'index.html';
    }

    // Initialize page-specific functionality
    async init() {
        try {
            // Check authentication requirements
            if (this.requiresAuth() && !this.isAuthenticated) {
                this.redirectToLogin();
                return;
            }

            // Load page-specific data
            await this.loadPageData();
            
            // Setup page-specific event listeners
            this.setupPageListeners();
            
            // Update page UI
            this.updatePageUI();
            
        } catch (error) {
            console.error('Page loader initialization failed:', error);
            UI.showMessage('Failed to load page data.', 'error');
        }
    }

    // Check if current page requires authentication
    requiresAuth() {
        const publicPages = ['index.html', 'LandingPage.html'];
        return !publicPages.includes(this.currentPage);
    }

    // Redirect to login page
    redirectToLogin() {
        window.location.href = 'index.html';
    }

    // Load page-specific data
    async loadPageData() {
        switch (this.currentPage) {
            case 'browse.html':
                await this.loadBrowsePageData();
                break;
            case 'dashboard.html':
                await this.loadDashboardPageData();
                break;
            case 'add_items.html':
                await this.loadAddItemsPageData();
                break;
            case 'itemDetail.html':
                await this.loadItemDetailPageData();
                break;
            case 'adminPanel.html':
                await this.loadAdminPanelData();
                break;
            case 'LandingPage.html':
                await this.loadLandingPageData();
                break;
        }
    }

    // Load browse page data
    async loadBrowsePageData() {
        // Load all items
        const items = await API.getAllItems();
        
        // Setup filters
        this.setupFilters();
        
        // Display items
        this.displayBrowseItems(items);
        
        // Setup cart functionality
        this.setupCart();
    }

    // Load dashboard page data
    async loadDashboardPageData() {
        // Load user profile
        const profile = await API.getProfile();
        this.updateUserProfile(profile);
        
        // Load user's items
        const userItems = await API.getUserItems();
        this.displayUserItems(userItems);
        
        // Update statistics
        this.updateDashboardStats(userItems);
        
        // Setup dashboard actions
        this.setupDashboardActions();
    }

    // Load add items page data
    async loadAddItemsPageData() {
        // Check if editing
        const urlParams = new URLSearchParams(window.location.search);
        const isEdit = urlParams.get('edit') === 'true';
        
        if (isEdit) {
            const itemData = localStorage.getItem('editingItem');
            if (itemData) {
                const item = JSON.parse(itemData);
                this.populateEditForm(item);
            }
        }
        
        // Setup form validation

    }

    // Load item detail page data
    async loadItemDetailPageData() {
        const itemData = localStorage.getItem('selectedItem');
        if (!itemData) {
            window.location.href = 'browse.html';
            return;
        }
        
        const item = JSON.parse(itemData);
        this.displayItemDetails(item);
    }

    // Load admin panel data
    async loadAdminPanelData() {
        // Check if user is admin
        const profile = await API.getProfile();
        if (profile.role !== 'admin') {
            UI.showMessage('Access denied. Admin privileges required.', 'error');
            window.location.href = 'dashboard.html';
            return;
        }
        
        // Load admin data
        await this.loadAdminData();
    }

    // Load landing page data
    async loadLandingPageData() {
        // Load recent items
        const items = await API.getAllItems();
        const recentItems = items.slice(0, 6);
        this.displayRecentItems(recentItems);
        
        // Update user info if logged in
        if (this.isAuthenticated) {
            const profile = await API.getProfile();
            this.updateLandingPageUserInfo(profile);
        }
    }

    // Setup page-specific event listeners
    setupPageListeners() {
        switch (this.currentPage) {
            case 'browse.html':
                this.setupBrowseListeners();
                break;
            case 'dashboard.html':
                this.setupDashboardListeners();
                break;
            case 'add_items.html':
                this.setupAddItemsListeners();
                break;
            case 'itemDetail.html':
                this.setupItemDetailListeners();
                break;
            case 'adminPanel.html':
                this.setupAdminListeners();
                break;
        }
    }

    // Setup browse page listeners
    setupBrowseListeners() {
        // Filter listeners
        const filters = ['categoryFilter', 'sizeFilter', 'conditionFilter'];
        filters.forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.addEventListener('change', () => this.applyFilters());
            }
        });
        
        // Search listener
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.applySearch());
        }
        
        // Cart toggle
        const cartToggle = document.getElementById('cart-toggle');
        if (cartToggle) {
            cartToggle.addEventListener('click', () => this.toggleCart());
        }
    }

    // Setup dashboard listeners
    setupDashboardListeners() {
        // Logout listener
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
        
        // Add item listener
        const addItemBtn = document.getElementById('add-item-btn');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => {
                window.location.href = 'add_items.html';
            });
        }
    }

    // Setup add items listeners
    setupAddItemsListeners() {
        // Form submission
        const form = document.getElementById('item-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                // REMOVE: this.handleItemSubmit
            });
        }
        
        // Image upload
        const imageInput = document.getElementById('itemImages');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                // REMOVE: this.handleImageUpload
            });
        }
    }

    // Setup item detail listeners
    setupItemDetailListeners() {
        // Add to cart
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => this.addToCart());
        }
        
        // Contact seller
        const contactBtn = document.getElementById('contact-seller-btn');
        if (contactBtn) {
            contactBtn.addEventListener('click', () => this.contactSeller());
        }
    }

    // Setup admin listeners
    setupAdminListeners() {
        // User management
        const userActions = document.querySelectorAll('.user-action');
        userActions.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const userId = e.target.dataset.userId;
                this.handleAdminAction(action, userId);
            });
        });
    }

    // Update page UI
    updatePageUI() {
        // Update navigation
        this.updateNavigation();
        
        // Update user info
        if (this.isAuthenticated) {
            this.updateUserInfo();
        }
        
        // Update page-specific elements
        this.updatePageSpecificUI();
    }

    // Update navigation
    updateNavigation() {
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            if (link.getAttribute('href') === this.currentPage) {
                link.classList.add('active');
            }
        });
    }

    // Update user info
    updateUserInfo() {
        const user = API.getCurrentUser();
        if (!user) return;
        
        // Update user display elements
        const userDisplays = document.querySelectorAll('.user-display');
        userDisplays.forEach(element => {
            element.textContent = user.username;
        });
        
        // Update user avatar
        const userAvatars = document.querySelectorAll('.user-avatar');
        userAvatars.forEach(avatar => {
            avatar.textContent = user.username.substring(0, 2).toUpperCase();
        });
    }

    // Update page-specific UI
    updatePageSpecificUI() {
        switch (this.currentPage) {
            case 'browse.html':
                this.updateBrowseUI();
                break;
            case 'dashboard.html':
                this.updateDashboardUI();
                break;
            case 'add_items.html':
                this.updateAddItemsUI();
                break;
        }
    }

    // Update browse page UI
    updateBrowseUI() {
        // Update cart count
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            cartCount.textContent = cart.length;
        }
    }

    // Update dashboard UI
    updateDashboardUI() {
        // Update stats
        this.updateStats();
        
        // Update recent activity
        this.updateRecentActivity();
    }

    // Update add items UI
    updateAddItemsUI() {
        // Check if editing
        const urlParams = new URLSearchParams(window.location.search);
        const isEdit = urlParams.get('edit') === 'true';
        
        if (isEdit) {
            const formTitle = document.getElementById('form-title');
            const submitBtn = document.getElementById('submit-btn');
            
            if (formTitle) formTitle.textContent = 'Edit Item';
            if (submitBtn) submitBtn.textContent = 'Update Item';
        }
    }

    // Display browse items
    displayBrowseItems(items) {
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

    // Create item card
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
                <button class="btn btn-secondary" onclick="pageLoader.addToCart('${item._id}')">Add to Cart</button>
                <button class="btn btn-secondary" onclick="pageLoader.viewItemDetails('${item._id}')">View Details</button>
            </div>
        `;
        return card;
    }

    // Display user items
    displayUserItems(items) {
        const container = document.getElementById('user-items-grid');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (items.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                    <h3>No items yet</h3>
                    <p>Start by adding some items to your collection!</p>
                    <a href="add_items.html" class="btn">Add Your First Item</a>
                </div>
            `;
            return;
        }
        
        items.forEach(item => {
            const itemCard = this.createUserItemCard(item);
            container.appendChild(itemCard);
        });
    }

    // Create user item card
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
                <button class="btn btn-small" onclick="pageLoader.editItem('${item._id}')">Edit</button>
                <button class="btn btn-small btn-danger" onclick="pageLoader.deleteItem('${item._id}')">Delete</button>
            </div>
        `;
        return card;
    }

    // Update user profile
    updateUserProfile(profile) {
        if (!profile) return;
        
        const userNameElement = document.getElementById('userNameLarge');
        const userAvatarElement = document.getElementById('userAvatarLarge');
        
        if (userNameElement) {
            userNameElement.textContent = profile.username;
        }
        if (userAvatarElement) {
            userAvatarElement.textContent = profile.username.substring(0, 2).toUpperCase();
        }
    }

    // Update dashboard stats
    updateDashboardStats(items) {
        const stats = {
            totalItems: items.length,
            activeItems: items.filter(item => item.status === 'available').length,
            totalValue: items.reduce((sum, item) => sum + item.price, 0),
            pointsEarned: items.reduce((sum, item) => sum + Math.round(item.price / 10), 0)
        };
        
        // Update stats elements
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

    // Add to cart
    addToCart(itemId) {
        const item = this.allItems.find(item => item._id === itemId);
        if (!item) return;
        
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find(cartItem => cartItem._id === itemId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartDisplay();
        UI.showMessage(`${item.title} added to cart!`, 'success');
    }

    // Update cart display
    updateCartDisplay() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const cartCount = document.getElementById('cart-count');
        const cartItems = document.getElementById('cart-items');
        
        if (cartCount) {
            cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        }
        
        if (cartItems) {
            if (cart.length === 0) {
                cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            } else {
                cartItems.innerHTML = cart.map(item => `
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
                        <button class="btn btn-small btn-danger" onclick="pageLoader.removeFromCart('${item._id}')">Remove</button>
                    </div>
                `).join('');
            }
        }
    }

    // Remove from cart
    removeFromCart(itemId) {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart = cart.filter(item => item._id !== itemId);
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartDisplay();
        UI.showMessage('Item removed from cart', 'info');
    }

    // View item details
    viewItemDetails(itemId) {
        const item = this.allItems.find(item => item._id === itemId);
        if (!item) return;
        
        localStorage.setItem('selectedItem', JSON.stringify(item));
        window.location.href = 'itemDetail.html';
    }

    // Edit item
    editItem(itemId) {
        const item = this.userItems.find(item => item._id === itemId);
        if (!item) return;
        
        localStorage.setItem('editingItem', JSON.stringify(item));
        window.location.href = 'add_items.html?edit=true';
    }

    // Delete item
    async deleteItem(itemId) {
        if (!confirm('Are you sure you want to delete this item?')) return;
        
        try {
            await API.deleteItem(itemId);
            this.userItems = this.userItems.filter(item => item._id !== itemId);
            this.displayUserItems(this.userItems);
            this.updateDashboardStats(this.userItems);
            UI.showMessage('Item deleted successfully', 'success');
        } catch (error) {
            UI.showMessage('Failed to delete item', 'error');
        }
    }

    // Handle logout
    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            API.logout();
            window.location.href = 'index.html';
        }
    }

    // Apply filters
    applyFilters() {
        const category = document.getElementById('categoryFilter')?.value;
        const size = document.getElementById('sizeFilter')?.value;
        const condition = document.getElementById('conditionFilter')?.value;
        
        let filteredItems = [...this.allItems];
        
        if (category) {
            filteredItems = filteredItems.filter(item => item.category === category);
        }
        if (size) {
            filteredItems = filteredItems.filter(item => item.size === size);
        }
        if (condition) {
            filteredItems = filteredItems.filter(item => item.condition === condition);
        }
        
        this.displayBrowseItems(filteredItems);
    }

    // Apply search
    applySearch() {
        const searchQuery = document.getElementById('searchInput')?.value.toLowerCase();
        
        if (!searchQuery) {
            this.displayBrowseItems(this.allItems);
            return;
        }
        
        const filteredItems = this.allItems.filter(item => 
            item.title.toLowerCase().includes(searchQuery) ||
            item.description.toLowerCase().includes(searchQuery) ||
            item.category.toLowerCase().includes(searchQuery)
        );
        
        this.displayBrowseItems(filteredItems);
    }

    // Toggle cart
    toggleCart() {
        const cartSection = document.getElementById('cart-section');
        if (cartSection) {
            cartSection.classList.toggle('show');
        }
    }
}

// Initialize page loader
const pageLoader = new PageLoader();

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    pageLoader.init();
}); 