document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.querySelector(".login-form");

    if (!loginForm) {
        console.error("Login form not found!");
        return;
    }

    // ==========================
    // JWT Login
    // ==========================
    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const role = document.querySelector("select[name='role']").value;
        const email = document.querySelector("input[name='email']").value.trim();
        const password = document.querySelector("input[name='password']").value.trim();

        if (!email || !password) {
            alert("Please enter email and password.");
            return;
        }

        try {

            const response = await fetch("http://localhost:5000/api/auth/login", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })

            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            // Save JWT
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);

            alert("Login Successful");

            if (role !== data.role) {
                alert("Selected role does not match your account.");
                return;
            }

            switch (data.role) {

                case "user":
                    window.location.href = "user_dashboard.html";
                    break;

                case "admin":
                    window.location.href = "admin_dashboard.html";
                    break;

                case "dermatologist":
                    window.location.href = "dermacologist_dashboard.html";
                    break;

                case "consultant":
                    window.location.href = "consultant_dashboard.html";
                    break;

                default:
                    alert("Invalid Role");
            }

        } catch (error) {

            console.error(error);

            alert("Cannot connect to backend.");

        }

    });

    // ==========================
    // Google OAuth Login
    // ==========================

    const googleBtn = document.getElementById("googleLogin");

    if (googleBtn) {

        googleBtn.addEventListener("click", () => {

            window.location.href =
                "http://localhost:5000/api/auth/google";

        });

    }

});