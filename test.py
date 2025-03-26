import requests
import random

BASE_URL = "https://farmsync.ysinghc.me"

REGISTER_ENDPOINTS = {
    "farmer": "/users/register/farmer",
    "restaurant": "/users/register/restaurant",
    "individual": "/users/register/individual"
}

LOGIN_ENDPOINT = "/users/login"

def generate_unique_id(prefix):
    return f"{prefix}{random.randint(100000, 999999)}"

def generate_phone():
    return f"98{random.randint(10000000, 99999999)}"

def generate_pin():
    return random.randint(100000, 999999)

test_users = [
    {
        "user_type": "farmer",
        "data": {
            "legal_name": "John Doe",
            "govt_id": generate_unique_id("FARM_"),
            "contact_number": generate_phone(),
            "age": random.randint(25, 60),
            "state_of_residence": "Maharashtra",
            "pin_code": generate_pin(),
            "address": "Farm Lane, Village XYZ",
            "password": "securepass123"
        }
    },
    {
        "user_type": "restaurant",
        "data": {
            "owner_name": "Alice Smith",
            "phone_no": generate_phone(),
            "password": "securepass123",
            "age": random.randint(30, 55),
            "shop_location": "City Center",
            "pin_code": generate_pin(),
            "gstin": generate_unique_id("GST_"),
            "fssai_license": generate_unique_id("FSSAI_")
        }
    },
    {
        "user_type": "individual",
        "data": {
            "legal_name": "Bob Johnson",
            "govt_id": generate_unique_id("IND_"),
            "password": "securepass123",
            "phone_no": generate_phone()
        }
    }
]

def register_users():
    for user in test_users:
        user_type = user["user_type"]
        endpoint = BASE_URL + REGISTER_ENDPOINTS[user_type]
        response = requests.post(endpoint, json=user["data"])
        print(response.text)  # Print raw server response

def test_login():
    for user in test_users:
        login_data = {
            "phone_no": user["data"].get("contact_number", user["data"].get("phone_no")),
            "password": user["data"]["password"]
        }
        response = requests.post(BASE_URL + LOGIN_ENDPOINT, json=login_data)
        print(response.text)  # Print raw server response

if __name__ == "__main__":
    print("🚀 Starting Registration Tests...")
    register_users()
    
    print("\n🚀 Starting Login Tests...")
    test_login()