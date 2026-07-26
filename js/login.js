function login() {

    const role = document.getElementById("role").value;

    if (role === "") {
        alert("Please select a role");
        return;
    }

    if (role === "admin") {
        window.location.href = "dashboards/admin.html";
    }
    else if (role === "user") {
        window.location.href = "dashboards/user.html";
    }
    else if (role === "doctor") {
        window.location.href = "dashboards/doctor.html";
    }
    else if (role === "consultant") {
        window.location.href = "dashboards/consultant.html";
    }

}