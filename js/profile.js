console.log("Profile JS loaded");

// ==========================================
// LOAD PROFILE
// ==========================================

async function loadProfile() {

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const baseUrl = (typeof window.APP_CONFIG !== "undefined" && window.APP_CONFIG.API_BASE_URL) ? window.APP_CONFIG.API_BASE_URL : "http://127.0.0.1:8000";

        const response = await fetch(
            `${baseUrl}/dashboard/user`,
            {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error("Unable to load profile");
        }

        const data = await response.json();

        console.log("Profile Data:", data);

        const user = data.user || {};

        setText("profileName", user.name || "User");
        setText("profileEmail", user.email || "Email not available");
        setText("profileRole", user.role || "User");

        setInputValue("age", user.age);
        setInputValue("gender", user.gender);
        setInputValue("skinType", user.skin_type);
        setInputValue("allergies", user.allergies);

        setInputValue(
            "lifestyle",
            user.lifestyle || user.lifestyle_habits
        );

        setInputValue(
            "waterIntake",
            user.water_intake
        );

        setInputValue(
            "sleepHours",
            user.sleep_hours
        );

        setInputValue(
            "sleepQuality",
            user.sleep_quality
        );

        setInputValue(
            "environmentalExposure",
            user.environmental_exposure
        );

        loadSavedLifestyleData();

        saveWellnessScores();

    }

    catch (error) {

        console.error("Profile Error:", error);

        loadSavedLifestyleData();

        saveWellnessScores();
    }
}


// ==========================================
// SET TEXT
// ==========================================

function setText(id, value) {

    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


// ==========================================
// SET INPUT VALUE
// ==========================================

function setInputValue(id, value) {

    const element = document.getElementById(id);

    if (!element) {
        return;
    }

    if (
        value !== null &&
        value !== undefined &&
        value !== ""
    ) {
        element.value = value;
    }
}


// ==========================================
// LOAD SAVED WELLNESS DATA
// ==========================================

function loadSavedLifestyleData() {

    const savedData =
        localStorage.getItem("skinProfileWellnessData");

    if (!savedData) {
        console.log("No saved wellness data found.");
        return;
    }

    try {

        const data = JSON.parse(savedData);

        console.log("Saved wellness data:", data);

        setIfEmpty("lifestyle", data.lifestyle);
        setIfEmpty("waterIntake", data.waterIntake);
        setIfEmpty("sleepHours", data.sleepHours);
        setIfEmpty("sleepQuality", data.sleepQuality);
        setIfEmpty(
            "environmentalExposure",
            data.environmentalExposure
        );

    }

    catch (error) {

        console.error(
            "Could not read wellness data:",
            error
        );
    }
}


// ==========================================
// SET ONLY IF EMPTY
// ==========================================

function setIfEmpty(id, value) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    if (
        element.value === "" &&
        value !== null &&
        value !== undefined &&
        value !== ""
    ) {
        element.value = value;
    }
}


// ==========================================
// SAVE WELLNESS SCORES
// ==========================================

function saveWellnessScores() {

    const lifestyle =
        getValue("lifestyle");

    const waterIntake =
        getValue("waterIntake");

    const sleepHours =
        getValue("sleepHours");

    const sleepQuality =
        getValue("sleepQuality");

    const environmentalExposure =
        getValue("environmentalExposure");


    console.log(
        "Profile values used for scoring:",
        {
            lifestyle,
            environmentalExposure,
            sleepHours,
            sleepQuality
        }
    );


    // ==========================================
    // LIFESTYLE SCORE
    // ==========================================

    const lifestyleScore =
        calculateLifestyleScore(
            lifestyle,
            environmentalExposure
        );


    // ==========================================
    // SLEEP SCORE
    // ==========================================

    const sleepScore =
        calculateSleepScore(
            sleepHours,
            sleepQuality
        );


    console.log(
        "Lifestyle Impact Score:",
        lifestyleScore
    );

    console.log(
        "Sleep Quality Score:",
        sleepScore
    );


    // ==========================================
    // SAVE WELLNESS DATA
    // ==========================================

    const wellnessData = {

        lifestyle: lifestyle,

        lifestyleScore: lifestyleScore,

        waterIntake: waterIntake,

        sleepHours: sleepHours,

        sleepQuality: sleepQuality,

        sleepScore: sleepScore,

        environmentalExposure:
            environmentalExposure,

        savedAt:
            new Date().toISOString()
    };


    localStorage.setItem(
        "skinProfileWellnessData",
        JSON.stringify(wellnessData)
    );


    // ==========================================
    // SAVE LIFESTYLE SCORE
    // ==========================================

    if (lifestyleScore !== null) {

        localStorage.setItem(
            "lifestyleImpactScore",
            String(lifestyleScore)
        );

    }


    // ==========================================
    // SAVE SLEEP SCORE
    // ==========================================

    if (sleepScore !== null) {

        localStorage.setItem(
            "sleepQualityScore",
            String(sleepScore)
        );

    }


    console.log(
        "Wellness scores saved successfully."
    );

    console.log(
        "Lifestyle:",
        localStorage.getItem(
            "lifestyleImpactScore"
        )
    );

    console.log(
        "Sleep:",
        localStorage.getItem(
            "sleepQualityScore"
        )
    );
}


// ==========================================
// LIFESTYLE IMPACT SCORING
// ==========================================

function calculateLifestyleScore(
    lifestyle,
    environmentalExposure
) {

    if (
        !lifestyle &&
        !environmentalExposure
    ) {
        return null;
    }

    let score = 70;

    const lifestyleValue =
        String(lifestyle || "")
            .trim()
            .toLowerCase();


    // MATCHES YOUR PROFILE HTML

    switch (lifestyleValue) {

        case "mostly indoors":
            score = 80;
            break;

        case "frequent outdoor activity":
            score = 70;
            break;

        case "regular exercise / workout":
            score = 85;
            break;

        case "outdoor + regular exercise":
            score = 90;
            break;

        case "frequent travel":
            score = 65;
            break;
    }


    const environment =
        String(environmentalExposure || "")
            .trim()
            .toLowerCase();


    // MATCHES YOUR PROFILE HTML

    if (environment === "low") {

        score += 5;

    }

    else if (
        environment === "moderate pollution"
    ) {

        score -= 5;

    }

    else if (
        environment === "high pollution"
    ) {

        score -= 15;

    }

    else if (
        environment === "frequent dust exposure"
    ) {

        score -= 10;

    }

    else if (
        environment === "pollution + dust"
    ) {

        score -= 15;
    }


    return Math.round(
        Math.max(
            0,
            Math.min(
                100,
                score
            )
        )
    );
}


// ==========================================
// SLEEP QUALITY SCORING
// ==========================================

function calculateSleepScore(
    sleepHours,
    sleepQuality
) {

    const hasHours =
        sleepHours !== "" &&
        sleepHours !== null &&
        sleepHours !== undefined;

    const hasQuality =
        sleepQuality !== "" &&
        sleepQuality !== null &&
        sleepQuality !== undefined;


    if (
        !hasHours &&
        !hasQuality
    ) {
        return null;
    }


    const hours =
        Number(sleepHours);

    const quality =
        String(sleepQuality || "")
            .trim()
            .toLowerCase();


    let score = 70;


    if (quality === "good") {

        score = 90;

    }

    else if (quality === "average") {

        score = 70;

    }

    else if (quality === "poor") {

        score = 50;
    }


    if (!Number.isNaN(hours)) {

        if (
            hours >= 7 &&
            hours <= 9
        ) {

            score += 5;

        }

        else if (
            hours >= 6 &&
            hours < 7
        ) {

            score -= 5;

        }

        else if (
            hours > 9 &&
            hours <= 10
        ) {

            score -= 5;

        }

        else if (
            hours < 6
        ) {

            score -= 15;

        }

        else if (
            hours > 10
        ) {

            score -= 10;
        }
    }


    return Math.round(
        Math.max(
            0,
            Math.min(
                100,
                score
            )
        )
    );
}


// ==========================================
// GET VALUE
// ==========================================

function getValue(id) {

    const element =
        document.getElementById(id);

    if (!element) {
        return "";
    }

    return String(
        element.value || ""
    ).trim();
}


// ==========================================
// PROFILE FORM
// ==========================================

function setupProfileForm() {

    const profileForm =
        document.getElementById(
            "profileForm"
        );

    if (!profileForm) {
        return;
    }


    profileForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            console.log(
                "Save Profile clicked"
            );

            saveWellnessScores();

            showMessage(
                "Profile wellness information saved successfully.",
                "success"
            );

        }
    );
}


// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(
    message,
    type = "info"
) {

    const messageElement =
        document.getElementById(
            "profileMessage"
        );

    if (!messageElement) {
        return;
    }

    messageElement.textContent =
        message;

    messageElement.className =
        "profile-message " + type;
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
// START
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadProfile();

        setupProfileForm();

    }
);