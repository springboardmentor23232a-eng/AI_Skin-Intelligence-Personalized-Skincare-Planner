console.log("User dashboard JS loaded");


async function loadUserDashboard(){

    const token = localStorage.getItem("token");

    console.log("Token exists:", !!token);


    if(!token){
        window.location.href = "login.html";
        return;
    }


    try {

        // Load user details
        const userResponse = await fetch(
            "http://127.0.0.1:8000/dashboard/user",
            {
                headers:{
                    "Authorization":"Bearer " + token
                }
            }
        );


        const userData = await userResponse.json();

        console.log("User Data:", userData);


        if(userData.user){

            const userName =
            document.getElementById("userName");

            if(userName){
                userName.innerHTML =
                "Welcome, " + userData.user.name + " 👋";
            }
        }



        // Load latest assessment
        const assessmentResponse = await fetch(
            "http://127.0.0.1:8000/assessment/",
            {
                headers:{
                    "Authorization":"Bearer " + token
                }
            }
        );


        const assessments = await assessmentResponse.json();

        console.log("Assessment Data:", assessments);



        if(assessments.length > 0){

            const latest =
            assessments[assessments.length - 1];


            document.getElementById("acne").innerHTML =
            latest.overall_condition;


            document.getElementById("hydration").innerHTML =
            latest.notes;


            document.getElementById("spots").innerHTML =
            "Skin Health Score: " +
            latest.skin_health_score + "%";


            document.getElementById("score").innerHTML =
            latest.skin_health_score + "%";

        }
        else{

            console.log("No assessment found");

        }



    }
    catch(error){

        console.error(
            "Dashboard Error:",
            error
        );

    }

}



function logout(){

    localStorage.removeItem("token");
    localStorage.removeItem("role");

    window.location.href="login.html";

}



loadUserDashboard();