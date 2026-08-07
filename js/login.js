async function login(){

    const email = document.getElementById("email").value;

    const password = document.getElementById("password").value;


    const response = await fetch(
        "http://127.0.0.1:8000/api/auth/login",
        {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                email: email,

                password: password

            })

        }
    );


    const data = await response.json();

    console.log(data);



    if(response.ok){


        localStorage.setItem(
            "token",
            data.token
        );



        const role = data.user.role.toLowerCase();


        localStorage.setItem(
            "role",
            role
        );



        alert("Login Successful");



        if(role === "user"){

            window.location.href="user-dashboard.html";

        }


        else if(role === "admin"){

            window.location.href="admin-dashboard.html";

        }


        else if(role === "consultant"){

            window.location.href="consultant-dashboard.html";

        }


        else if(role === "dermatologist"){

            window.location.href="dermatologist-dashboard.html";

        }


        else{

            alert("Role not found: " + role);

        }


    }


    else{

        alert(data.detail || "Login failed");

    }


}





// Google OAuth Login

function googleLogin(){

    window.location.href =
    "http://127.0.0.1:8000/auth/google";

}





function logout(){

    localStorage.removeItem("token");

    localStorage.removeItem("role");

    window.location.href="login.html";

}