import httpx
import random
import sys

BASE_URL = "http://localhost:8000"

def test_flow():
    # 1. Register a test user
    rand_id = random.randint(10000, 99999)
    email = f"test_user_{rand_id}@demo.com"
    name = f"Validation User {rand_id}"
    password = "testpassword123"
    
    register_payload = {
        "name": name,
        "email": email,
        "password": password,
        "role": "USER"
    }
    
    print(f"1. Registering user: {email}...")
    response = httpx.post(f"{BASE_URL}/api/auth/register", json=register_payload)
    if response.status_code != 201:
        print(f"FAIL: Registration failed with code {response.status_code}: {response.text}")
        sys.exit(1)
    
    user_data = response.json()
    print("PASS: Registration successful:", user_data)
    
    # 2. Check duplicate registration
    print("\n2. Testing duplicate registration prevention...")
    dup_response = httpx.post(f"{BASE_URL}/api/auth/register", json=register_payload)
    if dup_response.status_code == 400:
        print("PASS: Duplicate registration correctly blocked with status 400 Bad Request.")
    else:
        print(f"FAIL: Duplicate registration check failed. Expected 400, got {dup_response.status_code}")
        sys.exit(1)
        
    # 3. Login
    login_payload = {
        "email": email,
        "password": password
    }
    print("\n3. Logging in with credentials...")
    response = httpx.post(f"{BASE_URL}/api/auth/login", json=login_payload)
    if response.status_code != 200:
        print(f"FAIL: Login failed with code {response.status_code}: {response.text}")
        sys.exit(1)
        
    login_data = response.json()
    token = login_data["access_token"]
    role = login_data["role"]
    print(f"PASS: Login successful. Role: {role}, Token: {token[:30]}...")
    
    # 4. Get Profile
    headers = {"Authorization": f"Bearer {token}"}
    print("\n4. Fetching profile details using JWT Bearer token...")
    response = httpx.get(f"{BASE_URL}/api/profile", headers=headers)
    if response.status_code != 200:
        print(f"FAIL: Profile fetch failed: {response.text}")
        sys.exit(1)
        
    profile_data = response.json()
    print("PASS: Profile fetched:", profile_data)
    
    # 5. Update Profile
    print("\n5. Updating profile name field...")
    update_payload = {"name": f"Updated Name {rand_id}"}
    response = httpx.put(f"{BASE_URL}/api/profile", json=update_payload, headers=headers)
    if response.status_code != 200:
        print(f"FAIL: Profile update failed: {response.text}")
        sys.exit(1)
        
    updated_data = response.json()
    print("PASS: Profile updated successfully:", updated_data)
    
    print("\n=============================================")
    print("--- ALL BACKEND TEST FLOWS PASSED SUCCESSFULLY ---")
    print("=============================================")

if __name__ == "__main__":
    test_flow()
