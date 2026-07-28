function login(){

let role=document.getElementById("role").value;

if(role==""){

alert("Please select a role");

return;

}

switch(role){

case "user":

window.location.href="dashboards/user.html";

break;

case "doctor":

window.location.href="dashboards/doctor.html";

break;

case "consultant":

window.location.href="dashboards/consultant.html";

break;

case "admin":

window.location.href="dashboards/admin.html";

break;

}

}
