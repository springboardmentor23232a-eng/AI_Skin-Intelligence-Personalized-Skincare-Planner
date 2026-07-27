 function login() {

    let role = document.getElementById("role").value;

    if(role===""){
        alert("Please select a role");
        return;
    }

    if(role==="user"){
        window.location.href="../dashboards/user.html";
    }

    if(role==="doctor"){
        window.location.href="../dashboards/doctor.html";
    }

    if(role==="consultant"){
        window.location.href="../dashboards/consultant.html";
    }

    if(role==="admin"){
        window.location.href="../dashboards/admin.html";
    }

}
