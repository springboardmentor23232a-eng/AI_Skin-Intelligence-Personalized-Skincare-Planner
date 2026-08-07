// Get token from URL after Google login

const authParams = new URLSearchParams(window.location.search);

const tokenFromURL = authParams.get("token");


if (tokenFromURL) {

    localStorage.setItem("token", tokenFromURL);

    // Decode JWT payload to get role
    const payload = JSON.parse(
        atob(tokenFromURL.split(".")[1])
    );

    localStorage.setItem("role", payload.role);


    // Remove token from URL
    window.history.replaceState(
        {},
        document.title,
        window.location.pathname
    );
}


// Get stored values

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");


// No token = login

if (!token) {

    window.location.href = "../pages/login.html";

}


// Current page

const currentPage = window.location.pathname;


// User Dashboard

if (currentPage.includes("user-dashboard.html")) {

    if (role !== "USER" && role !== "user") {

        window.location.href = "../pages/login.html";

    }

}


// Admin Dashboard

if (currentPage.includes("admin-dashboard.html")) {

    if (role !== "ADMIN" && role !== "admin") {

        window.location.href = "../pages/login.html";

    }

}


// Consultant Dashboard

if (currentPage.includes("consultant-dashboard.html")) {

    if (role !== "CONSULTANT" && role !== "consultant") {

        window.location.href = "../pages/login.html";

    }

}


// Dermatologist Dashboard

if (currentPage.includes("dermatologist-dashboard.html")) {

    if (role !== "DERMATOLOGIST" && role !== "dermatologist") {

        window.location.href = "../pages/login.html";

    }

}