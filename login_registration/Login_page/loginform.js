import { API_ENDPOINTS, API } from '../../js/config.js';

// Function to get full API URL
function getApiUrl(endpoint) {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// Function to log API requests
function logApiRequest(url, method, data) {
    console.log(`API Request: ${method} ${url}`);
    console.log('Request Data:', data);
}

// Function to log API responses
function logApiResponse(response, data) {
    console.log(`API Response: ${response.status} ${response.statusText}`);
    console.log('Response Data:', data);
}

document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    try {
        const response = await fetch(API.getFullUrl(API_ENDPOINTS.AUTH.LOGIN), {
            method: "POST",
            body: formData
        });

        const result = await API.handleResponse(response);
        
        // Store token in localStorage
        localStorage.setItem('token', result.access_token);
        
        // Get user details
        const userResponse = await fetch(API.getFullUrl(API_ENDPOINTS.USERS.ME), {
            headers: API.getHeaders(result.access_token)
        });
        
        const userData = await API.handleResponse(userResponse);
        
        // Store user details in cookies
        document.cookie = `user_type=${userData.role}; path=/`;
        document.cookie = `user_id=${userData.id}; path=/`;
        document.cookie = `user_name=${userData.name}; path=/`;
        document.cookie = `email=${userData.email}; path=/`;
        if (userData.phone_number) {
            document.cookie = `phone=${userData.phone_number}; path=/`;
        }

        // Redirect based on user role
        if (userData.role === "farmer") {
            window.location.href = "/DashBoard/farmer_dashboard.html";
        } else if (userData.role === "buyer") {
            window.location.href = "/profiles/individual_profile/individual_profile.html";
        } else if (userData.role === "admin") {
            window.location.href = "/profiles/restraunt_profile/restraunt_profile.html";
        }
    } catch (error) {
        console.error("Error:", error);
        alert(error.message || "Failed to connect to the API. Please try again.");
    }
});

// Toggle Password Visibility
document.getElementById("togglePassword").addEventListener("click", function () {
    const passwordInput = document.getElementById("password");
    const eyeOpen = document.getElementById("eyeOpen");
    const eyeClosed = document.getElementById("eyeClosed");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";  // Show password
        eyeOpen.style.display = "inline"; // Show open eye
        eyeClosed.style.display = "none"; // Hide closed eye
    } else {
        passwordInput.type = "password";  // Hide password
        eyeOpen.style.display = "none"; // Hide open eye
        eyeClosed.style.display = "inline"; // Show closed eye
    }
});
