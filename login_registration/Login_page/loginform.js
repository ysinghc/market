// Import API configuration
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

document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("phone").value.trim(); // Using phone field for email
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    try {
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN), {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            alert("Login Successful!");

            // Store token in localStorage
            localStorage.setItem('token', result.access_token);
            
            // Get user details
            const userResponse = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.USERS.ME), {
                headers: {
                    "Authorization": `Bearer ${result.access_token}`
                }
            });
            
            const userData = await userResponse.json();
            
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
        } else {
            if (response.status === 401) {
                alert("Unauthorized access. Please check your credentials.");
            } else if (response.status === 400) {
                alert("Invalid data. Please check the entered information.");
            } else {
                alert("Login Failed: " + (result.detail || "Invalid credentials"));
            }
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to connect to the API. Please check if the backend server is running.");
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
