function getBaseUrl() {
    if (typeof window.APP_CONFIG !== "undefined" && window.APP_CONFIG.API_BASE_URL) {
        return window.APP_CONFIG.API_BASE_URL;
    }
    const isLocalHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    return isLocalHost ? "http://127.0.0.1:8000" : window.location.origin;
}

document.getElementById("registerForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const role = document.getElementById("role").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    if (!role) {
        alert("Please select a role");
        return;
    }

    try {
        const baseUrl = getBaseUrl();
        const response = await fetch(
            `${baseUrl}/api/auth/register`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password,
                    role: role
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

        console.log("Register Response:", data);

        if (response.ok) {
            alert("Registration successful! Please log in.");
            window.location.href = "login.html";
        } else {
            alert(data.message || data.detail || "Registration failed");
        }
    } catch (error) {
        console.error("Register Error:", error);
        alert("Server error: " + error.message);
    }
});