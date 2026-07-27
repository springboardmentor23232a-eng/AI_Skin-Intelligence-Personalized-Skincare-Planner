// Check Login

const token = localStorage.getItem("token");

if (!token) {

window.location.href = "login.html";

}

// Display User Email

const email = localStorage.getItem("email");

const name = email.split("@")[0];

document.getElementById("username").innerHTML =
name.charAt(0).toUpperCase() + name.slice(1);
// Logout

function logout(){

localStorage.clear();

window.location.href="login.html";

}