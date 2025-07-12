// Form Handler - Manages item creation and editing forms
class FormHandler {
    constructor() {
        this.currentItem = null;
        this.selectedImages = [];
        this.isEditMode = false;
    }

    // Initialize form handler
    init() {
        this.setupFormListeners();
        this.checkEditMode();
        this.setupImageUpload();
    }

    // Check if we're in edit mode
    checkEditMode() {
        const urlParams = new URLSearchParams(window.location.search);
        this.isEditMode = urlParams.get('edit') === 'true';

        if (this.isEditMode) {
            this.loadItemForEdit();
        }
    }

    // Load item data for editing
    loadItemForEdit() {
        const itemData = localStorage.getItem('editingItem');
        if (!itemData) {
            UI.showMessage('No item data found for editing', 'error');
            window.location.href = 'dashboard.html';
            return;
        }

        this.currentItem = JSON.parse(itemData);
        this.populateForm(this.currentItem);
    }

    // Populate form with item data
    populateForm(item) {
        // Set form fields
        document.getElementById('itemTitle').value = item.title || '';
        document.getElementById('itemDescription').value = item.description || '';
        document.getElementById('itemPrice').value = item.price || '';
        document.getElementById('itemCategory').value = item.category || '';
        document.getElementById('itemSize').value = item.size || '';
        document.getElementById('itemCondition').value = item.condition || '';

        // Display existing images
        if (item.images && item.images.length > 0) {
            this.displayExistingImages(item.images);
        }

        // Update form title
        const formTitle = document.getElementById('form-title');
        if (formTitle) {
            formTitle.textContent = 'Edit Item';
        }

        // Update submit button
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.textContent = 'Update Item';
        }
    }

    // Display existing images
    displayExistingImages(images) {
        const imagePreview = document.getElementById('image-preview');
        if (!imagePreview) return;

        imagePreview.innerHTML = images.map((img, index) => `
            <div class="image-preview-item">
                <img src="${img}" alt="Item image ${index + 1}">
                <button type="button" class="remove-image" onclick="formHandler.removeExistingImage(${index})">×</button>
            </div>
        `).join('');
    }

    // Remove existing image
    removeExistingImage(index) {
        if (this.currentItem && this.currentItem.images) {
            this.currentItem.images.splice(index, 1);
            this.displayExistingImages(this.currentItem.images);
        }
    }

    // Setup form event listeners
    setupFormListeners() {
        const form = document.getElementById('item-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }

        // Real-time validation
        this.setupValidation();
    }

    // Setup form validation
    setupValidation() {
        const titleInput = document.getElementById('itemTitle');
        const priceInput = document.getElementById('itemPrice');
        const descriptionInput = document.getElementById('itemDescription');

        if (titleInput) {
            titleInput.addEventListener('input', () => {
                this.validateField(titleInput, 'Title is required', (value) => value.length > 0);
            });
        }

        if (priceInput) {
            priceInput.addEventListener('input', () => {
                this.validateField(priceInput, 'Valid price required', (value) => {
                    const price = parseFloat(value);
                    return !isNaN(price) && price > 0;
                });
            });
        }

        if (descriptionInput) {
            descriptionInput.addEventListener('input', () => {
                this.validateField(descriptionInput, 'Description is required', (value) => value.length > 10);
            });
        }
    }

    // Validate individual field
    validateField(field, errorMessage, validator) {
        const value = field.value.trim();
        const isValid = validator(value);
        
        if (!isValid) {
            field.classList.add('error');
            this.showFieldError(field, errorMessage);
        } else {
            field.classList.remove('error');
            this.hideFieldError(field);
        }
        
        return isValid;
    }

    // Show field error
    showFieldError(field, message) {
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    // Hide field error
    hideFieldError(field) {
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    // Setup image upload functionality
    setupImageUpload() {
        const imageInput = document.getElementById('itemImages');
        if (!imageInput) return;

        imageInput.addEventListener('change', (e) => {
            this.handleImageSelection(e.target.files);
        });
    }

    // Handle image selection
    handleImageSelection(files) {
        this.selectedImages = Array.from(files);
        this.displayImagePreviews();
    }

    // Display image previews
    displayImagePreviews() {
        const previewContainer = document.getElementById('image-preview');
        if (!previewContainer) return;

        const previews = this.selectedImages.map((file, index) => {
            const reader = new FileReader();
            return new Promise((resolve) => {
                reader.onload = (e) => {
                    resolve(`
                        <div class="image-preview-item">
                            <img src="${e.target.result}" alt="Preview ${index + 1}">
                            <button type="button" class="remove-image" onclick="formHandler.removeSelectedImage(${index})">×</button>
                        </div>
                    `);
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(previews).then(htmlArray => {
            previewContainer.innerHTML = htmlArray.join('');
        });
    }

    // Remove selected image
    removeSelectedImage(index) {
        this.selectedImages.splice(index, 1);
        this.displayImagePreviews();
    }

    // Handle form submission
    async handleFormSubmit() {
        const submitBtn = document.getElementById('submit-btn');
        const originalText = submitBtn ? submitBtn.textContent : '';
        try {
            // Validate form
            if (!this.validateForm()) {
                return;
            }

            // Get form data
            const formData = this.getFormData();
            
            // Show loading state
            UI.showLoading(submitBtn);

            if (this.isEditMode) {
                await this.updateItem(formData);
            } else {
                await this.createItem(formData);
            }

        } catch (error) {
            UI.showMessage(error.message, 'error');
        } finally {
            if (submitBtn) UI.hideLoading(submitBtn, originalText);
        }
    }

    // Validate entire form
    validateForm() {
        const titleInput = document.getElementById('itemTitle');
        const priceInput = document.getElementById('itemPrice');
        const descriptionInput = document.getElementById('itemDescription');
        const categoryInput = document.getElementById('itemCategory');
        const sizeInput = document.getElementById('itemSize');

        const validations = [
            this.validateField(titleInput, 'Title is required', (value) => value.length > 0),
            this.validateField(priceInput, 'Valid price required', (value) => {
                const price = parseFloat(value);
                return !isNaN(price) && price > 0;
            }),
            this.validateField(descriptionInput, 'Description must be at least 10 characters', (value) => value.length >= 10),
            this.validateField(categoryInput, 'Category is required', (value) => value.length > 0),
            this.validateField(sizeInput, 'Size is required', (value) => value.length > 0)
        ];

        return validations.every(valid => valid);
    }

    // Get form data
    getFormData() {
        return {
            title: document.getElementById('itemTitle').value.trim(),
            description: document.getElementById('itemDescription').value.trim(),
            price: parseFloat(document.getElementById('itemPrice').value),
            category: document.getElementById('itemCategory').value,
            size: document.getElementById('itemSize').value,
            condition: document.getElementById('itemCondition').value
        };
    }

    // Create new item
    async createItem(formData) {
        try {
            const item = await API.createItem(formData, this.selectedImages);
            UI.showMessage('Item created successfully!', 'success');
            
            // Redirect to dashboard after short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } catch (error) {
            throw new Error(`Failed to create item: ${error.message}`);
        }
    }

    // Update existing item
    async updateItem(formData) {
        try {
            if (!this.currentItem) {
                throw new Error('No item data for editing');
            }

            const item = await API.updateItem(this.currentItem._id, formData, this.selectedImages);
            UI.showMessage('Item updated successfully!', 'success');
            
            // Clear editing data
            localStorage.removeItem('editingItem');
            
            // Redirect to dashboard after short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } catch (error) {
            throw new Error(`Failed to update item: ${error.message}`);
        }
    }

    // Reset form
    resetForm() {
        const form = document.getElementById('item-form');
        if (form) {
            form.reset();
        }
        
        this.selectedImages = [];
        this.currentItem = null;
        this.isEditMode = false;
        
        // Clear image preview
        const imagePreview = document.getElementById('image-preview');
        if (imagePreview) {
            imagePreview.innerHTML = '';
        }
        
        // Reset form title and button
        const formTitle = document.getElementById('form-title');
        const submitBtn = document.getElementById('submit-btn');
        
        if (formTitle) {
            formTitle.textContent = 'Add New Item';
        }
        if (submitBtn) {
            submitBtn.textContent = 'Add Item';
        }
    }

    // Cancel form
    cancelForm() {
        if (this.isEditMode) {
            localStorage.removeItem('editingItem');
        }
        window.location.href = 'dashboard.html';
    }
}

// Initialize form handler
const formHandler = new FormHandler();

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    formHandler.init();
}); 