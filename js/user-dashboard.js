
console.log("User dashboard JS loaded");

// ==========================================
// LOAD USER DASHBOARD
// ==========================================

async function loadUserDashboard() {

    const token = localStorage.getItem("token");

    console.log("Token exists:", !!token);


    // ==========================================
    // CHECK LOGIN
    // ==========================================

    if (!token) {

        window.location.href = "login.html";

        return;
    }


    try {

        // ==========================================
        // LOAD USER DETAILS
        // ==========================================

        const userResponse = await fetch(
            "http://127.0.0.1:8000/dashboard/user",
            {
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );


        const userData = await userResponse.json();

        console.log("User Data:", userData);


        if (userData.user) {

            const userName =
                document.getElementById("userName");


            if (userName) {

                userName.innerHTML =
                    "Welcome, " +
                    userData.user.name +
                    " 👋";
            }
        }



        // ==========================================
        // LOAD LATEST ASSESSMENT
        // ==========================================

        const assessmentResponse = await fetch(
            "http://127.0.0.1:8000/assessment/",
            {
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );


        const assessments =
            await assessmentResponse.json();


        console.log("Assessment Data:", assessments);



        // ==========================================
        // CHECK ASSESSMENTS
        // ==========================================

        if (assessments.length > 0) {

            const latest =
                assessments[assessments.length - 1];


            console.log("Latest Assessment:", latest);



            // ==========================================
            // LATEST SKIN ANALYSIS
            // ==========================================

            const acne =
                document.getElementById("acne");

            const hydration =
                document.getElementById("hydration");

            const spots =
                document.getElementById("spots");


            if (acne) {

                acne.innerHTML =
                    "Acne Detection: " +
                    latest.overall_condition;
            }


            if (hydration) {

                hydration.innerHTML =
                    "Hydration Level: " +
                    latest.notes;
            }


            if (spots) {

                spots.innerHTML =
                    "Skin Health Score: " +
                    latest.skin_health_score +
                    "%";
            }



            // ==========================================
            // SKIN HEALTH SCORE
            // ==========================================

            const skinScore =
                document.getElementById("skinScore");


            if (skinScore) {

                skinScore.innerHTML =
                    latest.skin_health_score +
                    "%";
            }



            // ==========================================
            // GENERATE PERSONALIZED ROUTINE
            // ==========================================

            generateRoutine(latest);

        }
        else {

            console.log("No assessment found");

        }


    }
    catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );

    }

}



// ==========================================
// PERSONALIZED ROUTINE GENERATION
// ==========================================

function generateRoutine(assessment) {

    console.log(
        "Generating personalized routine:",
        assessment
    );


    // ------------------------------------------
    // Get assessment information
    // ------------------------------------------

    const condition =
        String(
            assessment.overall_condition || ""
        ).toLowerCase();


    const notes =
        String(
            assessment.notes || ""
        ).toLowerCase();



    // ------------------------------------------
    // Default routine
    // ------------------------------------------

    let morningRoutine =
        "Cleanser → Moisturizer → Sunscreen";


    let eveningRoutine =
        "Cleanser → Serum → Moisturizer";


    let weeklyPlan =
        "Monday: Hydration Care<br>" +
        "Wednesday: Skin Recovery<br>" +
        "Friday: Gentle Treatment<br>" +
        "Sunday: Recovery";


    let seasonalRecommendation =
        "Use lightweight, non-comedogenic products " +
        "and apply sunscreen regularly during hot weather.";



    // ==========================================
    // ACNE DETECTED
    // ==========================================

    if (
        condition.includes("acne") ||
        notes.includes("acne")
    ) {

        morningRoutine =
            "Gentle Cleanser → Acne Treatment → " +
            "Lightweight Moisturizer → Sunscreen";


        eveningRoutine =
            "Gentle Cleanser → Acne Treatment → " +
            "Moisturizer → Night Care";


        weeklyPlan =
            "Monday: Acne Care<br>" +
            "Wednesday: Hydration<br>" +
            "Friday: Acne Care<br>" +
            "Sunday: Skin Recovery";

    }



    // ==========================================
    // DARK SPOTS DETECTED
    // ==========================================

    if (
        notes.includes("dark spot") ||
        notes.includes("dark spots") ||
        notes.includes("pigmentation")
    ) {

        morningRoutine =
            "Cleanser → Brightening Treatment → " +
            "Moisturizer → Sunscreen";


        eveningRoutine =
            "Cleanser → Dark-Spot Treatment → " +
            "Moisturizer → Night Care";


        weeklyPlan =
            "Monday: Dark-Spot Care<br>" +
            "Wednesday: Hydration<br>" +
            "Friday: Dark-Spot Care<br>" +
            "Sunday: Skin Recovery";

    }



    // ==========================================
    // LOW HYDRATION
    // ==========================================

    if (
        notes.includes("low hydration") ||
        notes.includes("dry") ||
        notes.includes("dehydrated")
    ) {

        morningRoutine =
            "Gentle Cleanser → Hydrating Treatment → " +
            "Moisturizer → Sunscreen";


        eveningRoutine =
            "Gentle Cleanser → Hydrating Serum → " +
            "Moisturizer → Night Care";


        weeklyPlan =
            "Monday: Deep Hydration<br>" +
            "Wednesday: Hydration Care<br>" +
            "Friday: Moisture Recovery<br>" +
            "Sunday: Skin Recovery";

    }



    // ==========================================
    // UPDATE MORNING ROUTINE
    // ==========================================

    const morningElement =
        document.querySelector(
            ".routine-section:nth-of-type(1) p"
        );


    if (morningElement) {

        morningElement.innerHTML =
            morningRoutine;
    }



    // ==========================================
    // UPDATE EVENING ROUTINE
    // ==========================================

    const eveningElement =
        document.querySelector(
            ".routine-section:nth-of-type(2) p"
        );


    if (eveningElement) {

        eveningElement.innerHTML =
            eveningRoutine;
    }



    // ==========================================
    // UPDATE WEEKLY PLAN
    // ==========================================

    const weeklyElement =
        document.querySelector(
            ".routine-section:nth-of-type(3)"
        );


    if (weeklyElement) {

        weeklyElement.innerHTML =
            "<h3>📅 Weekly Treatment Plan</h3>" +
            "<p>" + weeklyPlan + "</p>";

    }



    // ==========================================
    // UPDATE SEASONAL RECOMMENDATION
    // ==========================================

    const seasonalElement =
        document.querySelector(
            ".routine-section:nth-of-type(4) p"
        );


    if (seasonalElement) {

        seasonalElement.innerHTML =
            seasonalRecommendation;
    }



    console.log(
        "Personalized routine generated successfully"
    );

}



// ==========================================
// LOGOUT
// ==========================================

function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("role");

    window.location.href = "login.html";

}



// ==========================================
// START DASHBOARD
// ==========================================

loadUserDashboard();