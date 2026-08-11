document.getElementById("registerForm").addEventListener("submit", async function(e){

    e.preventDefault();


    const name = document.getElementById("name").value;

    const email = document.getElementById("email").value;

    const password = document.getElementById("password").value;

    const confirmPassword = document.getElementById("confirmPassword").value;



    if(password !== confirmPassword){

        alert("Passwords do not match");
        return;

    }



    try{


        const response = await fetch(
            "http://127.0.0.1:8000/api/auth/register",
            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    name:name,

                    email:email,

                    password:password,

                    role:"USER"

                })

            }
        );



        const data = await response.json();



        console.log("Register Response:", data);



        if(response.ok){

            alert("Registration successful");

            window.location.href="login.html";

        }
        else{

            alert(data.detail || "Registration failed");

        }



    }
    catch(error){

        console.error("Register Error:", error);

        alert("Server error");

    }


});