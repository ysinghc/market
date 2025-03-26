// Products data - would normally come from a backend
const products = [
    {
        id: 1,
        name: 'Wheat',
        category: 'grains',
        price: 32,
        farmer: 'John Doe',
        image: 'images/wheat.jpg',
        description: 'Premium quality wheat, organically grown without pesticides. Perfect for baking bread and pastries.',
        quantity: 500,
        harvestDate: '2023-10-15',
        rating: 4.5
    },
    {
        id: 2,
        name: 'Rice',
        category: 'grains',
        price: 40,
        farmer: 'Jane Smith',
        image: 'images/rice.jpg',
        description: 'Premium Basmati rice, known for its aroma and length. Ideal for biryanis and pulao dishes.',
        quantity: 450,
        harvestDate: '2023-09-25',
        rating: 4.7
    },
    {
        id: 3,
        name: 'Corn',
        category: 'grains',
        price: 28,
        farmer: 'Bob Johnson',
        image: 'images/corn.jpg',
        description: 'Sweet corn with plump, juicy kernels. Perfect for grilling, boiling, or adding to salads.',
        quantity: 300,
        harvestDate: '2023-10-05',
        rating: 4.3
    },
    {
        id: 4,
        name: 'Tomatoes',
        category: 'vegetables',
        price: 45,
        farmer: 'Alice Brown',
        image: 'images/tomatoes.jpg',
        description: 'Juicy, ripe tomatoes grown in nutrient-rich soil. Great for salads, sauces, and soups.',
        quantity: 200,
        harvestDate: '2023-10-18',
        rating: 4.8
    },
    {
        id: 5,
        name: 'Potatoes',
        category: 'vegetables',
        price: 25,
        farmer: 'Charlie Davis',
        image: 'images/potatoes.jpg',
        description: 'Fresh, firm potatoes perfect for mashing, frying, or roasting. Versatile and delicious.',
        quantity: 600,
        harvestDate: '2023-10-10',
        rating: 4.6
    },
    {
        id: 6,
        name: 'Apples',
        category: 'fruits',
        price: 60,
        farmer: 'Emily Wilson',
        image: 'images/apples.jpg',
        description: 'Crisp, juicy apples with the perfect balance of sweetness and tartness. Great for eating fresh or baking.',
        quantity: 350,
        harvestDate: '2023-10-12',
        rating: 4.9
    },
    {
        id: 7,
        name: 'Chickpeas',
        category: 'pulses',
        price: 75,
        farmer: 'Frank Miller',
        image: 'images/chickpeas.jpg',
        description: 'High-protein chickpeas perfect for curries, hummus, and salads. Sustainably grown.',
        quantity: 400,
        harvestDate: '2023-09-20',
        rating: 4.4
    },
    {
        id: 8,
        name: 'Mangoes',
        category: 'fruits',
        price: 90,
        farmer: 'Grace Lee',
        image: 'images/mangoes.jpg',
        description: 'Sweet, juicy mangoes with fiber-free pulp. Picked at the perfect ripeness for maximum flavor.',
        quantity: 150,
        harvestDate: '2023-10-08',
        rating: 5.0
    },
    {
        id: 9,
        name: 'Lentils',
        category: 'pulses',
        price: 65,
        farmer: 'Henry Clark',
        image: 'images/lentils.jpg',
        description: 'Nutritious lentils that cook quickly and are perfect for soups and stews. High in protein and fiber.',
        quantity: 450,
        harvestDate: '2023-09-15',
        rating: 4.5
    }
];

// Cart data
let cart = [];
let currentView = 'grid';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    displayProducts(products);
    updatePriceRangeValue();
    setupEventListeners();
    
    // Load cart from localStorage if available
    const savedCart = localStorage.getItem('farmsyncCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }
});

function setupEventListeners() {
    // Price range
    document.getElementById('priceRange').addEventListener('input', updatePriceRangeValue);
    
    // Apply filters button
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    
    // View options
    document.querySelectorAll('.view-options button').forEach(button => {
        button.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            changeView(view);
        });
    });
    
    // Search input
    document.getElementById('search').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
    
    // Modal quantity buttons
    document.getElementById('modalQuantity').addEventListener('change', function() {
        if (this.value < 1) this.value = 1;
    });
}

function updatePriceRangeValue() {
    const range = document.getElementById('priceRange');
    const value = document.getElementById('priceValue');
    value.textContent = `₹${range.value}`;
}

function applyFilters() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const priceRange = parseInt(document.getElementById('priceRange').value);
    const categories = [];
    
    // Get selected categories
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        categories.push(checkbox.value);
    });
    
    // Sort selection
    const sortBy = document.getElementById('sortBy').value;
    
    // Filter products
    let filteredProducts = products.filter(product => {
        // Search term
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                              product.farmer.toLowerCase().includes(searchTerm) ||
                              product.description.toLowerCase().includes(searchTerm);
        
        // Price
        const matchesPrice = product.price <= priceRange;
        
        // Categories
        const matchesCategory = categories.length === 0 || categories.includes(product.category);
        
        return matchesSearch && matchesPrice && matchesCategory;
    });
    
    // Sort products
    filteredProducts = sortProducts(filteredProducts, sortBy);
    
    // Display filtered products
    displayProducts(filteredProducts);
}

function sortProducts(products, sortBy) {
    switch(sortBy) {
        case 'price-asc':
            return [...products].sort((a, b) => a.price - b.price);
        case 'price-desc':
            return [...products].sort((a, b) => b.price - a.price);
        case 'name-asc':
            return [...products].sort((a, b) => a.name.localeCompare(b.name));
        case 'name-desc':
            return [...products].sort((a, b) => b.name.localeCompare(a.name));
        default:
            return products;
    }
}

function displayProducts(products) {
    const container = document.getElementById('products-container');
    
    // Clear container
    container.innerHTML = '';
    
    // Check if there are products to display
    if (products.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p>No products match your filters.</p></div>';
        return;
    }
    
    // Remove existing view class and add the current one
    container.className = 'row';
    container.classList.add(currentView === 'grid' ? 'products-grid' : 'products-list');
    
    // Add products
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = currentView === 'grid' ? 'col-md-6 col-lg-4' : 'col-12';
        
        productCard.innerHTML = `
            <div class="product-card">
                <div class="card-img-container">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.jpg'">
                    <span class="category-badge">${product.category}</span>
                </div>
                <div class="card-content">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-farmer">Farmer: ${product.farmer}</p>
                    <p class="card-price">₹${product.price} per kg</p>
                    ${currentView === 'list' ? `<p class="card-description">${product.description.substring(0, 100)}...</p>` : ''}
                    <div class="card-footer">
                        <button class="btn-view" onclick="showProductDetails(${product.id})">View Details</button>
                        <button class="btn-cart" onclick="quickAddToCart(${product.id})"><i class="fas fa-shopping-cart"></i></button>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(productCard);
    });
}

function changeView(view) {
    currentView = view;
    
    // Update active button
    document.querySelectorAll('.view-options button').forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-view') === view) {
            button.classList.add('active');
        }
    });
    
    // Re-display products with new view
    applyFilters();
}

function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Set modal content
    document.getElementById('modalProductTitle').textContent = product.name;
    document.getElementById('modalFarmerName').textContent = `Farmer: ${product.farmer}`;
    document.getElementById('modalProductPrice').textContent = `₹${product.price} per kg`;
    document.getElementById('modalProductDescription').textContent = product.description;
    document.getElementById('modalProductCategory').textContent = product.category;
    document.getElementById('modalHarvestDate').textContent = product.harvestDate;
    document.getElementById('modalAvailableQuantity').textContent = `${product.quantity} kg`;
    
    // Set image
    const modalImage = document.getElementById('modalProductImage');
    modalImage.src = product.image;
    modalImage.onerror = function() {
        this.src = 'images/placeholder.jpg';
    };
    
    // Reset quantity
    document.getElementById('modalQuantity').value = 1;
    
    // Set add to cart button action
    document.getElementById('modalAddToCart').onclick = function() {
        const quantity = parseInt(document.getElementById('modalQuantity').value);
        addToCart(product, quantity);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
        modal.hide();
    };
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

function quickAddToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        addToCart(product, 1);
    }
}

function addToCart(product, quantity) {
    // Check if product is already in cart
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex !== -1) {
        // Update quantity if already in cart
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new item to cart
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image: product.image
        });
    }
    
    // Save cart to localStorage
    localStorage.setItem('farmsyncCart', JSON.stringify(cart));
    
    // Update cart display
    updateCartDisplay();
    
    // Show message
    showMessage(`${quantity} kg of ${product.name} added to cart`);
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    
    // Update cart count
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Clear cart items
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<li class="empty-cart">Your cart is empty</li>';
        cartTotal.textContent = '₹0';
        return;
    }
    
    // Calculate total
    let total = 0;
    
    // Add items to cart
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('li');
        cartItem.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                ₹${item.price} × ${item.quantity} = ₹${itemTotal}
            </div>
            <button onclick="removeFromCart(${index})">Remove</button>
        `;
        
        cartItems.appendChild(cartItem);
    });
    
    // Update total
    cartTotal.textContent = `₹${total}`;
}

function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
        const removedItem = cart[index];
        cart.splice(index, 1);
        
        // Save cart to localStorage
        localStorage.setItem('farmsyncCart', JSON.stringify(cart));
        
        // Update cart display
        updateCartDisplay();
        
        // Show message
        showMessage(`${removedItem.name} removed from cart`);
    }
}

function toggleCartDropdown() {
    const cartDropdown = document.getElementById('cart-dropdown');
    cartDropdown.style.display = cartDropdown.style.display === 'block' ? 'none' : 'block';
}

function increaseQuantity() {
    const input = document.getElementById('modalQuantity');
    input.value = parseInt(input.value) + 1;
}

function decreaseQuantity() {
    const input = document.getElementById('modalQuantity');
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

function proceedToBuy() {
    if (cart.length === 0) {
        alert('Your cart is empty. Please add items before proceeding.');
        return;
    }
    
    // Normally this would redirect to a checkout page
    alert('Proceeding to checkout... (This would redirect to a checkout page in a real implementation)');
}

function showMessage(message) {
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = 'message-toast';
    messageElement.textContent = message;
    
    // Add to body
    document.body.appendChild(messageElement);
    
    // Show message
    setTimeout(() => {
        messageElement.classList.add('show');
    }, 100);
    
    // Hide and remove after 3 seconds
    setTimeout(() => {
        messageElement.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(messageElement);
        }, 300);
    }, 3000);
}

// Additional style for message toast
const style = document.createElement('style');
style.textContent = `
    .message-toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #0a0f43;
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
        z-index: 9999;
    }
    
    .message-toast.show {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style); 