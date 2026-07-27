def test_register_and_login(client):
    res = client.post("/api/auth/register", json={
        "full_name": "Alice", "email": "alice@example.com", "password": "pass1234", "role": "user",
    })
    assert res.status_code == 201
    assert res.json()["email"] == "alice@example.com"

    res = client.post("/api/auth/login", data={"username": "alice@example.com", "password": "pass1234"})
    assert res.status_code == 200
    body = res.json()
    assert "access_token" in body
    assert body["user"]["email"] == "alice@example.com"


def test_duplicate_email_rejected(client):
    payload = {"full_name": "Bob", "email": "bob@example.com", "password": "pass1234", "role": "user"}
    client.post("/api/auth/register", json=payload)
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 400


def test_wrong_password_rejected(client):
    client.post("/api/auth/register", json={
        "full_name": "Carl", "email": "carl@example.com", "password": "correctpass", "role": "user",
    })
    res = client.post("/api/auth/login", data={"username": "carl@example.com", "password": "wrongpass"})
    assert res.status_code == 401


def test_me_requires_auth(client):
    res = client.get("/api/users/me")
    assert res.status_code == 401


def test_me_with_token(client, registered_user):
    res = client.get("/api/users/me", headers=registered_user["headers"])
    assert res.status_code == 200
    assert res.json()["email"] == registered_user["email"]
