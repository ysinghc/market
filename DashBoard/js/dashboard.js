// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/DashBoard/js/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Initialize offline storage
let offlineStorage;
document.addEventListener('DOMContentLoaded', async () => {
    offlineStorage = new OfflineStorage();
    await checkAuthAndLoadData();
});

// Check authentication and load data
async function checkAuthAndLoadData() {
    const isAuthenticated = await handleOfflineAuth();
    
    if (!isAuthenticated) {
        // If not authenticated and offline, redirect to login
        if (isOffline()) {
            window.location.href = '/login.html';
            return;
        }
        // If online, check server authentication
        try {
            const response = await fetch('/api/auth/check');
            if (!response.ok) {
                window.location.href = '/login.html';
                return;
            }
            const userData = await response.json();
            await offlineStorage.saveUser(userData);
        } catch (error) {
            console.error('Authentication check failed:', error);
            window.location.href = '/login.html';
            return;
        }
    }

    // Load dashboard data
    await loadDashboardData();
}

// Load dashboard data
async function loadDashboardData() {
    try {
        if (isOffline()) {
            // Load from IndexedDB
            const inventory = await offlineStorage.getInventory();
            const orders = await offlineStorage.getOrders();
            updateDashboardUI(inventory, orders);
        } else {
            // Fetch from server
            const [inventoryResponse, ordersResponse] = await Promise.all([
                fetch('/api/inventory'),
                fetch('/api/orders')
            ]);

            if (!inventoryResponse.ok || !ordersResponse.ok) {
                throw new Error('Failed to fetch data');
            }

            const inventory = await inventoryResponse.json();
            const orders = await ordersResponse.json();

            // Save to IndexedDB for offline use
            await offlineStorage.saveInventory(inventory);
            await offlineStorage.saveOrders(orders);

            updateDashboardUI(inventory, orders);
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Failed to load dashboard data');
    }
}

// Update dashboard UI
function updateDashboardUI(inventory, orders) {
    // Update inventory summary
    const inventorySummary = document.getElementById('inventory-summary');
    if (inventorySummary) {
        inventorySummary.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Inventory Summary</h5>
                    <p>Total Items: ${inventory.length}</p>
                    <p>Low Stock Items: ${inventory.filter(item => item.quantity < 10).length}</p>
                </div>
            </div>
        `;
    }

    // Update recent orders
    const recentOrders = document.getElementById('recent-orders');
    if (recentOrders) {
        recentOrders.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Recent Orders</h5>
                    <div class="list-group">
                        ${orders.slice(0, 5).map(order => `
                            <div class="list-group-item">
                                <div class="d-flex justify-content-between">
                                    <h6 class="mb-1">Order #${order.id}</h6>
                                    <small>${new Date(order.date).toLocaleDateString()}</small>
                                </div>
                                <p class="mb-1">${order.items.length} items</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger alert-dismissible fade show';
    errorDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.querySelector('.main').prepend(errorDiv);
}

// Handle logout
document.querySelector('.dropdown-item[href="#"]').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        if (!isOffline()) {
            await fetch('/api/auth/logout', { method: 'POST' });
        }
        // Clear offline storage
        await offlineStorage.saveUser(null);
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Logout failed:', error);
    }
}); 