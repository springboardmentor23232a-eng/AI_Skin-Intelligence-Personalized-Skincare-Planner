function getBaseUrl() {
    if (typeof window.APP_CONFIG !== "undefined" && window.APP_CONFIG.API_BASE_URL) {
        return window.APP_CONFIG.API_BASE_URL;
    }
    const isLocalHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    return isLocalHost ? "http://127.0.0.1:8000" : window.location.origin;
}

async function login(){
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const baseUrl = getBaseUrl();
        console.log("Attempting login via API base URL:", baseUrl);

        const response = await fetch(
            `${baseUrl}/api/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        let data;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const rawText = await response.text();
            console.error("Non-JSON Response from server:", rawText);
            data = { message: "Server connection failed. Please try again." };
        }

        console.log("Login Response:", data);

        if (response.ok) {
            localStorage.setItem(
                "token",
                data.token || data.access_token || "sample_jwt_token_123"
            );

            const role = (data.user && data.user.role ? data.user.role : data.role || "user").toLowerCase();
            localStorage.setItem("role", role);

            alert("Login Successful");

            if (role === "admin") {
                window.location.href = "admin-dashboard.html";
            } else if (role === "consultant") {
                window.location.href = "consultant-dashboard.html";
            } else if (role === "dermatologist") {
                window.location.href = "dermatologist-dashboard.html";
            } else {
                window.location.href = "user-dashboard.html";
            }
        } else {
            alert(data.message || data.detail || "Login failed");
        }
    } catch (error) {
        console.error("Login Error:", error);
        alert("Server error: " + error.message);
    }
}

function googleLogin(){
    const baseUrl = getBaseUrl();
    window.location.href = `${baseUrl}/auth/google`;
}

function logout(){
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "login.html";
}