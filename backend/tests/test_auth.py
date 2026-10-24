def test_register_success(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "newuser",
            "password": "securepassword",
            "email": "newuser@example.com",
            "preferred_language": "English",
            "age": 27,
            "height_cm": 170.0,
            "weight_kg": 65.0,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_register_duplicate_username(client, test_user):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": test_user.username,
            "password": "password123",
            "email": "diff@example.com",
        },
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_login_success(client, test_user):
    response = client.post(
        "/api/v1/auth/login",
        json={"username": test_user.username, "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_login_invalid_credentials(client, test_user):
    response = client.post(
        "/api/v1/auth/login",
        json={"username": test_user.username, "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert "Incorrect username or password" in response.json()["detail"]


def test_get_current_user_profile(client, test_user, auth_headers):
    response = client.get("/api/v1/users/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == test_user.username
    assert data["profile"]["age"] == 30
