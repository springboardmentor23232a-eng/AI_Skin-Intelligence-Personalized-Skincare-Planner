document.getElementById("loginForm").addEventListener("submit", function(event){

    event.preventDefault();

    let role = document.getElementById("role").value;

    if(role === "user"){
        window.location.href = "user-dashboard.html";
    }
    else if(role === "consultant"){
        window.location.href = "consultant-dashboard.html";
    }
    else{
        alert("Please select a role.");
    }

});