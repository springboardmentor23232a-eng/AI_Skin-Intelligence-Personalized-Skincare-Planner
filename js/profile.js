async function loadProfile(){

    const token = localStorage.getItem("token");


    const response = await fetch(
        "http://127.0.0.1:8000/dashboard/user",
        {
            headers:{
                "Authorization":"Bearer " + token
            }
        }
    );


    const data = await response.json();


    console.log(data);


    document.getElementById("profileName").innerHTML =
    data.user.name;


    document.getElementById("profileEmail").innerHTML =
    data.user.email;


    document.getElementById("profileRole").innerHTML =
    data.user.role;

}


loadProfile();



function logout(){

    localStorage.removeItem("token");

    localStorage.removeItem("role");

    window.location.href="login.html";

}