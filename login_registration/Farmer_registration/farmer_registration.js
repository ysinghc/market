document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("farmerForm").addEventListener("submit", async function(event) {
        event.preventDefault(); // Prevent default form submission

        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm_password").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const formData = {
            name: document.getElementById("legal_name").value,
            email: document.getElementById("email").value,
            password: password,
            phone_number: document.getElementById("contact_number").value,
            address: document.getElementById("address").value,
            pin_code: document.getElementById("pin_code").value,
            role: 'farmer',
            // Additional farmer-specific fields
            age: parseInt(document.getElementById("age").value, 10),
            state_of_residence: document.getElementById("state_of_residence").value,
            govt_id: document.getElementById("govt_id").value
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

    // Toggle Password Visibility
    function setupPasswordToggle(inputId, toggleId, openEyeId, closedEyeId) {
        const input = document.getElementById(inputId);
        const toggle = document.getElementById(toggleId);
        const eyeOpen = document.getElementById(openEyeId);
        const eyeClosed = document.getElementById(closedEyeId);

        toggle.addEventListener("click", function () {
            if (input.type === "password") {
                input.type = "text";
                eyeOpen.style.display = "inline";
                eyeClosed.style.display = "none";
            } else {
                input.type = "password";
                eyeOpen.style.display = "none";
                eyeClosed.style.display = "inline";
            }
        });
    }

    // Setup password toggles for both password fields
    setupPasswordToggle("password", "togglePassword", "eyeOpen", "eyeClosed");
    setupPasswordToggle("confirm_password", "toggleConfirmPassword", "confirmEyeOpen", "confirmEyeClosed");
});
