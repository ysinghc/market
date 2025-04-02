class OfflineStorage {
    constructor() {
        this.dbName = 'farmsync-offline';
        this.dbVersion = 1;
        this.db = null;
        this.initDB();
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create stores for different types of data
                if (!db.objectStoreNames.contains('user')) {
                    db.createObjectStore('user', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('inventory')) {
                    db.createObjectStore('inventory', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('orders')) {
                    db.createObjectStore('orders', { keyPath: 'id' });
                }
            };
        });
    }

    async saveUser(userData) {
        const store = this.db.transaction('user', 'readwrite').objectStore('user');
        await store.put(userData);
    }

    async getUser() {
        const store = this.db.transaction('user', 'readonly').objectStore('user');
        return await store.get(1);
    }

    async saveInventory(inventoryData) {
        const store = this.db.transaction('inventory', 'readwrite').objectStore('inventory');
        await store.put(inventoryData);
    }

    async getInventory() {
        const store = this.db.transaction('inventory', 'readonly').objectStore('inventory');
        return await store.get(1);
    }

    async saveOrders(ordersData) {
        const store = this.db.transaction('orders', 'readwrite').objectStore('orders');
        await store.put(ordersData);
    }

    async getOrders() {
        const store = this.db.transaction('orders', 'readonly').objectStore('orders');
        return await store.get(1);
    }
}

// Initialize offline storage
const offlineStorage = new OfflineStorage();

// Function to check if user is offline
function isOffline() {
    return !navigator.onLine;
}

// Function to handle offline authentication
async function handleOfflineAuth() {
    if (isOffline()) {
        const user = await offlineStorage.getUser();
        if (user) {
            // User is authenticated offline
            return true;
        }
    }
    return false;
}

// Event listeners for online/offline status
window.addEventListener('online', () => {
    console.log('Back online');
    // Sync data when back online
    syncOfflineData();
});

window.addEventListener('offline', () => {
    console.log('Gone offline');
    // Show offline indicator
    showOfflineIndicator();
});

// Function to sync data when back online
async function syncOfflineData() {
    // Implement your sync logic here
    // This would typically involve sending any offline changes to the server
}

// Function to show offline indicator
function showOfflineIndicator() {
    // Implement your offline indicator UI here
    const indicator = document.createElement('div');
    indicator.id = 'offline-indicator';
    indicator.textContent = 'You are currently offline';
    document.body.appendChild(indicator);
} 