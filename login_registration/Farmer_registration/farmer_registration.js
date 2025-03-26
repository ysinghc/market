document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("farmerForm").addEventListener("submit", async function(event) {
        event.preventDefault(); // Prevent default form submission

        const formData = {
            legal_name: document.getElementById("legal_name").value,
            govt_id: document.getElementById("govt_id").value,
            contact_number: document.getElementById("contact_number").value,
            age: parseInt(document.getElementById("age").value, 10),
            state_of_residence: document.getElementById("state_of_residence").value,
            pin_code: parseInt(document.getElementById("pin_code").value, 10),
            address: document.getElementById("address").value,
            password: document.getElementById("password").value
        };

        console.log("Submitting data:", formData); // Debugging

        try {
            const response = await fetch("https://farmsync.ysinghc.me/auth/users/register/farmer", {
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
