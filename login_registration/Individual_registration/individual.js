document.getElementById("individualForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent page reload

    const formData = {
        name: document.getElementById("legal_name").value,
        email: document.getElementById("govt_id").value, // Using govt_id field for email temporarily
        password: document.getElementById("password").value,
        phone_number: document.getElementById("phone_no").value,
        address: document.getElementById("address").value,
        pin_code: document.getElementById("pin_code").value,
        role: 'buyer',
        // Additional individual-specific fields
        age: parseInt(document.getElementById("age").value, 10)
    };

    console.log("Submitting data:", formData); // Debugging

    try {
        const response = await fetch("https://api.ysinghc.me/api/v1/users/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (response.ok) {
            alert("Registration Successful! Redirecting to login...");
            window.location.href = "https://market.ysinghc.me/login_registration/Login_page/login.html";
        } else {
            if (response.status === 401) {
                alert("Unauthorized access. Please check your credentials.");
            } else if (response.status === 400) {
                alert("Invalid data. Please check the entered information.");
            } else {
                alert(`Registration Failed: ${data.detail}`);
            }
        }
    } catch (error) {
        alert("Error connecting to the server. Please try again.");
        console.error("Registration Error:", error);
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const passwordInput = document.getElementById("password");
    const eyeOpen = document.getElementById("eyeOpen");
    const eyeClosed = document.getElementById("eyeClosed");
    const togglePassword = document.getElementById("togglePassword");

    // Ensure password is hidden initially & correct eye is shown
    passwordInput.type = "password";
    eyeOpen.style.display = "none";   // Hide open eye
    eyeClosed.style.display = "inline"; // Show closed eye

    togglePassword.addEventListener("click", function () {
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
});
