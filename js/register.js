document.getElementById("registerForm").addEventListener("submit", async function(e) {

    e.preventDefault();


    const name = document.getElementById("name").value;

    const email = document.getElementById("email").value;

    const password = document.getElementById("password").value;

    const confirmPassword = document.getElementById("confirmPassword").value;

    const role = document.getElementById("role").value;


    // Check password

    if (password !== confirmPassword) {

        alert("Passwords do not match");

        return;

    }


    // Check role

    if (!role) {

        alert("Please select a role");

        return;

    }


        const baseUrl = (typeof window.APP_CONFIG !== "undefined" && window.APP_CONFIG.API_BASE_URL) ? window.APP_CONFIG.API_BASE_URL : "http://127.0.0.1:8000";

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


        const data = await response.json();


        console.log("Register Response:", data);


        if (response.ok) {

            alert("Registration successful");

            window.location.href = "login.html";

        }

        else {

            alert(
                data.detail || "Registration failed"
            );

        }


    }

    catch (error) {

        console.error(
            "Register Error:",
            error
        );

        alert("Server error");

    }

});