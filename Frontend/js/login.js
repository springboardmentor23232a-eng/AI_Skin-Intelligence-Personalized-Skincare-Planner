document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.querySelector(".login-form");

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const role = document.querySelector("select[name='role']").value;
        const username = document.querySelector("input[name='username']").value.trim();
        const password = document.querySelector("input[name='password']").value.trim();

        if (role === "") {
            alert("Please select a role.");
            return;
        }

        if (username === "" || password === "") {
            alert("Please enter your username and password.");
            return;
        }

        if (role === "user") {
            window.location.href = "user_dashboard.html";
        }
        else if (role === "admin") {
            window.location.href = "admin_dashboard.html";
        }
        else if (role === "dermatologist") {
            window.location.href = "dermacologist_dashboard.html";
        }
        else if (role === "consultant") {
            window.location.href = "consultant_dashboard.html";
        }
        else {
            alert("Invalid role selected.");
        }

    });

});