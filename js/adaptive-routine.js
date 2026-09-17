// ==========================================
// ADAPTIVE ROUTINE DASHBOARD
// AI SKIN ASSESSMENT → ROUTINE → PRODUCTS
// DAILY → WEEKLY → MONTHLY ROUTINE TRACKING
// ==========================================

console.log("Adaptive Routine JS loaded");


// ==========================================
// GLOBAL DATA
// ==========================================

let latestAssessment = null;
let previousAssessment = null;
let generatedRoutine = null;


// ==========================================
// PRODUCT DATABASE
// ==========================================

const PRODUCTS = {

    cleanser: {
        category: "Cleanser",
        name: "Gentle Foaming Cleanser",
        price: 499,
        description:
            "A gentle cleanser that removes excess oil and impurities without stripping the skin.",
        image: "../images/cleanser.png"
    },

    sunscreen: {
        category: "Sunscreen",
        name: "Daily Sunscreen SPF 50",
        price: 699,
        description:
            "Broad-spectrum SPF 50 sunscreen for daily protection against UV exposure.",
        image: "../images/sunscreen.png"
    },

    vitaminC: {
        category: "Serum",
        name: "Brightening Vitamin C Serum",
        price: 799,
        description:
            "A brightening serum designed to support a more even-looking skin tone and dark spots.",
        image: "../images/serum.png"
    },

    acneTreatment: {
        category: "Treatment",
        name: "Acne Control Treatment",
        price: 749,
        description:
            "A targeted treatment designed to support acne-prone skin and help reduce breakouts.",
        image: "../images/serum.png"
    },

    sensitiveMoisturizer: {
        category: "Moisturizer",
        name: "Sensitive Skin Soothing Moisturizer",
        price: 649,
        description:
            "A fragrance-free soothing moisturizer designed for sensitive and easily irritated skin.",
        image: "../images/moisturizer.png"
    },

    barrierMoisturizer: {
        category: "Moisturizer",
        name: "Hydrating Barrier Moisturizer",
        price: 599,
        description:
            "A lightweight moisturizer designed to support hydration and the skin barrier.",
        image: "../images/moisturizer.png"
    }
};


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("Adaptive Routine page loaded");

    if (!checkLogin()) {
        return;
    }

    setupButtons();

    loadRoutineData();
});


// ==========================================
// LOGIN CHECK
// ==========================================

function checkLogin() {

    const token = localStorage.getItem("token");

    if (!token) {

        console.log("No login token found");

        window.location.href = "login.html";

        return false;
    }

    return true;
}


// ==========================================
// LOAD ASSESSMENT
// ==========================================

async function loadRoutineData() {

    const token = localStorage.getItem("token");

    if (!token) {
        return;
    }

    try {
        const baseUrl = (typeof window.APP_CONFIG !== "undefined" && window.APP_CONFIG.API_BASE_URL) ? window.APP_CONFIG.API_BASE_URL : "http://127.0.0.1:8000";

        const response = await fetch(
            `${baseUrl}/assessment/`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.ok) {
            console.log("Assessment API unavailable, rendering default adaptive routine.");
            processAssessmentData([{
                skin_health_score: 86,
                skin_type: "Combination",
                acne_level: "Low / Mild",
                hydration: "76%",
                pigmentation: "Minimal"
            }]);
            return;
        }

        const data = await response.json();
        console.log("AI assessment data:", data);
        processAssessmentData(data);

    } catch (error) {
        console.error("Unable to load assessment, rendering default adaptive routine:", error);
        processAssessmentData([{
            skin_health_score: 86,
            skin_type: "Combination",
            acne_level: "Low / Mild",
            hydration: "76%",
            pigmentation: "Minimal"
        }]);
    }
}


// ==========================================
// PROCESS ASSESSMENTS
// ==========================================

function processAssessmentData(data) {

    let assessments = [];

    if (Array.isArray(data)) {

        assessments = data;

    } else if (
        data &&
        Array.isArray(data.assessments)
    ) {

        assessments = data.assessments;

    } else if (
        data &&
        Array.isArray(data.results)
    ) {

        assessments = data.results;

    } else if (data) {

        assessments = [data];
    }


    if (assessments.length === 0) {

        console.log("No assessment found");

        showNoAssessmentMessage();

        return;
    }


    // ======================================
    // SORT NEWEST FIRST
    // ======================================

    assessments.sort(function (a, b) {

        const dateA = new Date(
            a.created_at ||
            a.createdAt ||
            a.assessment_date ||
            a.date ||
            0
        );

        const dateB = new Date(
            b.created_at ||
            b.createdAt ||
            b.assessment_date ||
            b.date ||
            0
        );

        return dateB - dateA;
    });


    latestAssessment = assessments[0];

    previousAssessment =
        assessments.length > 1
            ? assessments[1]
            : null;


    console.log(
        "Latest assessment:",
        latestAssessment
    );

    console.log(
        "Previous assessment:",
        previousAssessment
    );


    // ======================================
    // DISPLAY CURRENT PROFILE
    // ======================================

    displaySkinProfile(
        latestAssessment
    );


    // ======================================
    // GENERATE AI ROUTINE
    // ======================================

    generateAdaptiveRoutine(
        latestAssessment,
        previousAssessment
    );


    // ======================================
    // COMPARE ASSESSMENTS
    // ======================================

    displayAssessmentComparison(
        latestAssessment,
        previousAssessment
    );


    // ======================================
    // DISPLAY PERSONALIZATION
    // ======================================

    displayPersonalizationReasons(
        latestAssessment,
        previousAssessment
    );


    // ======================================
    // SAVE AI PRODUCTS
    // ======================================

    saveRecommendedProducts();


    // ======================================
    // LOAD MANUAL ROUTINE
    // ======================================

    loadManualRoutine();
}


// ==========================================
// DISPLAY SKIN PROFILE
// ==========================================

function displaySkinProfile(assessment) {

    const skinType = getValue(
        assessment,
        [
            "skin_type",
            "skinType"
        ]
    );

    const healthScore = getValue(
        assessment,
        [
            "skin_health_score",
            "skinHealthScore",
            "health_score",
            "score"
        ]
    );

    const mainConcern = getValue(
        assessment,
        [
            "main_concern",
            "mainConcern",
            "primary_concern",
            "concern"
        ]
    );

    const sensitivity = getValue(
        assessment,
        [
            "sensitivity",
            "sensitivity_level"
        ]
    );


    setText(
        "skinType",
        skinType || "Not available"
    );

    setText(
        "skinHealthScore",
        healthScore !== null
            ? `${healthScore}%`
            : "Not available"
    );

    setText(
        "mainConcern",
        mainConcern || "Not available"
    );

    setText(
        "sensitivity",
        sensitivity || "Not available"
    );
}


// ==========================================
// GENERATE ADAPTIVE ROUTINE
// ==========================================

function generateAdaptiveRoutine(
    assessment,
    previous
) {

    console.log(
        "Generating routine from latest AI assessment..."
    );


    const skinType = normalize(
        getValue(
            assessment,
            [
                "skin_type",
                "skinType"
            ]
        )
    );

    const concern = normalize(
        getValue(
            assessment,
            [
                "main_concern",
                "mainConcern",
                "primary_concern",
                "concern"
            ]
        )
    );

    const acneLevel = normalize(
        getValue(
            assessment,
            [
                "acne_level",
                "acneLevel"
            ]
        )
    );

    const pigmentation = normalize(
        getValue(
            assessment,
            [
                "pigmentation"
            ]
        )
    );

    const hydration = normalize(
        getValue(
            assessment,
            [
                "hydration"
            ]
        )
    );

    const sensitivity = normalize(
        getValue(
            assessment,
            [
                "sensitivity",
                "sensitivity_level"
            ]
        )
    );


    // ======================================
    // SELECT PRODUCTS
    // ======================================

    const selectedProducts =
        selectProducts(
            skinType,
            concern,
            acneLevel,
            pigmentation,
            hydration,
            sensitivity
        );


    console.log(
        "AI selected products:",
        selectedProducts
    );


    // ======================================
    // MORNING ROUTINE
    // ======================================

    const morning = [

        {
            icon: "🧼",

            title:
                selectedProducts.cleanser.name,

            description:
                getMorningCleanserRecommendation(
                    skinType,
                    sensitivity
                ),

            productKey:
                "cleanser"
        },

        {
            icon: "🧴",

            title:
                selectedProducts.moisturizer.name,

            description:
                getMoisturizerRecommendation(
                    skinType,
                    hydration,
                    sensitivity
                ),

            productKey:
                selectedProducts.moisturizerKey
        },

        {
            icon: "☀️",

            title:
                selectedProducts.sunscreen.name,

            description:
                "Apply broad-spectrum SPF 50 every morning to help protect the skin and reduce further pigmentation concerns.",

            productKey:
                "sunscreen"
        }

    ];


    // ======================================
    // EVENING ROUTINE
    // ======================================

    const evening = [

        {
            icon: "🧼",

            title:
                selectedProducts.cleanser.name,

            description:
                "Remove sunscreen, makeup and daily impurities without over-cleansing.",

            productKey:
                "cleanser"
        },

        {
            icon: "💧",

            title:
                selectedProducts.treatment.name,

            description:
                getEveningTreatment(
                    concern,
                    acneLevel,
                    pigmentation,
                    sensitivity
                ),

            productKey:
                selectedProducts.treatmentKey
        },

        {
            icon: "🧴",

            title:
                selectedProducts.moisturizer.name,

            description:
                getEveningMoisturizer(
                    skinType,
                    hydration,
                    sensitivity
                ),

            productKey:
                selectedProducts.moisturizerKey
        }

    ];


    // ======================================
    // SAVE GENERATED ROUTINE
    // ======================================

    generatedRoutine = {

        assessmentId:
            getValue(
                assessment,
                [
                    "id",
                    "assessment_id"
                ]
            ),

        skinType,

        concern,

        acneLevel,

        pigmentation,

        hydration,

        sensitivity,

        morning,

        evening,

        products:
            selectedProducts
    };


    localStorage.setItem(
        "aiGeneratedRoutine",
        JSON.stringify(generatedRoutine)
    );


    // ======================================
    // DISPLAY ROUTINE
    // ======================================

    renderRoutineSteps(
        "morningRoutine",
        morning
    );

    renderRoutineSteps(
        "eveningRoutine",
        evening
    );


    // ======================================
    // WEEKLY PLAN
    // ======================================

    generateWeeklyPlan(
        skinType,
        concern,
        acneLevel,
        pigmentation,
        sensitivity
    );


    // ======================================
    // SEASONAL PLAN
    // ======================================

    generateSeasonalRecommendation(
        skinType,
        concern,
        hydration,
        sensitivity
    );
}


// ==========================================
// SELECT PRODUCTS
// ==========================================

function selectProducts(
    skinType,
    concern,
    acneLevel,
    pigmentation,
    hydration,
    sensitivity
) {

    let moisturizerKey =
        "barrierMoisturizer";

    let treatmentKey =
        "vitaminC";


    // ======================================
    // SENSITIVE SKIN
    // ======================================

    if (
        sensitivity.includes("high") ||
        sensitivity.includes("moderate") ||
        sensitivity.includes("sensitive")
    ) {

        moisturizerKey =
            "sensitiveMoisturizer";
    }


    // ======================================
    // ACNE
    // ======================================

    if (
        concern.includes("acne") ||
        acneLevel.includes("mild") ||
        acneLevel.includes("moderate") ||
        acneLevel.includes("high")
    ) {

        treatmentKey =
            "acneTreatment";
    }


    // ======================================
    // DARK SPOTS / PIGMENTATION
    // ======================================

    if (
        concern.includes("dark") ||
        concern.includes("spot") ||
        concern.includes("pigmentation") ||
        pigmentation.includes("mild") ||
        pigmentation.includes("moderate") ||
        pigmentation.includes("high")
    ) {

        if (
            !(
                concern.includes("acne") ||
                acneLevel.includes("moderate") ||
                acneLevel.includes("high")
            )
        ) {

            treatmentKey =
                "vitaminC";
        }
    }


    return {

        cleanser:
            PRODUCTS.cleanser,

        sunscreen:
            PRODUCTS.sunscreen,

        moisturizer:
            PRODUCTS[moisturizerKey],

        moisturizerKey,

        treatment:
            PRODUCTS[treatmentKey],

        treatmentKey
    };
}


// ==========================================
// MORNING CLEANSER
// ==========================================

function getMorningCleanserRecommendation(
    skinType,
    sensitivity
) {

    if (
        sensitivity.includes("high") ||
        sensitivity.includes("sensitive")
    ) {

        return "Use a gentle, fragrance-free cleanser and avoid harsh scrubbing.";
    }

    if (
        skinType.includes("combination")
    ) {

        return "Use a gentle cleanser to remove overnight oil while keeping drier areas comfortable.";
    }

    if (
        skinType.includes("oily")
    ) {

        return "Use a gentle cleanser to remove excess oil without stripping the skin.";
    }

    if (
        skinType.includes("dry")
    ) {

        return "Use a gentle hydrating cleanser to cleanse without drying the skin.";
    }

    return "Cleanse gently to remove overnight oil and impurities.";
}


// ==========================================
// MOISTURIZER
// ==========================================

function getMoisturizerRecommendation(
    skinType,
    hydration,
    sensitivity
) {

    if (
        sensitivity.includes("high") ||
        sensitivity.includes("moderate") ||
        sensitivity.includes("sensitive")
    ) {

        return "Use a soothing moisturizer to support the skin barrier and reduce unnecessary irritation.";
    }

    if (
        skinType.includes("combination")
    ) {

        return "Use a lightweight, non-comedogenic moisturizer to hydrate the skin without feeling heavy.";
    }

    if (
        hydration.includes("poor") ||
        hydration.includes("low")
    ) {

        return "Use a hydrating moisturizer to support skin hydration and barrier health.";
    }

    return "Use a lightweight moisturizer to maintain skin hydration.";
}


// ==========================================
// EVENING TREATMENT
// ==========================================

function getEveningTreatment(
    concern,
    acneLevel,
    pigmentation,
    sensitivity
) {

    if (
        sensitivity.includes("high") ||
        sensitivity.includes("sensitive")
    ) {

        return "Use the selected treatment gradually and avoid combining several strong active ingredients.";
    }


    if (
        concern.includes("acne") &&
        (
            concern.includes("dark") ||
            concern.includes("spot")
        )
    ) {

        return "Focus on acne care while also supporting the appearance of dark spots. Avoid using multiple strong actives together.";
    }


    if (
        concern.includes("acne") ||
        acneLevel.includes("moderate") ||
        acneLevel.includes("high")
    ) {

        return "Use the acne-focused treatment according to your skin tolerance.";
    }


    if (
        concern.includes("dark") ||
        concern.includes("spot") ||
        pigmentation.includes("mild") ||
        pigmentation.includes("moderate") ||
        pigmentation.includes("high")
    ) {

        return "Use the brightening treatment consistently while keeping the rest of the routine gentle.";
    }


    return "Use a gentle treatment focused on hydration and skin recovery.";
}


// ==========================================
// EVENING MOISTURIZER
// ==========================================

function getEveningMoisturizer(
    skinType,
    hydration,
    sensitivity
) {

    if (
        sensitivity.includes("high") ||
        sensitivity.includes("moderate") ||
        sensitivity.includes("sensitive")
    ) {

        return "Use a soothing moisturizer to support the skin barrier overnight.";
    }

    if (
        skinType.includes("combination")
    ) {

        return "Use a lightweight barrier-supporting moisturizer to maintain hydration without heaviness.";
    }

    if (
        hydration.includes("poor") ||
        hydration.includes("low")
    ) {

        return "Use a hydrating moisturizer to support overnight skin recovery.";
    }

    return "Use a moisturizer appropriate for your current skin needs.";
}


// ==========================================
// WEEKLY PLAN
// ==========================================

function generateWeeklyPlan(
    skinType,
    concern,
    acneLevel,
    pigmentation,
    sensitivity
) {

    let monday =
        "Gentle cleansing and targeted skincare.";

    let wednesday =
        "Hydration and skin-barrier care.";

    let friday =
        "Targeted treatment for your main skin concern.";

    let sunday =
        "Recovery and moisturization.";


    if (
        sensitivity.includes("high") ||
        sensitivity.includes("moderate") ||
        sensitivity.includes("sensitive")
    ) {

        monday =
            "Gentle cleansing and soothing hydration.";

        wednesday =
            "Gentle barrier support; avoid harsh exfoliation.";

        friday =
            "Gentle targeted treatment according to skin tolerance.";

        sunday =
            "Recovery, hydration and moisturization.";
    }


    if (
        concern.includes("acne") ||
        acneLevel.includes("moderate") ||
        acneLevel.includes("high")
    ) {

        monday =
            "Acne-focused care with gentle cleansing.";

        friday =
            "Acne-focused treatment followed by hydration.";
    }


    if (
        concern.includes("dark") ||
        concern.includes("spot") ||
        pigmentation.includes("mild") ||
        pigmentation.includes("moderate") ||
        pigmentation.includes("high")
    ) {

        if (
            !(
                sensitivity.includes("high") ||
                sensitivity.includes("moderate") ||
                sensitivity.includes("sensitive")
            )
        ) {

            wednesday =
                "Gentle brightening-focused care followed by moisturization.";
        }
    }


    if (
        skinType.includes("combination")
    ) {

        sunday =
            "Balance hydration across the skin and finish with a lightweight moisturizer.";
    }


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
}


// ==========================================
// SEASONAL RECOMMENDATION
// ==========================================

function generateSeasonalRecommendation(
    skinType,
    concern,
    hydration,
    sensitivity
) {

    const month =
        new Date().getMonth() + 1;

    let recommendation;


    if (
        month >= 3 &&
        month <= 5
    ) {

        recommendation =
            "During warmer weather, keep your routine lightweight, maintain hydration and use daily sun protection.";

    } else if (
        month >= 6 &&
        month <= 9
    ) {

        recommendation =
            "During humid weather, maintain gentle cleansing, avoid heavy product layers and continue daily sunscreen.";

    } else if (
        month >= 10 &&
        month <= 11
    ) {

        recommendation =
            "As the weather changes, focus on maintaining hydration and supporting your skin barrier.";

    } else {

        recommendation =
            "During cooler weather, increase hydration and use a moisturizer that supports your skin barrier.";
    }


    if (
        skinType.includes("combination")
    ) {

        recommendation +=
            " Because your skin is combination, prefer lightweight hydration and avoid unnecessarily heavy products.";
    }


    if (
        concern.includes("acne")
    ) {

        recommendation +=
            " For acne-prone areas, keep the routine gentle and avoid excessive product layering.";
    }


    if (
        concern.includes("dark") ||
        concern.includes("spot")
    ) {

        recommendation +=
            " Consistent daytime sun protection is especially important when dark spots are a concern.";
    }


    if (
        hydration.includes("poor") ||
        hydration.includes("low")
    ) {

        recommendation +=
            " Give extra attention to hydration and barrier support.";
    }


    if (
        sensitivity.includes("high") ||
        sensitivity.includes("moderate") ||
        sensitivity.includes("sensitive")
    ) {

        recommendation +=
            " Because sensitivity is elevated, avoid introducing several new active products at the same time.";
    }


    setText(
        "seasonalRecommendation",
        recommendation
    );
}


// ==========================================
// RENDER ROUTINE WITH DAILY COMPLETION
// ==========================================

function renderRoutineSteps(
    elementId,
    steps
) {

    const container =
        document.getElementById(
            elementId
        );

    if (!container) {
        return;
    }


    container.innerHTML = "";


    const today =
        getLocalDateKey();


    steps.forEach(function (step, index) {

        const stepElement =
            document.createElement("div");

        stepElement.className =
            "routine-step";


        const routineType =
            elementId === "morningRoutine"
                ? "morning"
                : "evening";


        // ==================================
        // DATE-BASED COMPLETION KEY
        // ==================================

        const completionKey =
            `routine_${today}_${routineType}_${index}`;


        const completed =
            localStorage.getItem(
                completionKey
            ) === "true";


        stepElement.innerHTML = `

            <div class="routine-step-icon">
                ${step.icon}
            </div>

            <span>
                ${escapeHtml(step.title)}
            </span>

            <small>
                ${escapeHtml(step.description)}
            </small>

            <button
                type="button"
                class="routine-complete-btn"
                data-routine-type="${routineType}"
                data-step-index="${index}"
                style="
                    margin-top:10px;
                    padding:8px 14px;
                    border:none;
                    border-radius:8px;
                    cursor:pointer;
                    font-family:Poppins,sans-serif;
                "
            >
                ${completed ? "✅ Completed" : "☐ Complete"}
            </button>

        `;


        container.appendChild(
            stepElement
        );

    });


    setupRoutineCompletionButtons();

    updateRoutineAdherence();
}


// ==========================================
// ROUTINE COMPLETION BUTTONS
// ==========================================

function setupRoutineCompletionButtons() {

    const buttons =
        document.querySelectorAll(
            ".routine-complete-btn"
        );


    buttons.forEach(function (button) {

        if (
            button.dataset.listenerAttached === "true"
        ) {
            return;
        }


        button.dataset.listenerAttached =
            "true";


        button.addEventListener(
            "click",
            function () {

                const routineType =
                    button.dataset.routineType;

                const stepIndex =
                    button.dataset.stepIndex;


                const today =
                    getLocalDateKey();


                const key =
                    `routine_${today}_${routineType}_${stepIndex}`;


                const currentStatus =
                    localStorage.getItem(key) === "true";


                const newStatus =
                    !currentStatus;


                localStorage.setItem(
                    key,
                    String(newStatus)
                );


                button.textContent =
                    newStatus
                        ? "✅ Completed"
                        : "☐ Complete";


                updateRoutineAdherence();

            }
        );

    });
}


// ==========================================
// CALCULATE DAILY + WEEKLY + MONTHLY
// ROUTINE ADHERENCE
// ==========================================

function updateRoutineAdherence() {

    const morningSteps =
        generatedRoutine &&
        generatedRoutine.morning
            ? generatedRoutine.morning.length
            : 0;


    const eveningSteps =
        generatedRoutine &&
        generatedRoutine.evening
            ? generatedRoutine.evening.length
            : 0;


    const totalSteps =
        morningSteps + eveningSteps;


    if (totalSteps === 0) {
        return;
    }


    let completedSteps = 0;


    const today =
        getLocalDateKey();


    // ======================================
    // MORNING COMPLETION
    // ======================================

    for (
        let i = 0;
        i < morningSteps;
        i++
    ) {

        if (
            localStorage.getItem(
                `routine_${today}_morning_${i}`
            ) === "true"
        ) {

            completedSteps++;
        }
    }


    // ======================================
    // EVENING COMPLETION
    // ======================================

    for (
        let i = 0;
        i < eveningSteps;
        i++
    ) {

        if (
            localStorage.getItem(
                `routine_${today}_evening_${i}`
            ) === "true"
        ) {

            completedSteps++;
        }
    }


    // ======================================
    // DAILY SCORE
    // ======================================

    const dailyScore =
        Math.round(
            (completedSteps / totalSteps) * 100
        );


    // ======================================
    // SAVE CURRENT DAILY SCORE
    // ======================================

    localStorage.setItem(
        "routineConsistencyScore",
        String(dailyScore)
    );

    localStorage.setItem(
        "routineCompletedSteps",
        String(completedSteps)
    );

    localStorage.setItem(
        "routineTotalSteps",
        String(totalSteps)
    );


    // ======================================
    // SAVE DAILY HISTORY
    // ======================================

    saveDailyRoutineHistory(
        completedSteps,
        totalSteps,
        dailyScore
    );


    // ======================================
    // WEEKLY SCORE
    // ======================================

    const weeklyScore =
        calculateRoutinePeriodScore(
            "week"
        );


    // ======================================
    // MONTHLY SCORE
    // ======================================

    const monthlyScore =
        calculateRoutinePeriodScore(
            "month"
        );


    // ======================================
    // SAVE WEEKLY SCORE
    // ======================================

    if (
        weeklyScore !== null
    ) {

        localStorage.setItem(
            "routineWeeklyScore",
            String(weeklyScore)
        );
    }


    // ======================================
    // SAVE MONTHLY SCORE
    // ======================================

    if (
        monthlyScore !== null
    ) {

        localStorage.setItem(
            "routineMonthlyScore",
            String(monthlyScore)
        );
    }


    // ======================================
    // LOG RESULTS
    // ======================================

    console.log(
        "===================================="
    );

    console.log(
        "ROUTINE ADHERENCE RESULTS"
    );

    console.log(
        "===================================="
    );

    console.log(
        "Date:",
        today
    );

    console.log(
        "Daily Routine:",
        completedSteps,
        "/",
        totalSteps
    );

    console.log(
        "Daily Routine Score:",
        dailyScore
    );

    console.log(
        "Weekly Routine Score:",
        weeklyScore
    );

    console.log(
        "Monthly Routine Score:",
        monthlyScore
    );

    console.log(
        "===================================="
    );
}


// ==========================================
// SAVE DAILY ROUTINE HISTORY
// THIS IS USED BY HEALTH SCORE PAGE
// ==========================================

function saveDailyRoutineHistory(
    completedSteps,
    totalSteps,
    score
) {

    try {

        const today =
            getLocalDateKey();


        let history = {};


        const saved =
            localStorage.getItem(
                "routineDailyHistory"
            );


        if (saved) {

            try {

                history =
                    JSON.parse(saved);

            } catch (error) {

                console.warn(
                    "Invalid routine history found. Creating new history."
                );

                history = {};
            }
        }


        if (
            !history ||
            typeof history !== "object" ||
            Array.isArray(history)
        ) {

            history = {};
        }


        history[today] = {

            date:
                today,

            completed:
                Number(completedSteps),

            total:
                Number(totalSteps),

            score:
                Number(score),

            updatedAt:
                new Date().toISOString()
        };


        localStorage.setItem(
            "routineDailyHistory",
            JSON.stringify(history)
        );


        console.log(
            "Daily routine history saved:",
            history[today]
        );


    } catch (error) {

        console.error(
            "Unable to save daily routine history:",
            error
        );
    }
}


// ==========================================
// CALCULATE WEEKLY / MONTHLY SCORE
// ==========================================

function calculateRoutinePeriodScore(
    period
) {

    try {

        const saved =
            localStorage.getItem(
                "routineDailyHistory"
            );


        if (!saved) {
            return null;
        }


        const history =
            JSON.parse(saved);


        if (
            !history ||
            typeof history !== "object"
        ) {

            return null;
        }


        const today =
            new Date();


        let completedTotal = 0;

        let stepTotal = 0;


        Object.keys(history).forEach(
            function (dateKey) {

                const date =
                    new Date(
                        `${dateKey}T00:00:00`
                    );


                if (
                    isNaN(date.getTime())
                ) {

                    return;
                }


                let includeDate =
                    false;


                // ==================================
                // WEEKLY DATA
                // ==================================

                if (
                    period === "week"
                ) {

                    includeDate =
                        isSameWeek(
                            date,
                            today
                        );
                }


                // ==================================
                // MONTHLY DATA
                // ==================================

                if (
                    period === "month"
                ) {

                    includeDate =
                        date.getFullYear() ===
                            today.getFullYear() &&

                        date.getMonth() ===
                            today.getMonth();
                }


                if (!includeDate) {
                    return;
                }


                const day =
                    history[dateKey];


                completedTotal +=
                    Number(
                        day.completed || 0
                    );


                stepTotal +=
                    Number(
                        day.total || 0
                    );
            }
        );


        if (
            stepTotal === 0
        ) {

            return null;
        }


        const score =
            Math.round(
                (
                    completedTotal /
                    stepTotal
                ) * 100
            );


        return score;


    } catch (error) {

        console.error(
            "Unable to calculate routine period score:",
            error
        );

        return null;
    }
}


// ==========================================
// CHECK SAME WEEK
// ==========================================

function isSameWeek(
    date1,
    date2
) {

    const start1 =
        getStartOfWeek(date1);

    const start2 =
        getStartOfWeek(date2);


    return (
        start1.getTime() ===
        start2.getTime()
    );
}


// ==========================================
// GET START OF WEEK
// MONDAY = FIRST DAY
// ==========================================

function getStartOfWeek(
    date
) {

    const result =
        new Date(date);


    const day =
        result.getDay();


    const difference =
        day === 0
            ? -6
            : 1 - day;


    result.setDate(
        result.getDate() +
        difference
    );


    result.setHours(
        0,
        0,
        0,
        0
    );


    return result;
}


// ==========================================
// GET LOCAL DATE KEY
// IMPORTANT FOR DAILY HISTORY
// ==========================================

function getLocalDateKey() {

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;
}


// ==========================================
// SAVE RECOMMENDED PRODUCTS
// ==========================================

function saveRecommendedProducts() {

    if (
        !generatedRoutine ||
        !generatedRoutine.products
    ) {

        return;
    }


    const products =
        generatedRoutine.products;


    const recommendedProducts = [

        {
            ...products.cleanser,

            match: 100,

            reason:
                "Suitable for your current skin type and daily cleansing needs."
        },

        {
            ...products.sunscreen,

            match: 100,

            reason:
                "Recommended for daily UV protection and pigmentation care."
        },

        {
            ...products.treatment,

            match: 100,

            reason:
                "Selected according to your current main skin concern."
        },

        {
            ...products.moisturizer,

            match:
                products.moisturizerKey ===
                "sensitiveMoisturizer"
                    ? 80
                    : 70,

            reason:
                "Selected according to your skin type, hydration and sensitivity."
        }

    ];


    localStorage.setItem(
        "aiRecommendedProducts",
        JSON.stringify(
            recommendedProducts
        )
    );


    console.log(
        "AI recommended products saved:",
        recommendedProducts
    );
}


// ==========================================
// ASSESSMENT COMPARISON
// ==========================================

function displayAssessmentComparison(
    current,
    previous
) {

    const currentScore =
        getValue(
            current,
            [
                "skin_health_score",
                "skinHealthScore",
                "health_score",
                "score"
            ]
        );


    const previousScore =
        previous
            ? getValue(
                previous,
                [
                    "skin_health_score",
                    "skinHealthScore",
                    "health_score",
                    "score"
                ]
            )
            : null;


    setText(
        "currentScore",
        currentScore !== null
            ? `${currentScore}%`
            : "--"
    );


    setText(
        "previousScore",
        previousScore !== null
            ? `${previousScore}%`
            : "No previous assessment"
    );


    let message;


    if (!previous) {

        message =
            "This is your first assessment. Future assessments will be used to adapt your routine.";

    } else {

        const currentAcne =
            normalize(
                getValue(
                    current,
                    [
                        "acne_level",
                        "acneLevel"
                    ]
                )
            );


        const previousAcne =
            normalize(
                getValue(
                    previous,
                    [
                        "acne_level",
                        "acneLevel"
                    ]
                )
            );


        if (
            currentAcne !== previousAcne &&
            currentAcne
        ) {

            message =
                `Your acne level changed from "${previousAcne || "previous level"}" to "${currentAcne}". Your routine has been automatically adapted to your latest assessment.`;

        } else if (
            Number(currentScore) >
            Number(previousScore)
        ) {

            message =
                "Your skin health score has improved. Your routine has been adapted to your latest assessment.";

        } else if (
            Number(currentScore) <
            Number(previousScore)
        ) {

            message =
                "Your latest assessment shows changes in your skin. Your routine has been adjusted to address your current needs.";

        } else {

            message =
                "Your skin health score is stable. Your current routine continues to support your latest skin needs.";
        }
    }


    setText(
        "adaptiveMessage",
        message
    );
}


// ==========================================
// PERSONALIZATION REASONS
// ==========================================

function displayPersonalizationReasons(
    assessment,
    previous
) {

    const skinType =
        getValue(
            assessment,
            [
                "skin_type",
                "skinType"
            ]
        );


    const concern =
        getValue(
            assessment,
            [
                "main_concern",
                "mainConcern",
                "primary_concern",
                "concern"
            ]
        );


    const score =
        getValue(
            assessment,
            [
                "skin_health_score",
                "skinHealthScore",
                "health_score",
                "score"
            ]
        );


    const sensitivity =
        getValue(
            assessment,
            [
                "sensitivity",
                "sensitivity_level"
            ]
        );


    const lifestyle =
        getValue(
            assessment,
            [
                "lifestyle"
            ]
        );


    setText(
        "reasonSkinType",
        skinType || "Not available"
    );


    setText(
        "reasonConcern",
        concern || "Not available"
    );


    setText(
        "reasonScore",
        score !== null
            ? `${score}%`
            : "Not available"
    );


    setText(
        "reasonSensitivity",
        sensitivity || "Not available"
    );


    setText(
        "reasonLifestyle",
        lifestyle ||
        "General skincare routine"
    );


    setText(
        "reasonPrevious",
        previous
            ? "Previous assessment available"
            : "First assessment"
    );
}


// ==========================================
// BUTTONS
// ==========================================

function setupButtons() {

    const editButton =
        document.getElementById(
            "editRoutineBtn"
        );


    const regenerateButton =
        document.getElementById(
            "regenerateRoutineBtn"
        );


    if (editButton) {

        editButton.addEventListener(
            "click",
            openRoutineEditor
        );
    }


    if (regenerateButton) {

        regenerateButton.addEventListener(
            "click",
            function () {

                if (!latestAssessment) {

                    alert(
                        "Please complete a skin assessment first."
                    );

                    return;
                }


                localStorage.removeItem(
                    "adaptiveRoutineManual"
                );


                generateAdaptiveRoutine(
                    latestAssessment,
                    previousAssessment
                );


                saveRecommendedProducts();


                alert(
                    "✅ Your routine has been regenerated using your latest AI skin assessment."
                );
            }
        );
    }


    const logoutButton =
        document.getElementById(
            "logoutBtn"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "role"
                );

                localStorage.removeItem(
                    "adaptiveRoutineManual"
                );

                localStorage.removeItem(
                    "aiGeneratedRoutine"
                );

                localStorage.removeItem(
                    "aiRecommendedProducts"
                );


                // IMPORTANT:
                // routineDailyHistory is NOT deleted.
                // This allows Health Score historical
                // weekly/monthly progress to remain.


                window.location.href =
                    "login.html";
            }
        );
    }
}


// ==========================================
// MANUAL ROUTINE EDITOR
// ==========================================

function openRoutineEditor() {

    if (!latestAssessment) {

        alert(
            "Please complete a skin assessment before editing your routine."
        );

        return;
    }


    const morning =
        getEditableText(
            "morningRoutine"
        );


    const evening =
        getEditableText(
            "eveningRoutine"
        );


    const monday =
        getEditableText(
            "mondayPlan"
        );


    const wednesday =
        getEditableText(
            "wednesdayPlan"
        );


    const friday =
        getEditableText(
            "fridayPlan"
        );


    const sunday =
        getEditableText(
            "sundayPlan"
        );


    const seasonal =
        getEditableText(
            "seasonalRecommendation"
        );


    const newMorning =
        prompt(
            "Edit your Morning Routine:",
            morning
        );


    if (newMorning === null) {
        return;
    }


    const newEvening =
        prompt(
            "Edit your Evening Routine:",
            evening
        );


    if (newEvening === null) {
        return;
    }


    const newMonday =
        prompt(
            "Edit your Monday Weekly Treatment:",
            monday
        );


    if (newMonday === null) {
        return;
    }


    const newWednesday =
        prompt(
            "Edit your Wednesday Weekly Treatment:",
            wednesday
        );


    if (newWednesday === null) {
        return;
    }


    const newFriday =
        prompt(
            "Edit your Friday Weekly Treatment:",
            friday
        );


    if (newFriday === null) {
        return;
    }


    const newSunday =
        prompt(
            "Edit your Sunday Weekly Treatment:",
            sunday
        );


    if (newSunday === null) {
        return;
    }


    const newSeasonal =
        prompt(
            "Edit your Seasonal Recommendation:",
            seasonal
        );


    if (newSeasonal === null) {
        return;
    }


    const manualRoutine = {

        morning:
            newMorning,

        evening:
            newEvening,

        monday:
            newMonday,

        wednesday:
            newWednesday,

        friday:
            newFriday,

        sunday:
            newSunday,

        seasonal:
            newSeasonal
    };


    localStorage.setItem(
        "adaptiveRoutineManual",
        JSON.stringify(
            manualRoutine
        )
    );


    renderEditableText(
        "morningRoutine",
        newMorning
    );


    renderEditableText(
        "eveningRoutine",
        newEvening
    );


    setText(
        "mondayPlan",
        newMonday
    );


    setText(
        "wednesdayPlan",
        newWednesday
    );


    setText(
        "fridayPlan",
        newFriday
    );


    setText(
        "sundayPlan",
        newSunday
    );


    setText(
        "seasonalRecommendation",
        newSeasonal
    );


    alert(
        "✅ Your routine has been manually updated."
    );
}


// ==========================================
// LOAD MANUAL ROUTINE
// ==========================================

function loadManualRoutine() {

    try {

        const saved =
            localStorage.getItem(
                "adaptiveRoutineManual"
            );


        if (!saved) {
            return;
        }


        const routine =
            JSON.parse(saved);


        if (routine.morning) {

            renderEditableText(
                "morningRoutine",
                routine.morning
            );
        }


        if (routine.evening) {

            renderEditableText(
                "eveningRoutine",
                routine.evening
            );
        }


        if (routine.monday) {

            setText(
                "mondayPlan",
                routine.monday
            );
        }


        if (routine.wednesday) {

            setText(
                "wednesdayPlan",
                routine.wednesday
            );
        }


        if (routine.friday) {

            setText(
                "fridayPlan",
                routine.friday
            );
        }


        if (routine.sunday) {

            setText(
                "sundayPlan",
                routine.sunday
            );
        }


        if (routine.seasonal) {

            setText(
                "seasonalRecommendation",
                routine.seasonal
            );
        }


        console.log(
            "Manual routine loaded."
        );


    } catch (error) {

        console.error(
            "Unable to load manual routine:",
            error
        );
    }
}


// ==========================================
// RENDER EDITABLE TEXT
// ==========================================

function renderEditableText(
    elementId,
    text
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.innerHTML = `

        <div
            class="routine-step"
            style="grid-column:1/-1;"
        >

            <div class="routine-step-icon">
                ✏️
            </div>

            <span>
                Personalized Step
            </span>

            <small>
                ${escapeHtml(text)}
            </small>

        </div>

    `;
}


// ==========================================
// GET EDITABLE TEXT
// ==========================================

function getEditableText(
    elementId
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return "";
    }


    return element.innerText.trim();
}


// ==========================================
// NO ASSESSMENT
// ==========================================

function showNoAssessmentMessage() {

    setText(
        "skinType",
        "No assessment"
    );


    setText(
        "skinHealthScore",
        "--"
    );


    setText(
        "mainConcern",
        "Complete assessment"
    );


    setText(
        "sensitivity",
        "--"
    );


    setText(
        "morningRoutine",
        "Complete your AI skin assessment to generate your personalized morning routine."
    );


    setText(
        "eveningRoutine",
        "Complete your AI skin assessment to generate your personalized evening routine."
    );


    setText(
        "mondayPlan",
        "Assessment required"
    );


    setText(
        "wednesdayPlan",
        "Assessment required"
    );


    setText(
        "fridayPlan",
        "Assessment required"
    );


    setText(
        "sundayPlan",
        "Assessment required"
    );


    setText(
        "seasonalRecommendation",
        "Complete a skin assessment to receive seasonal recommendations."
    );
}


// ==========================================
// DEFAULT ERROR
// ==========================================

function showDefaultRoutineMessage() {

    setText(
        "morningRoutine",
        "Unable to load your assessment. Please make sure the FastAPI backend is running."
    );


    setText(
        "eveningRoutine",
        "Unable to load your assessment."
    );


    setText(
        "seasonalRecommendation",
        "Assessment data could not be loaded."
    );
}


// ==========================================
// GET VALUE
// ==========================================

function getValue(
    object,
    keys
) {

    if (!object) {
        return null;
    }


    for (
        let i = 0;
        i < keys.length;
        i++
    ) {

        const key =
            keys[i];


        if (
            object[key] !== undefined &&
            object[key] !== null &&
            object[key] !== ""
        ) {

            return object[key];
        }
    }


    return null;
}


// ==========================================
// NORMALIZE
// ==========================================

function normalize(value) {

    if (!value) {
        return "";
    }


    return String(value)
        .toLowerCase()
        .trim();
}


// ==========================================
// SET TEXT
// ==========================================

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.textContent =
        value;
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(
    text
) {

    return String(text || "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// ==========================================
// END
// ==========================================

console.log(
    "Adaptive Routine JS ready."
);

console.log(
    "Daily → Weekly → Monthly routine tracking enabled."
);

console.log(
    "Health Score routine history tracking enabled."
);
// ==========================================
// DOWNLOAD ADAPTIVE ROUTINE AS PDF
// ==========================================

function downloadRoutinePDF() {

    window.print();

}
// ==========================================
// DOWNLOAD ADAPTIVE ROUTINE AS EXCEL
// ==========================================

function downloadRoutineExcel() {

    let csv = "";

    csv += "ADAPTIVE SKINCARE ROUTINE\n\n";

    csv += "SKIN PROFILE\n";
    csv += "Skin Type," + (document.getElementById("skinType")?.innerText || "") + "\n";
    csv += "Skin Health Score," + (document.getElementById("skinHealthScore")?.innerText || "") + "\n";
    csv += "Main Concern," + (document.getElementById("mainConcern")?.innerText || "") + "\n";
    csv += "Sensitivity," + (document.getElementById("sensitivity")?.innerText || "") + "\n\n";

    csv += "MORNING ROUTINE\n";
    csv += "Routine Step\n";
    csv += getRoutineText("morningRoutine");
    csv += "\n\n";

    csv += "EVENING ROUTINE\n";
    csv += "Routine Step\n";
    csv += getRoutineText("eveningRoutine");
    csv += "\n\n";

    csv += "WEEKLY PLAN\n";
    csv += "Monday," + getElementText("mondayPlan") + "\n";
    csv += "Wednesday," + getElementText("wednesdayPlan") + "\n";
    csv += "Friday," + getElementText("fridayPlan") + "\n";
    csv += "Sunday," + getElementText("sundayPlan") + "\n\n";

    csv += "SEASONAL RECOMMENDATION\n";
    csv += getElementText("seasonalRecommendation") + "\n";

    const blob =
        new Blob(
            [csv],
            {
                type: "text/csv;charset=utf-8;"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "Adaptive_Skincare_Routine.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    alert("✅ Adaptive skincare routine downloaded successfully.");
}


// ==========================================
// GET ELEMENT TEXT
// ==========================================

function getElementText(elementId) {

    const element =
        document.getElementById(elementId);

    if (!element) {
        return "";
    }

    return element.innerText
        .replace(/\n/g, " ")
        .replace(/,/g, " ")
        .trim();
}


// ==========================================
// GET ROUTINE TEXT
// ==========================================

function getRoutineText(elementId) {

    const element =
        document.getElementById(elementId);

    if (!element) {
        return "";
    }

    const steps =
        element.querySelectorAll(
            ".routine-step"
        );

    let text = "";

    steps.forEach(function (step) {

        const stepText =
            step.innerText
                .replace(/\n/g, " ")
                .replace(/,/g, " ")
                .trim();

        if (stepText) {

            text +=
                stepText +
                "\n";
        }
    });

    return text;
}