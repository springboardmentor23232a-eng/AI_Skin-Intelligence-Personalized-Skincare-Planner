def test_regular_user_cannot_access_admin(client, registered_user):
    res = client.get("/api/admin/users", headers=registered_user["headers"])
    assert res.status_code == 403


def test_admin_can_list_users(client):
    client.post("/api/auth/register", json={
        "full_name": "Admin", "email": "admin@example.com", "password": "adminpass", "role": "admin",
    })
    res = client.post("/api/auth/login", data={"username": "admin@example.com", "password": "adminpass"})
    token = res.json()["access_token"]

    res = client.get("/api/admin/users", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert isinstance(res.json(), list)
