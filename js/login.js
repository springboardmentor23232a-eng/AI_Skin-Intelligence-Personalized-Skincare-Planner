async function login(){

    const email = document.getElementById("email").value;

    const password = document.getElementById("password").value;


    try{


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


        console.log("Login Response:", data);



        if(response.ok){


            // Save JWT token

            localStorage.setItem(
                "token",
                data.token || data.access_token
            );



            // Get role safely

            const role = 
            (data.role || "user").toLowerCase();



            localStorage.setItem(
                "role",
                role
            );



            alert("Login Successful");



            // Role based dashboard redirect

            if(role === "user"){

                window.location.href =
                "user-dashboard.html";

            }


            else if(role === "admin"){

                window.location.href =
                "admin-dashboard.html";

            }


            else if(role === "consultant"){

                window.location.href =
                "consultant-dashboard.html";

            }


            else if(role === "dermatologist"){

                window.location.href =
                "dermatologist-dashboard.html";

            }


            else{

                window.location.href =
                "user-dashboard.html";

            }



        }


        else{


            alert(
                data.detail || "Login failed"
            );


        }



    }


    catch(error){


        console.error(
            "Login Error:",
            error
        );


        alert(
            "Server error"
        );


    }


}





// Google OAuth Login

function googleLogin(){


    window.location.href =
    "http://127.0.0.1:8000/auth/google";


}





// Logout

function logout(){


    localStorage.removeItem("token");

    localStorage.removeItem("role");


    window.location.href =
    "login.html";


}