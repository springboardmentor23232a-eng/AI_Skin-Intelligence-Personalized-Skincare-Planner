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

        const baseUrl = (typeof window.APP_CONFIG !== "undefined" && window.APP_CONFIG.API_BASE_URL) ? window.APP_CONFIG.API_BASE_URL : "http://127.0.0.1:8000";

        const userResponse = await fetch(
            `${baseUrl}/dashboard/user`,
            {
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        if (!userResponse.ok) {
            throw new Error("Unable to load user details");
        }

        const userData = await userResponse.json();

        console.log("User Data:", userData);

        const userName =
            document.getElementById("userName");

        if (userName && userData.user) {

            userName.innerHTML =
                "Welcome, " +
                userData.user.name +
                " 👋";
        }


        // ==========================================
        // LOAD ASSESSMENTS
        // ==========================================

        const assessmentResponse = await fetch(
            `${baseUrl}/assessment/`,
            {
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        if (!assessmentResponse.ok) {
            throw new Error("Unable to load assessment data");
        }

        const assessments =
            await assessmentResponse.json();

        console.log(
            "Assessment Data:",
            assessments
        );


        // ==========================================
        // CHECK ASSESSMENTS
        // ==========================================

        if (
            !Array.isArray(assessments) ||
            assessments.length === 0
        ) {

            console.log("No assessment found");

            return;
        }


        // ==========================================
        // GET LATEST + PREVIOUS
        // ==========================================

        const latest =
            assessments[assessments.length - 1];

        const previous =
            assessments.length > 1
                ? assessments[assessments.length - 2]
                : null;

        console.log(
            "Latest Assessment:",
            latest
        );

        console.log(
            "Previous Assessment:",
            previous
        );


        // ==========================================
        // AI ANALYSIS
        // ==========================================

        setText(
            "acne",
            "Acne Detection: " +
            (latest.acne_level || "Not available")
        );

        setText(
            "hydration",
            "Hydration Level: " +
            (latest.hydration || "Not available")
        );

        setText(
            "spots",
            "Skin Health Score: " +
            (latest.skin_health_score ?? 0) +
            "%"
        );

        setText(
            "pigmentation",
            "Pigmentation: " +
            (latest.pigmentation || "Not available")
        );

        setText(
            "redness",
            "Redness: " +
            (latest.redness || "Not available")
        );

        setText(
            "sensitivity",
            "Sensitivity: " +
            (latest.sensitivity || "Not available")
        );


        // ==========================================
        // SKIN SCORE
        // ==========================================

        setText(
            "skinScore",
            (latest.skin_health_score ?? 0) +
            "%"
        );


        // ==========================================
        // SKIN CONDITION
        // ==========================================

        setText(
            "skinCondition",
            latest.overall_condition ||
            "Assessment completed"
        );


        // ==========================================
        // SKIN TYPE
        // ==========================================

        const skinTypeElement =
            document.getElementById(
                "dashboardSkinType"
            );

        if (skinTypeElement) {

            skinTypeElement.innerHTML =
                formatText(latest.skin_type);
        }


        // ==========================================
        // GENERATE PERSONALIZED ROUTINE
        // ==========================================

        generateRoutine(
            latest,
            previous
        );

    }

    catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );
    }
}


// ==========================================
// HELPER FUNCTION
// ==========================================

function setText(id, text) {

    const element =
        document.getElementById(id);

    if (element) {

        element.innerHTML = text;
    }
}


// ==========================================
// FORMAT TEXT
// ==========================================

function formatText(value) {

    if (!value) {
        return "Not available";
    }

    return String(value)
        .charAt(0)
        .toUpperCase() +
        String(value).slice(1);
}


// ==========================================
// PERSONALIZED ROUTINE
// ==========================================

function generateRoutine(
    assessment,
    previousAssessment = null
) {

    console.log(
        "Generating personalized routine:",
        assessment
    );


    // ==========================================
    // GET AI DATA
    // ==========================================

    const skinType =
        String(
            assessment.skin_type || ""
        ).toLowerCase();

    const mainConcern =
        String(
            assessment.main_concern || ""
        ).toLowerCase();

    const hydration =
        String(
            assessment.hydration || ""
        ).toLowerCase();

    const acneLevel =
        String(
            assessment.acne_level || ""
        ).toLowerCase();

    const pigmentation =
        String(
            assessment.pigmentation || ""
        ).toLowerCase();

    const sensitivity =
        String(
            assessment.sensitivity || ""
        ).toLowerCase();

    const score =
        Number(
            assessment.skin_health_score || 0
        );


    // ==========================================
    // OPTIONAL PROFILE DATA
    // ==========================================

    const allergies =
        String(
            assessment.allergies ||
            assessment.allergy ||
            ""
        ).toLowerCase();

    const lifestyle =
        String(
            assessment.lifestyle ||
            assessment.lifestyle_habits ||
            ""
        ).toLowerCase();

    const sleepQuality =
        String(
            assessment.sleep_quality ||
            assessment.sleep ||
            ""
        ).toLowerCase();

    const waterIntake =
        String(
            assessment.water_intake ||
            assessment.water ||
            ""
        ).toLowerCase();

    const environmentalExposure =
        String(
            assessment.environmental_exposure ||
            assessment.environment ||
            ""
        ).toLowerCase();


    // ==========================================
    // PREVIOUS SCORE
    // ==========================================

    const previousScore =
        previousAssessment
            ? Number(
                previousAssessment.skin_health_score || 0
            )
            : null;


    // ==========================================
    // CONSOLE DATA
    // ==========================================

    console.log(
        "Skin Type:",
        skinType
    );

    console.log(
        "Main Concern:",
        mainConcern
    );

    console.log(
        "Hydration:",
        hydration
    );

    console.log(
        "Acne Level:",
        acneLevel
    );

    console.log(
        "Pigmentation:",
        pigmentation
    );

    console.log(
        "Sensitivity:",
        sensitivity
    );

    console.log(
        "Current Score:",
        score
    );

    console.log(
        "Previous Score:",
        previousScore
    );

    console.log(
        "Allergies:",
        allergies || "Not provided"
    );

    console.log(
        "Lifestyle:",
        lifestyle || "Not provided"
    );

    console.log(
        "Sleep Quality:",
        sleepQuality || "Not provided"
    );

    console.log(
        "Water Intake:",
        waterIntake || "Not provided"
    );

    console.log(
        "Environmental Exposure:",
        environmentalExposure || "Not provided"
    );


    // ==========================================
    // DEFAULT ROUTINE
    // ==========================================

    let morningRoutine =
        "Gentle Cleanser → Treatment → Moisturizer → Sunscreen";

    let eveningRoutine =
        "Gentle Cleanser → Treatment → Moisturizer → Night Care";


    // ==========================================
    // WEEKLY PLAN
    // ==========================================

    let monday =
        "Hydration Care";

    let wednesday =
        "Skin Recovery";

    let friday =
        "Gentle Treatment";

    let sunday =
        "Skin Recovery";


    // ==========================================
    // SEASONAL
    // ==========================================

    let seasonalRecommendation =
        "Stay hydrated and apply broad-spectrum sunscreen regularly.";


    // ==========================================
    // ROUTINE CATEGORY DEFAULTS
    // ==========================================

    let cleansingRecommendation =
        "Use a gentle cleanser to remove dirt and excess oil.";

    let exfoliationRecommendation =
        "Use gentle exfoliation to remove dead skin cells.";

    let treatmentRecommendation =
        "Use targeted treatment based on your skin concerns.";

    let moisturizingRecommendation =
        "Use a moisturizer to maintain healthy skin hydration.";

    let sunProtectionRecommendation =
        "Use broad-spectrum sunscreen daily.";

    let nightCareRecommendation =
        "Support overnight skin recovery with gentle skincare.";


    // ==========================================
    // SKIN TYPE
    // ==========================================

    if (skinType.includes("combination")) {

        cleansingRecommendation =
            "Use a gentle cleanser that removes excess oil without drying the skin.";

        moisturizingRecommendation =
            "Use a lightweight, non-comedogenic moisturizer.";

        morningRoutine =
            "Gentle Cleanser → Treatment → Lightweight Moisturizer → Sunscreen";

        eveningRoutine =
            "Gentle Cleanser → Treatment → Lightweight Moisturizer → Night Care";
    }


    if (skinType.includes("oily")) {

        cleansingRecommendation =
            "Use a gentle cleanser to control excess oil without over-drying.";

        moisturizingRecommendation =
            "Use a lightweight, oil-free, non-comedogenic moisturizer.";

        morningRoutine =
            "Gentle Cleanser → Treatment → Oil-Free Moisturizer → Sunscreen";

        eveningRoutine =
            "Gentle Cleanser → Treatment → Lightweight Moisturizer → Night Care";
    }


    if (skinType.includes("dry")) {

        cleansingRecommendation =
            "Use a gentle hydrating cleanser to avoid stripping skin moisture.";

        moisturizingRecommendation =
            "Use a richer moisturizer to support the skin barrier.";

        morningRoutine =
            "Gentle Cleanser → Hydrating Treatment → Moisturizer → Sunscreen";

        eveningRoutine =
            "Gentle Cleanser → Hydrating Serum → Rich Moisturizer → Night Care";
    }


    // ==========================================
    // ACNE DETECTION
    // ==========================================

    const hasAcne =
        mainConcern.includes("acne") ||
        acneLevel.includes("moderate") ||
        acneLevel.includes("severe");


    if (hasAcne) {

        treatmentRecommendation =
            "Use a gentle acne-focused treatment suitable for your skin.";

        monday =
            "Acne Care";

        wednesday =
            "Hydration";

        friday =
            "Acne Care";

        sunday =
            "Skin Recovery";
    }


    // ==========================================
    // DARK SPOTS / PIGMENTATION
    // ==========================================

    const hasPigmentation =
        mainConcern.includes("dark spot") ||
        mainConcern.includes("pigmentation") ||
        pigmentation.includes("mild") ||
        pigmentation.includes("moderate");


    if (hasPigmentation) {

        if (hasAcne) {

            treatmentRecommendation =
                "Use a gentle treatment targeting acne and dark spots.";

            morningRoutine =
                "Gentle Cleanser → Acne/Brightening Treatment → Lightweight Moisturizer → Sunscreen";

            eveningRoutine =
                "Gentle Cleanser → Targeted Treatment → Moisturizer → Night Care";

        }

        else {

            treatmentRecommendation =
                "Use a gentle brightening treatment for dark-spot care.";

            morningRoutine =
                "Gentle Cleanser → Brightening Treatment → Moisturizer → Sunscreen";

            eveningRoutine =
                "Gentle Cleanser → Dark-Spot Treatment → Moisturizer → Night Care";
        }

        monday =
            "Dark-Spot Care";

        wednesday =
            "Hydration";

        friday =
            "Gentle Treatment";

        sunday =
            "Skin Recovery";
    }


    // ==========================================
    // SENSITIVITY
    // ==========================================

    const hasSensitivity =
        sensitivity.includes("moderate") ||
        sensitivity.includes("high") ||
        sensitivity.includes("severe");


    if (hasSensitivity) {

        cleansingRecommendation =
            "Use a gentle, fragrance-free cleanser suitable for sensitive skin.";

        exfoliationRecommendation =
            "Avoid harsh scrubs and keep exfoliation very gentle.";

        moisturizingRecommendation =
            "Use a fragrance-free moisturizer to support the skin barrier.";

        sunProtectionRecommendation =
            "Use gentle broad-spectrum sunscreen every day.";

        nightCareRecommendation =
            "Use soothing, fragrance-free skincare at night.";

        seasonalRecommendation =
            "Use gentle, fragrance-free skincare, avoid harsh exfoliation, and use sunscreen daily.";


        // Preserve acne + dark-spot treatment
        if (hasAcne && hasPigmentation) {

            morningRoutine =
                "Gentle Cleanser → Gentle Acne/Brightening Treatment → Fragrance-Free Moisturizer → Sunscreen";

            eveningRoutine =
                "Gentle Cleanser → Gentle Targeted Treatment → Fragrance-Free Moisturizer → Night Care";
        }

        else if (hasAcne) {

            morningRoutine =
                "Gentle Cleanser → Gentle Acne Treatment → Fragrance-Free Moisturizer → Sunscreen";

            eveningRoutine =
                "Gentle Cleanser → Gentle Acne Treatment → Fragrance-Free Moisturizer → Night Care";
        }

        else if (hasPigmentation) {

            morningRoutine =
                "Gentle Cleanser → Gentle Brightening Treatment → Fragrance-Free Moisturizer → Sunscreen";

            eveningRoutine =
                "Gentle Cleanser → Gentle Dark-Spot Treatment → Fragrance-Free Moisturizer → Night Care";
        }

        else {

            morningRoutine =
                "Gentle Cleanser → Soothing Treatment → Fragrance-Free Moisturizer → Sunscreen";

            eveningRoutine =
                "Gentle Cleanser → Soothing Serum → Fragrance-Free Moisturizer → Night Care";
        }
    }


    // ==========================================
    // LOW HYDRATION
    // ==========================================

    const lowHydration =
        hydration.includes("low") ||
        hydration.includes("poor") ||
        hydration.includes("dehydrated");


    if (lowHydration) {

        moisturizingRecommendation =
            "Use a hydrating moisturizer to support moisture retention.";

        eveningRoutine =
            "Gentle Cleanser → Hydrating Serum → Moisturizer → Night Care";

        monday =
            "Deep Hydration";

        wednesday =
            "Hydration Care";

        friday =
            "Moisture Recovery";

        sunday =
            "Skin Recovery";
    }


    // ==========================================
    // LOW HEALTH SCORE
    // ==========================================

    if (score < 60) {

        monday =
            "Skin Recovery";

        wednesday =
            "Deep Hydration";

        friday =
            "Gentle Treatment";

        sunday =
            "Recovery";
    }


    // ==========================================
    // ALLERGY SAFETY
    // ==========================================

    const hasAllergy =
        allergies &&
        allergies !== "none" &&
        allergies !== "no";


    if (hasAllergy) {

        cleansingRecommendation =
            "Use an allergy-safe, gentle cleanser and avoid known allergens.";

        exfoliationRecommendation =
            "Avoid harsh exfoliation and products containing known allergens.";

        moisturizingRecommendation =
            "Use a fragrance-free moisturizer and avoid known allergens.";

        sunProtectionRecommendation =
            "Use a sunscreen that does not contain known allergens.";

        nightCareRecommendation =
            "Use gentle, fragrance-free night care and avoid known allergens.";

        seasonalRecommendation =
            "Avoid products containing your known allergens and patch-test new products before regular use.";
    }


    // ==========================================
    // LIFESTYLE - OUTDOOR / SUN
    // ==========================================

    if (
        lifestyle.includes("outdoor") ||
        lifestyle.includes("sun") ||
        lifestyle.includes("travel")
    ) {

        sunProtectionRecommendation =
            "Prioritize daily broad-spectrum sunscreen because of increased outdoor exposure.";

        seasonalRecommendation =
            "Because of increased outdoor exposure, prioritize daily sunscreen and reapply when appropriate.";
    }


    // ==========================================
    // LIFESTYLE - EXERCISE
    // ==========================================

    if (
        lifestyle.includes("exercise") ||
        lifestyle.includes("workout") ||
        lifestyle.includes("gym")
    ) {

        cleansingRecommendation =
            "Cleanse gently after heavy sweating to remove sweat and excess oil.";

        seasonalRecommendation =
            "Cleanse after heavy sweating and maintain good hydration after exercise.";
    }


    // ==========================================
    // POOR SLEEP
    // ==========================================

    if (
        sleepQuality.includes("poor") ||
        sleepQuality.includes("low") ||
        sleepQuality.includes("bad")
    ) {

        monday =
            "Hydration Care";

        wednesday =
            "Skin Recovery";

        friday =
            "Gentle Treatment";

        sunday =
            "Recovery";

        seasonalRecommendation +=
            " Maintain a consistent sleep schedule to support overall skin health.";
    }


    // ==========================================
    // LOW WATER INTAKE
    // ==========================================

    if (
        waterIntake.includes("low") ||
        waterIntake.includes("poor") ||
        waterIntake.includes("low water")
    ) {

        moisturizingRecommendation =
            "Use a hydrating moisturizer to support skin moisture.";

        eveningRoutine =
            "Gentle Cleanser → Hydrating Serum → Moisturizer → Night Care";

        monday =
            "Deep Hydration";

        wednesday =
            "Hydration Care";

        friday =
            "Moisture Recovery";

        sunday =
            "Skin Recovery";
    }


    // ==========================================
    // ENVIRONMENTAL EXPOSURE
    // ==========================================

    if (
        environmentalExposure.includes("pollution") ||
        environmentalExposure.includes("dust") ||
        environmentalExposure.includes("high pollution")
    ) {

        cleansingRecommendation =
            "Use gentle cleansing to remove pollution, dust, and excess oil.";

        sunProtectionRecommendation =
            "Use broad-spectrum sunscreen daily to protect against UV exposure.";

        seasonalRecommendation =
            "Use gentle cleansing after high pollution exposure and maintain consistent sun protection.";
    }


    // ==========================================
    // UPDATE MORNING ROUTINE
    // ==========================================

    setText(
        "morningRoutine",
        morningRoutine
    );

    setText(
        "aiMorningRoutine",
        morningRoutine
    );


    // ==========================================
    // UPDATE EVENING ROUTINE
    // ==========================================

    setText(
        "eveningRoutine",
        eveningRoutine
    );

    setText(
        "aiEveningRoutine",
        eveningRoutine
    );


    // ==========================================
    // UPDATE WEEKLY PLAN
    // ==========================================

    setText(
        "mondayPlan",
        monday
    );

    setText(
        "wednesdayPlan",
        wednesday
    );

    setText(
        "fridayPlan",
        friday
    );

    setText(
        "sundayPlan",
        sunday
    );


    // ==========================================
    // UPDATE SEASONAL
    // ==========================================

    setText(
        "seasonalRecommendation",
        seasonalRecommendation
    );


    // ==========================================
    // UPDATE 6 ROUTINE CATEGORIES
    // ==========================================

    setText(
        "cleansingRecommendation",
        cleansingRecommendation
    );

    setText(
        "exfoliationRecommendation",
        exfoliationRecommendation
    );

    setText(
        "treatmentRecommendation",
        treatmentRecommendation
    );

    setText(
        "moisturizingRecommendation",
        moisturizingRecommendation
    );

    setText(
        "sunProtectionRecommendation",
        sunProtectionRecommendation
    );

    setText(
        "nightCareRecommendation",
        nightCareRecommendation
    );


    // ==========================================
    // SCORE COMPARISON
    // ==========================================

    if (
        previousScore !== null &&
        score > previousScore
    ) {

        console.log(
            "Skin health improved by:",
            score - previousScore,
            "points"
        );
    }


    if (
        previousScore !== null &&
        score < previousScore
    ) {

        console.log(
            "Skin health decreased by:",
            previousScore - score,
            "points"
        );
    }


    // ==========================================
    // FINAL SUCCESS MESSAGE
    // ==========================================

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

    window.location.href =
        "login.html";
}


// ==========================================
// START DASHBOARD
// ==========================================

loadUserDashboard();
// =========================================================
// REPORT DOWNLOADS
// =========================================================

const API_BASE_URL = (typeof window.APP_CONFIG !== "undefined" && window.APP_CONFIG.API_BASE_URL) ? window.APP_CONFIG.API_BASE_URL : "http://127.0.0.1:8000";


// =========================================================
// GET AUTH TOKEN
// =========================================================

function getReportToken() {

    return (
        localStorage.getItem("token") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken")
    );

}


// =========================================================
// DOWNLOAD ASSESSMENT PDF
// =========================================================

async function downloadAssessmentPDF() {

    const token = getReportToken();

    if (!token) {

        alert("Please login again.");

        return;

    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/reports/assessment/pdf`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        if (!response.ok) {

            const errorData = await response.json()
                .catch(() => ({}));

            alert(
                errorData.detail ||
                "Unable to download PDF report."
            );

            return;

        }


        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = "skin_assessment_report.pdf";

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);


    } catch (error) {

        console.error(
            "PDF DOWNLOAD ERROR:",
            error
        );

        alert(
            "Unable to download assessment PDF."
        );

    }

}


// =========================================================
// DOWNLOAD ASSESSMENT EXCEL
// =========================================================

async function downloadAssessmentExcel() {

    const token = getReportToken();

    if (!token) {

        alert("Please login again.");

        return;

    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/reports/assessment/excel`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        if (!response.ok) {

            const errorData = await response.json()
                .catch(() => ({}));

            alert(
                errorData.detail ||
                "Unable to download Excel report."
            );

            return;

        }


        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = "skin_assessment_report.xlsx";

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);


    } catch (error) {

        console.error(
            "EXCEL DOWNLOAD ERROR:",
            error
        );

        alert(
            "Unable to download assessment Excel."
        );

    }

}