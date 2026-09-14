def test_register_and_login(client):
    resp = client.post("/api/auth/register", json={
        "full_name": "Test Two",
        "email": "test.two@example.com",
        "password": "SecurePass123!",
        "role": "user",
    })
    assert resp.status_code == 201
    body = resp.json()
    assert body["access_token"]
    assert body["user"]["email"] == "test.two@example.com"

    login = client.post("/api/auth/login", data={"username": "test.two@example.com", "password": "SecurePass123!"})
    assert login.status_code == 200
    assert login.json()["access_token"]


def test_login_wrong_password_rejected(client):
    client.post("/api/auth/register", json={
        "full_name": "Test Three", "email": "test.three@example.com",
        "password": "SecurePass123!", "role": "user",
    })
    resp = client.post("/api/auth/login", data={"username": "test.three@example.com", "password": "wrong"})
    assert resp.status_code == 401


def test_protected_route_requires_token(client):
    resp = client.get("/api/dashboard/user")
    assert resp.status_code in (401, 403)
