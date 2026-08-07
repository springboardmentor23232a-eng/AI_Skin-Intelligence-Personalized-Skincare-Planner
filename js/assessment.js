console.log("assessment.js loaded");

async function loadAssessment(){

    const token = localStorage.getItem("token");

    console.log("Token:", token);

    if(!token){
        console.log("No token found");
        return;
    }

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/assessment/",
            {
                headers:{
                    "Authorization":"Bearer " + token
                }
            }
        );

        console.log("Status:", response.status);

        const data = await response.json();

        console.log("Assessment Data:", JSON.stringify(data, null, 2));


        if(Array.isArray(data) && data.length > 0){

            const latest = data[data.length - 1];

            document.getElementById("acne").innerHTML =
                latest.overall_condition || "No data";


            document.getElementById("hydration").innerHTML =
                latest.notes || "No data";


            document.getElementById("spots").innerHTML =
                "Skin Health Score: " + 
                (latest.skin_health_score || 0) + "%";

        }
        else{

            document.getElementById("acne").innerHTML = "No assessment found";
            document.getElementById("hydration").innerHTML = "-";
            document.getElementById("spots").innerHTML = "-";

            console.log("No assessment records found");

        }

    }
    catch(error){

        console.error("Assessment Error:", error);

    }

}


loadAssessment();


function logout(){

    localStorage.removeItem("token");
    localStorage.removeItem("role");

    window.location.href="login.html";

}