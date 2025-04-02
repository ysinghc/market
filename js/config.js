const API_CONFIG = {
    // Development configuration
    development: {
        BASE_URL: 'http://localhost:8000',
        API_PREFIX: '/api/v1'
    },
    // Production configuration
    production: {
        BASE_URL: 'https://api.ysinghc.me',
        API_PREFIX: '/api/v1'
    }
};

// Determine the current environment
const ENV = window.location.hostname === 'localhost' ? 'development' : 'production';
const currentConfig = API_CONFIG[ENV];

// API endpoints
const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${currentConfig.API_PREFIX}/auth/login`,
        REGISTER: `${currentConfig.API_PREFIX}/auth/register`
    },
    USERS: {
        ME: `${currentConfig.API_PREFIX}/users/me`,
        PROFILE: `${currentConfig.API_PREFIX}/users/profile`
    },
    CROPS: {
        LIST: `${currentConfig.API_PREFIX}/crops`,
        CREATE: `${currentConfig.API_PREFIX}/crops`,
        UPLOAD_PHOTO: (cropId) => `${currentConfig.API_PREFIX}/crops/${cropId}/photo`
    },
    ORDERS: {
        LIST: `${currentConfig.API_PREFIX}/orders`,
        CREATE: `${currentConfig.API_PREFIX}/orders`,
        UPDATE: (orderId) => `${currentConfig.API_PREFIX}/orders/${orderId}`
    },
    REVIEWS: {
        LIST: `${currentConfig.API_PREFIX}/reviews`,
        CREATE: `${currentConfig.API_PREFIX}/reviews`,
        UPDATE: (reviewId) => `${currentConfig.API_PREFIX}/reviews/${reviewId}`
    }
};

// API utility functions
const API = {
    getFullUrl: (endpoint) => `${currentConfig.BASE_URL}${endpoint}`,
    
    // Headers configuration
    getHeaders: (token = null) => {
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    // Error handling
    handleResponse: async (response) => {
        if (!response.ok) {
            const error = await response.json().catch(() => ({
                detail: 'An unexpected error occurred'
            }));
            throw new Error(error.detail || 'An unexpected error occurred');
        }
        return response.json();
    }
};

// Export the configuration
export { API_ENDPOINTS, API }; 