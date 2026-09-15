console.log("Progress page loaded");


async function loadProgress() {

    const token =
        localStorage.getItem("token");

    console.log(
        "Token exists:",
        !!token
    );


    if (!token) {

        console.log(
            "No token found. Redirecting to login."
        );

        window.location.href =
            "login.html";

        return;
    }


    try {

        const response =
            await fetch(
                "http://127.0.0.1:8000/assessment/",
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json",

                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        console.log(
            "Response status:",
            response.status
        );


        const data =
            await response.json();


        console.log(
            "Progress Data:",
            data
        );


        if (!response.ok) {

            console.error(
                "Backend Error:",
                data
            );

            return;
        }


        /*
        ============================================================
        STEP 1
        SKIN PROGRESS MONITORING
        ============================================================
        */


        if (
            Array.isArray(data) &&
            data.length > 0
        ) {


            /*
            --------------------------------------------------------
            SORT ASSESSMENTS BY DATE
            --------------------------------------------------------
            */

            data.sort(
                function (a, b) {

                    const dateA =
                        new Date(
                            a.assessment_date ||
                            a.created_at
                        );

                    const dateB =
                        new Date(
                            b.assessment_date ||
                            b.created_at
                        );

                    return dateA - dateB;
                }
            );


            console.log(
                "Sorted Assessment History:",
                data
            );


            /*
            --------------------------------------------------------
            LATEST ASSESSMENT
            --------------------------------------------------------
            */

            const latest =
                data[data.length - 1];


            console.log(
                "Latest Assessment:",
                latest
            );


            /*
            --------------------------------------------------------
            CURRENT SKIN HEALTH SCORE
            --------------------------------------------------------
            */

            const currentScore =
                document.getElementById(
                    "currentScore"
                );


            const latestScore =
                Number(
                    latest.skin_health_score
                );


            if (currentScore) {

                if (
                    Number.isFinite(
                        latestScore
                    )
                ) {

                    currentScore.innerHTML =
                        latestScore + "%";

                } else {

                    currentScore.innerHTML =
                        "No data";
                }
            }


            /*
            --------------------------------------------------------
            LATEST ASSESSMENT SUMMARY
            --------------------------------------------------------
            */

            const summary =
                document.getElementById(
                    "summary"
                );


            if (summary) {

                summary.innerHTML =
                    latest.notes ||
                    latest.overall_condition ||
                    "Assessment completed";
            }


            /*
            --------------------------------------------------------
            PREVIOUS ASSESSMENT
            --------------------------------------------------------
            */

            if (data.length > 1) {


                const previous =
                    data[data.length - 2];


                console.log(
                    "Previous Assessment:",
                    previous
                );


                const previousScore =
                    document.getElementById(
                        "previousScore"
                    );


                const oldScore =
                    Number(
                        previous.skin_health_score
                    );


                if (previousScore) {

                    if (
                        Number.isFinite(
                            oldScore
                        )
                    ) {

                        previousScore.innerHTML =
                            oldScore + "%";

                    } else {

                        previousScore.innerHTML =
                            "No data";
                    }
                }


                /*
                ----------------------------------------------------
                IMPROVEMENT CALCULATION
                ----------------------------------------------------
                */

                let improvementValue = 0;


                if (
                    Number.isFinite(
                        latestScore
                    ) &&
                    Number.isFinite(
                        oldScore
                    )
                ) {

                    improvementValue =
                        latestScore -
                        oldScore;
                }


                console.log(
                    "Improvement:",
                    improvementValue
                );


                const improvement =
                    document.getElementById(
                        "improvement"
                    );


                if (improvement) {

                    if (
                        improvementValue > 0
                    ) {

                        improvement.innerHTML =
                            "+" +
                            improvementValue +
                            "%";

                    }
                    else if (
                        improvementValue < 0
                    ) {

                        improvement.innerHTML =
                            improvementValue +
                            "%";

                    }
                    else {

                        improvement.innerHTML =
                            "0%";
                    }
                }


            }
            else {


                /*
                ----------------------------------------------------
                ONLY ONE ASSESSMENT
                ----------------------------------------------------
                */

                const previousScore =
                    document.getElementById(
                        "previousScore"
                    );


                if (previousScore) {

                    previousScore.innerHTML =
                        "No previous data";
                }


                const improvement =
                    document.getElementById(
                        "improvement"
                    );


                if (improvement) {

                    improvement.innerHTML =
                        "0%";
                }
            }


            /*
            --------------------------------------------------------
            HIDE NO-ASSESSMENT MESSAGE
            --------------------------------------------------------
            */

            const noAssessment =
                document.getElementById(
                    "noAssessment"
                );


            if (noAssessment) {

                noAssessment.style.display =
                    "none";
            }


        }
        else {


            /*
            --------------------------------------------------------
            NO ASSESSMENT DATA
            --------------------------------------------------------
            */

            console.log(
                "No assessments found."
            );


            const currentScore =
                document.getElementById(
                    "currentScore"
                );


            if (currentScore) {

                currentScore.innerHTML =
                    "No data";
            }


            const previousScore =
                document.getElementById(
                    "previousScore"
                );


            if (previousScore) {

                previousScore.innerHTML =
                    "No data";
            }


            const improvement =
                document.getElementById(
                    "improvement"
                );


            if (improvement) {

                improvement.innerHTML =
                    "0%";
            }


            const summary =
                document.getElementById(
                    "summary"
                );


            if (summary) {

                summary.innerHTML =
                    "No assessment found";
            }
        }


    }
    catch (error) {

        console.error(
            "Progress Error:",
            error
        );
    }
}


/*
============================================================
START PROGRESS TRACKING
============================================================
*/

loadProgress();


/*
============================================================
LOGOUT
============================================================
*/

function logout() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "role"
    );

    window.location.href =
        "login.html";
}