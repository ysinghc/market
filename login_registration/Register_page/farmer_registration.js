document.getElementById('farmerRegistrationForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone_number: formData.get('phone'),
        address: formData.get('address'),
        pin_code: formData.get('pincode'),
        role: 'farmer'
    };

    try {
        const response = await fetch('https://api.ysinghc.me/api/v1/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Registration successful! Please login.');
            window.location.href = 'https://market.ysinghc.me/login_registration/Login_page/login.html';
        } else {
            alert(result.detail || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to connect to the server. Please try again later.');
    }
}); 