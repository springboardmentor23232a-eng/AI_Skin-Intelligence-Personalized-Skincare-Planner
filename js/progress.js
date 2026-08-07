async function loadProgress(){

    const token = localStorage.getItem("token");


    if(!token){
        window.location.href="login.html";
        return;
    }


    try{

        const response = await fetch(
            "http://127.0.0.1:8000/assessment/",
            {
                headers:{
                    "Authorization":"Bearer " + token
                }
            }
        );


        const data = await response.json();


        console.log("Progress Data:", data);



        if(data.length > 0){


            const latest = data[data.length - 1];


            document.getElementById("currentScore").innerHTML =
            latest.skin_health_score + "%";


            document.getElementById("summary").innerHTML =
            latest.notes;



            if(data.length > 1){


                const previous = data[data.length - 2];


                document.getElementById("previousScore").innerHTML =
                previous.skin_health_score + "%";


                const improvement =
                latest.skin_health_score - previous.skin_health_score;


                if(improvement >= 0){

                    document.getElementById("improvement").innerHTML =
                    "+" + improvement + "%";

                }
                else{

                    document.getElementById("improvement").innerHTML =
                    improvement + "%";

                }


            }
            else{


                document.getElementById("previousScore").innerHTML =
                latest.skin_health_score + "%";


                document.getElementById("improvement").innerHTML =
                "+0%";


            }



        }
        else{


            document.getElementById("currentScore").innerHTML =
            "No data";


            document.getElementById("previousScore").innerHTML =
            "No data";


            document.getElementById("improvement").innerHTML =
            "0%";


            document.getElementById("summary").innerHTML =
            "No assessment found";


        }



    }
    catch(error){

        console.error(
            "Progress Error:",
            error
        );

    }

}


loadProgress();



function logout(){

    localStorage.removeItem("token");
    localStorage.removeItem("role");

    window.location.href="login.html";

}