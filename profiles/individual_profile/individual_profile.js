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

        let userName = getCookie("user_name");
        let userPhone = getCookie("phone");
        let userAddress = getCookie("address");
        let userPin = getCookie("pin_code");
        let userGovtId = getCookie("govt_id");
        let userAge = getCookie("age");
        let userState = getCookie("state_of_residence");

        // Update the profile fields in the HTML
        if (userName) document.getElementById("user-name").innerText = userName;
        if (userPhone) document.getElementById("user-phone").innerText = `Phone No.: ${userPhone}`;
        if (userAddress) document.getElementById("user-address").innerText = `Address: ${userAddress}`;
        if (userPin) document.getElementById("user-pin").innerText = `Pin Code: ${userPin}`;
        if (userGovtId) document.getElementById("user-govt-id").innerText = `Government ID: ${userGovtId}`;
        if (userAge) document.getElementById("user-age").innerText = `Age: ${userAge}`;
        if (userState) document.getElementById("user-state").innerText = `State: ${userState}`;
        if (userType) document.getElementById("user-type").innerText = `${userType}`;
    } catch (error) {
        console.error("Error populating profile:", error);
        alert("Failed to load profile data. Please try again.");
    }
}

document.addEventListener("DOMContentLoaded", populateProfile);
