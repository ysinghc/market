// API Configuration
const API_BASE_URL = 'https://api.ysinghc.me/api/v1';

// Get authentication token from localStorage
const token = localStorage.getItem('token');

// Check if user is authenticated
function checkAuth() {
    if (!token) {
        window.location.href = '/login_registration/Login_page/login.html';
        return false;
    }
    return true;
}

// Make API request with authentication
async function apiRequest(endpoint, options = {}) {
    if (!checkAuth()) return null;

    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        });

        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login_registration/Login_page/login.html';
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        return null;
    }
}

// Load dashboard data
async function loadDashboardData() {
    if (!checkAuth()) return;

    try {
        // Get user profile
        const userData = await apiRequest('/users/me');
        if (userData) {
            document.getElementById('userName').textContent = userData.name;
        }

        // Get crops
        const cropsData = await apiRequest('/crops');
        if (cropsData) {
            updateCropsList(cropsData);
        }

        // Get orders
        const ordersData = await apiRequest('/orders');
        if (ordersData) {
            updateOrdersList(ordersData);
        }

        // Get reviews
        const reviewsData = await apiRequest('/reviews');
        if (reviewsData) {
            updateReviewsList(reviewsData);
        }

        // Get dashboard stats
        const statsData = await apiRequest('/dashboard/stats');
        if (statsData) {
            updateDashboardStats(statsData);
        }
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
}

// Update crops list in the UI
function updateCropsList(crops) {
    const cropsList = document.getElementById('cropsList');
    if (!cropsList) return;

    cropsList.innerHTML = crops.map(crop => `
        <div class="crop-item">
            <h3>${crop.name}</h3>
            <p>Quantity: ${crop.quantity} ${crop.unit}</p>
            <p>Price: ₹${crop.price_per_unit}</p>
            <p>Status: ${crop.status}</p>
        </div>
    `).join('');
}

// Update orders list in the UI
function updateOrdersList(orders) {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;

    ordersList.innerHTML = orders.map(order => `
        <div class="order-item">
            <h3>Order #${order.id}</h3>
            <p>Customer: ${order.buyer_name}</p>
            <p>Total: ₹${order.total_amount}</p>
            <p>Status: ${order.status}</p>
        </div>
    `).join('');
}

// Update reviews list in the UI
function updateReviewsList(reviews) {
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) return;

    reviewsList.innerHTML = reviews.map(review => `
        <div class="review-item">
            <h3>${review.buyer_name}</h3>
            <p>Rating: ${review.rating}/5</p>
            <p>${review.comment}</p>
        </div>
    `).join('');
}

// Update dashboard statistics
function updateDashboardStats(stats) {
    document.getElementById('totalCrops').textContent = stats.total_crops || 0;
    document.getElementById('totalOrders').textContent = stats.total_orders || 0;
    document.getElementById('totalRevenue').textContent = `₹${stats.total_revenue || 0}`;
    document.getElementById('averageRating').textContent = stats.average_rating || '0.0';
}

// Load dashboard data when page loads
document.addEventListener('DOMContentLoaded', loadDashboardData); 