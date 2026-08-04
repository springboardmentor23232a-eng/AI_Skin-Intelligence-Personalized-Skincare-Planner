document.addEventListener("DOMContentLoaded", () => {

    const registerForm = document.querySelector(".register-form");

    registerForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const firstName = document.querySelector("input[name='firstname']").value.trim();
        const lastName = document.querySelector("input[name='lastname']").value.trim();
        const email = document.querySelector("input[name='email']").value.trim();
        const password = document.querySelector("input[name='password']").value;
        const confirmPassword = document.querySelector("input[name='confirm-password']").value;
        const role = document.querySelector("select[name='role']").value;
        const terms = document.getElementById("terms");

        if (!firstName || !lastName || !email || !password || !confirmPassword || !role) {
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

        const full_name = `${firstName} ${lastName}`;

        try {

            const response = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    full_name,
                    email,
                    password,
                    role
                })
            });

            const data = await response.json();

            console.log("Status:", response.status);
            console.log("Response:", data);

            if (response.ok) {
                alert(data.message);
                window.location.href = "login.html";
            } else {
                alert(data.message);
            }

        } catch (error) {
            console.error(error);
            alert("Cannot connect to backend.");
        }

    });

});