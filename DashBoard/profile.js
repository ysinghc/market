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
    const userType = getCookie("user_type");

    let userName = getCookie("user_name");
    let userPhone = getCookie("phone");
    let userAddress = getCookie("address");
    let userPin = getCookie("pin_code");
    let userGovtId = getCookie("govt_id");
    let userAge = getCookie("age");
    let userState = getCookie("state_of_residence");

    // Update the profile fields in the HTML
    if (userName) document.getElementById("profile-name").innerText = userName;
    if (userPhone) document.getElementById("profile-phone").innerText = `Phone No.: ${userPhone}`;
    if (userAddress) document.getElementById("profile-address").innerText = `Address: ${userAddress}`;
    if (userPin) document.getElementById("profile-pin").innerText = `Pin Code: ${userPin}`;
    if (userGovtId) document.getElementById("profile-govt-id").innerText = `Government ID: ${userGovtId}`;
    if (userAge) document.getElementById("profile-age").innerText = `Age: ${userAge}`;
    if (userState) document.getElementById("profile-state").innerText = `State: ${userState}`;
    if (userType) document.getElementById("user-type").innerText = `${userType}`;
}

document.addEventListener("DOMContentLoaded", populateProfile);
