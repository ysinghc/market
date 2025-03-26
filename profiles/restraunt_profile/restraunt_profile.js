function getCookie(name) {
    const cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
        let [key, value] = cookie.split('=');
        if (key === name) {
            return decodeURIComponent(value);
        }
    }
    return "N/A"; // Return "N/A" if not found
}

function populateProfile() {
    try {
        const userType = getCookie("user_type");

        let restaurantName = getCookie("user_name");
        let restaurantPhone = getCookie("phone");
        let restaurantAddress = getCookie("address");
        let restaurantPin = getCookie("pin_code");
        let restaurantGovtId = getCookie("govt_id");
        let restaurantState = getCookie("state_of_residence");

        // Update the profile fields in the HTML
        if (restaurantName) document.getElementById("restaurant-name").innerText = restaurantName;
        if (restaurantPhone) document.getElementById("restaurant-phone").innerText = `Phone No.: ${restaurantPhone}`;
        if (restaurantAddress) document.getElementById("restaurant-address").innerText = `Address: ${restaurantAddress}`;
        if (restaurantPin) document.getElementById("restaurant-pin").innerText = `Pin Code: ${restaurantPin}`;
        if (restaurantGovtId) document.getElementById("restaurant-govt-id").innerText = `Government ID: ${restaurantGovtId}`;
        if (restaurantState) document.getElementById("restaurant-state").innerText = `State: ${restaurantState}`;
        if (userType) document.getElementById("user-type").innerText = `${userType}`;
    } catch (error) {
        console.error("Error populating profile:", error);
        alert("Failed to load profile data. Please try again.");
    }
}

document.addEventListener("DOMContentLoaded", populateProfile);
