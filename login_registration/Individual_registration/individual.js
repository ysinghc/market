document.getElementById("individualForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent page reload

    const formData = {
        legal_name: document.getElementById("legal_name").value,
        govt_id: document.getElementById("govt_id").value,
        phone_no: document.getElementById("phone_no").value,
        age: parseInt(document.getElementById("age").value, 10),
        address: document.getElementById("address").value,
        pin_code: parseInt(document.getElementById("pin_code").value, 10),
        password: document.getElementById("password").value
    };

    console.log("Submitting data:", formData); // Debugging

    try {
        const response = await fetch("https://farmsync.ysinghc.me/auth/users/register/individual", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (response.ok) {
            alert("Registration Successful! Redirecting to login...");
            window.location.href = "https://farmsync-github-io.pages.dev/loginform.html"; // ✅ Redirect to frontend login page
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
