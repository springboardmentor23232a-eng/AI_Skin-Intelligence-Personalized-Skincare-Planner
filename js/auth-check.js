const token = localStorage.getItem("token");

if (!token) {

    // Redirect to Login Page
    window.location.href = "../pages/login.html";

}