const API_CONFIG = {
    BASE_URL: 'http://localhost:8000',
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/api/v1/auth/login',
            REGISTER: '/api/v1/auth/register'
        },
        USERS: {
            ME: '/api/v1/users/me',
            PROFILE: '/api/v1/users/profile'
        }
    }
};

// Function to get full API URL
function getApiUrl(endpoint) {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
} 