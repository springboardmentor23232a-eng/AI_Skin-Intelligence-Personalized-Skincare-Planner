import requests

base_url = "http://127.0.0.1:8000/api/auth"

email = "live_runtime_demo_user@skincare.com"
password = "DemoPassword123!"

print("\n--- 1. Testing Live POST /api/auth/register ---")
reg_res = requests.post(f"{base_url}/register", json={
    "full_name": "Runtime Demo User",
    "email": email,
    "password": password,
    "role": "USER"
})
print("Request URL:", f"{base_url}/register")
print("Response Status Code:", reg_res.status_code)
print("Response JSON Body:", reg_res.json())

print("\n--- 2. Testing Live POST /api/auth/login ---")
login_res = requests.post(f"{base_url}/login", json={
    "email": email,
    "password": password
})
print("Request URL:", f"{base_url}/login")
print("Response Status Code:", login_res.status_code)
login_data = login_res.json()
print("Response Access Token:", login_data.get("access_token")[:35] + "...")
print("Response Refresh Token:", login_data.get("refresh_token")[:35] + "...")

token = login_data.get("access_token")
refresh_token = login_data.get("refresh_token")

print("\n--- 3. Testing Live GET /api/auth/me ---")
me_res = requests.get(f"{base_url}/me", headers={"Authorization": f"Bearer {token}"})
print("Request URL:", f"{base_url}/me")
print("Response Status Code:", me_res.status_code)
print("Response User Profile:", me_res.json())

print("\n--- 4. Testing Live POST /api/auth/refresh ---")
ref_res = requests.post(f"{base_url}/refresh", json={"refresh_token": refresh_token})
print("Request URL:", f"{base_url}/refresh")
print("Response Status Code:", ref_res.status_code)
print("New Access Token:", ref_res.json().get("access_token")[:35] + "...")

print("\n--- 5. Testing Live POST /api/auth/logout ---")
logout_res = requests.post(f"{base_url}/logout")
print("Request URL:", f"{base_url}/logout")
print("Response Status Code:", logout_res.status_code)
print("Response Message:", logout_res.json())
