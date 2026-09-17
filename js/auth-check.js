// Get token from URL after Google login
const authParams = new URLSearchParams(window.location.search);
const tokenFromURL = authParams.get("token");

if (tokenFromURL) {
    localStorage.setItem("token", tokenFromURL);

    try {
        const payload = JSON.parse(atob(tokenFromURL.split(".")[1]));
        if (payload && payload.role) {
            localStorage.setItem("role", payload.role.toLowerCase());
        }
    } catch (e) {
        console.error("JWT payload parse error:", e);
    }

    window.history.replaceState({}, document.title, window.location.pathname);
}

// Get stored values
const token = localStorage.getItem("token");
const role = (localStorage.getItem("role") || "").toLowerCase();

// No token = login
if (!token) {
    window.location.href = "../pages/login.html";
}

// Current page check
const currentPage = window.location.pathname;

if (currentPage.includes("admin-dashboard.html") && role !== "admin") {
    console.warn("Role mismatch for admin dashboard:", role);
}

if (currentPage.includes("consultant-dashboard.html") && role !== "consultant") {
    console.warn("Role mismatch for consultant dashboard:", role);
}

if (currentPage.includes("dermatologist-dashboard.html") && role !== "dermatologist" && role !== "doctor") {
    console.warn("Role mismatch for dermatologist dashboard:", role);
}