// Get Login Form
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (event) {

    // Prevent page refresh
    event.preventDefault();

    // Get values
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value;

    // Simple Validation
    if (email === "" || password === "" || role === "") {
        alert("Please fill all the fields.");
        return;
    }

    // Dummy JWT Token
    const token = "jwt_" + Math.random().toString(36).substring(2);

    // Store data
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("email", email);

    // Redirect based on role
    switch (role) {

        case "user":
            window.location.href = "user.html";
            break;

        case "consultant":
            window.location.href = "consultant.html";
            break;

        case "dermatologist":
            window.location.href = "dermatologist.html";
            break;

        case "admin":
            window.location.href = "admin.html";
            break;

        default:
            alert("Invalid Role");
    }

});