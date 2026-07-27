document.addEventListener("DOMContentLoaded", function () {

    const registerForm = document.querySelector(".register-form");

    registerForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const firstName = document.querySelector("input[name='firstname']").value.trim();
        const lastName = document.querySelector("input[name='lastname']").value.trim();
        const email = document.querySelector("input[name='email']").value.trim();
        const password = document.querySelector("input[name='password']").value;
        const confirmPassword = document.querySelector("input[name='confirm-password']").value;
        const role = document.querySelector("select[name='role']").value;
        const terms = document.getElementById("terms");

        if (
            firstName === "" ||
            lastName === "" ||
            email === "" ||
            password === "" ||
            confirmPassword === "" ||
            role === ""
        ) {
            alert("Please fill in all required fields.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        if (!terms.checked) {
            alert("Please accept the Terms & Conditions.");
            return;
        }

        alert("Registration Successful!");

        window.location.href = "/Frontend/login.html";

    });

});