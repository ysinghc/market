document.getElementById("restaurantForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent default form submission

    const formData = {
        name: document.getElementById("owner_name").value,
        email: document.getElementById("gstin").value, // Using GSTIN field for email temporarily
        password: document.getElementById("password").value,
        phone_number: document.getElementById("phone_no").value,
        address: document.getElementById("shop_location").value,
        pin_code: document.getElementById("pin_code").value,
        role: 'admin',
        // Additional restaurant-specific fields
        age: parseInt(document.getElementById("age").value, 10),
        gstin: document.getElementById("gstin").value,
        fssai_license: document.getElementById("fssai_license").value
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
document.getElementById("togglePassword").addEventListener("click", function () {
    const passwordInput = document.getElementById("password");
    const eyeOpen = document.getElementById("eyeOpen");
    const eyeClosed = document.getElementById("eyeClosed");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeOpen.style.display = "none";
        eyeClosed.style.display = "inline";
    } else {
        passwordInput.type = "password";
        eyeOpen.style.display = "inline";
        eyeClosed.style.display = "none";
    }
});
