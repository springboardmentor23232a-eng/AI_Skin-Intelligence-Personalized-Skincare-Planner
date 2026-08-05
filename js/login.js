async function login(){

    const email = document.getElementById("email").value;

    const password = document.getElementById("password").value;


    const response = await fetch("http://localhost:5000/api/auth/login",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            email: email,

            password: password

        })

    });



    const data = await response.json();



    if(response.ok){


        // Store JWT Token

        localStorage.setItem("token", data.token);



        // Get role

        const role = data.user.role.toLowerCase();



        // Store Role

        localStorage.setItem("role", role);



        alert("Login Successful");



        // Role Based Dashboard Redirect


        if(role === "user"){

            window.location.href="../pages/user-dashboard.html";

        }


        else if(role === "admin"){

            window.location.href="../pages/admin-dashboard.html";

        }


        else if(role === "consultant"){

            window.location.href="../pages/consultant-dashboard.html";

        }


        else if(role === "dermatologist"){

            window.location.href="../pages/dermatologist-dashboard.html";

        }


        else if(role === "wellness_coach"){

            window.location.href="../pages/coach-dashboard.html";

        }


        else{

            alert("Role not found: " + role);

        }


    }


    else{

        alert(data.message);

    }


}





// Google OAuth Login

function googleLogin(){

    window.location.href = "http://localhost:5000/auth/google";

}





// Store Google OAuth JWT Token

const params = new URLSearchParams(window.location.search);


const googleToken = params.get("token");


if(googleToken){

    localStorage.setItem("token", googleToken);

}