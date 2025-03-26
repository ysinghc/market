document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const apiUrl = "https://farmsync.ysinghc.me/auth/login";

    const phoneNumber = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!phoneNumber || !password) {
        alert("Please enter both phone number and password.");
        return;
    }

    const data = { phone_no: phoneNumber, password: password };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            alert("Login Successful!");

            const userType = result.user_type;
            const user = result.user_details;

            // Store user details in cookies
            document.cookie = `user_type=${userType}; path=/`;
            document.cookie = `user_id=${user.id}; path=/`;
            document.cookie = `user_name=${user.legal_name || user.owner_name}; path=/`;
            document.cookie = `phone=${user.contact_number || user.phone_no}; path=/`;
            document.cookie = `address=${user.address || user.shop_location}; path=/`;
            document.cookie = `pin_code=${user.pin_code}; path=/`;
            document.cookie = `govt_id=${user.govt_id}; path=/`; // Pe8f4
            document.cookie = `age=${user.age}; path=/`;
            document.cookie = `state_of_residence=${user.state_of_residence}; path=/`;

            // Redirect based on user type
            if (userType === "farmer") {
                window.location.href = "https://farmsync-github-io.pages.dev/DashBoard/farmer_dashboard.html";
            } else if (userType === "individual") {
                window.location.href = "https://farmsync-github-io.pages.dev/profiles/individual_profile/individual_profile.html";
            } else if (userType === "restaurant") {
                window.location.href = "https://farmsync-github-io.pages.dev/profiles/restraunt_profile/restraunt_profile.html";
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
        alert("Failed to connect to the API");
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
