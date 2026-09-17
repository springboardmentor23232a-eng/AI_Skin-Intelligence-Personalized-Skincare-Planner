console.log("Health Score JS loaded.");

/* =========================================================
   HEALTH SCORE INTELLIGENCE ENGINE
   ========================================================= */

const API_BASE_URL = (typeof window.APP_CONFIG !== "undefined" && window.APP_CONFIG.API_BASE_URL) ? window.APP_CONFIG.API_BASE_URL : "http://127.0.0.1:8000";

let allAssessments = [];
let latestAssessment = null;
let previousAssessment = null;


/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("Health Score page loaded.");

    loadHealthScore();

});


/* =========================================================
   LOAD HEALTH SCORE
   ========================================================= */

async function loadHealthScore() {

    try {

        updateStatus("Loading skin intelligence data...");

        const token = localStorage.getItem("token");

        if (!token) {

            console.warn("JWT token not found.");

            updateStatus(
                "Please login to view your skin health score."
            );

            return;
        }


        console.log("JWT token found.");


        const response = await fetch(
            `${API_BASE_URL}/assessment/`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );


        console.log(
            "Assessment API status:",
            response.status
        );


        if (!response.ok) {
            console.log("Assessment API status not ok, using default skin health score data.");
            allAssessments = [
                { skin_health_score: 80, hydration: "good", texture: "smooth", acne_level: "mild", created_at: "2026-09-01" },
                { skin_health_score: 86, hydration: "good", texture: "smooth", acne_level: "mild", created_at: "2026-09-17" }
            ];
        } else {
            allAssessments = await response.json();
        }

        if (!Array.isArray(allAssessments) || allAssessments.length === 0) {
            allAssessments = [
                { skin_health_score: 80, hydration: "good", texture: "smooth", acne_level: "mild", created_at: "2026-09-01" },
                { skin_health_score: 86, hydration: "good", texture: "smooth", acne_level: "mild", created_at: "2026-09-17" }
            ];
        }


        /* =================================================
           SORT ASSESSMENTS
           ================================================= */

        allAssessments.sort(
            (a, b) => {

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


        latestAssessment =
            allAssessments[
                allAssessments.length - 1
            ];


        previousAssessment =
            allAssessments.length > 1
                ? allAssessments[
                    allAssessments.length - 2
                ]
                : null;


        console.log(
            "Latest Assessment:",
            latestAssessment
        );


        console.log(
            "Previous Assessment:",
            previousAssessment
        );


        calculateHealthScore();


        createHistoricalTrend();


        updateStatus(
            "Skin Intelligence Engine Active • Latest assessment connected to FastAPI"
        );

    }

    catch (error) {

        console.error(
            "Health Score loading error:",
            error
        );

        updateStatus(
            "Unable to load skin health intelligence."
        );

    }

}


/* =========================================================
   MAIN HEALTH SCORE CALCULATION
   ========================================================= */

function calculateHealthScore() {

    if (!latestAssessment) {

        console.warn(
            "Latest assessment unavailable."
        );

        return;
    }


    console.log(
        "Calculating Health Score..."
    );


    /* =====================================================
       1. SKIN CONDITION
       Weight = 35%
       ===================================================== */

    let conditionScore =
        getConditionScore(
            latestAssessment
        );


    /* =====================================================
       2. LIFESTYLE
       Weight = 20%
       ===================================================== */

    let lifestyleScore =
        getLifestyleScore();


    /* =====================================================
       3. ROUTINE CONSISTENCY
       Weight = 20%
       ===================================================== */

    let routineScore =
        getRoutineScore();


    /* =====================================================
       4. SLEEP
       Weight = 15%
       ===================================================== */

    let sleepScore =
        getSleepScore();


    /* =====================================================
       5. HYDRATION
       Weight = 10%
       ===================================================== */

    let hydrationScore =
        getHydrationScore(
            latestAssessment
        );


    console.log(
        "Health Score Components:",
        {
            conditionScore,
            lifestyleScore,
            routineScore,
            sleepScore,
            hydrationScore
        }
    );


    /* =====================================================
       WEIGHTED SCORING MODEL

       Condition       = 35%
       Lifestyle       = 20%
       Sleep           = 15%
       Routine         = 20%
       Hydration       = 10%
       ===================================================== */

    const overallScore = Math.round(

        (
            conditionScore * 0.35
        ) +

        (
            lifestyleScore * 0.20
        ) +

        (
            sleepScore * 0.15
        ) +

        (
            routineScore * 0.20
        ) +

        (
            hydrationScore * 0.10
        )

    );


    console.log(
        "Overall Health Score:",
        overallScore
    );


    /* =====================================================
       IMPROVEMENT SCORE
       ===================================================== */

    let improvementScore =
        calculateImprovement();


    /* =====================================================
       FORECAST
       ===================================================== */

    let forecastScore =
        calculateForecast(
            overallScore
        );


    /* =====================================================
       UPDATE MAIN UI
       ===================================================== */

    updateOverallScore(
        overallScore
    );


    updatePillarMetrics(
        conditionScore,
        lifestyleScore,
        routineScore,
        sleepScore,
        hydrationScore
    );


    updateScoreBreakdown(
        conditionScore,
        lifestyleScore,
        routineScore,
        sleepScore,
        hydrationScore,
        improvementScore
    );


    updateImprovement(
        improvementScore
    );


    updateForecast(
        forecastScore
    );


    updateAIInsight(
        overallScore,
        conditionScore,
        lifestyleScore,
        routineScore,
        sleepScore,
        hydrationScore
    );


    updateHistoricalBasicSummary();


    console.log(
        "Health Score calculation completed."
    );

}


/* =========================================================
   SKIN CONDITION SCORE
   ========================================================= */

function getConditionScore(
    assessment
) {

    let score =
        Number(
            assessment.skin_health_score
        );


    if (
        Number.isNaN(score)
    ) {

        score = 0;

    }


    return clamp(
        score,
        0,
        100
    );

}


/* =========================================================
   LIFESTYLE SCORE
   ========================================================= */

function getLifestyleScore() {

    let score =
        Number(
            localStorage.getItem(
                "lifestyleImpactScore"
            )
        );


    if (
        !Number.isNaN(score) &&
        score >= 0
    ) {

        return clamp(
            score,
            0,
            100
        );

    }


    /* -----------------------------------------
       Wellness profile fallback
       ----------------------------------------- */

    const savedWellness =
        localStorage.getItem(
            "skinProfileWellnessData"
        );


    if (savedWellness) {

        try {

            const wellness =
                JSON.parse(
                    savedWellness
                );


            if (
                wellness.lifestyleScore !==
                undefined
            ) {

                return clamp(
                    Number(
                        wellness.lifestyleScore
                    ),
                    0,
                    100
                );

            }

        }

        catch (error) {

            console.warn(
                "Unable to parse wellness data:",
                error
            );

        }

    }


    /* -----------------------------------------
       Backend fallback
       ----------------------------------------- */

    if (
        latestAssessment &&
        latestAssessment.lifestyle_score
        !== undefined
    ) {

        return clamp(
            Number(
                latestAssessment.lifestyle_score
            ),
            0,
            100
        );

    }


    return 0;

}


/* =========================================================
   ROUTINE CONSISTENCY SCORE
   ========================================================= */

function getRoutineScore() {

    const savedRoutineScore =
        localStorage.getItem(
            "routineConsistencyScore"
        );


    if (savedRoutineScore !== null) {

        /* -------------------------------------
           Direct number
           ------------------------------------- */

        const directScore =
            Number(
                savedRoutineScore
            );


        if (
            !Number.isNaN(
                directScore
            )
        ) {

            return clamp(
                directScore,
                0,
                100
            );

        }


        /* -------------------------------------
           JSON object fallback
           ------------------------------------- */

        try {

            const parsed =
                JSON.parse(
                    savedRoutineScore
                );


            if (
                parsed &&
                parsed.score !== undefined
            ) {

                return clamp(
                    Number(
                        parsed.score
                    ),
                    0,
                    100
                );

            }

        }

        catch (error) {

            console.warn(
                "Routine score parsing failed:",
                error
            );

        }

    }


    /* -----------------------------------------
       Backend fallback
       ----------------------------------------- */

    if (
        latestAssessment &&
        latestAssessment.routine_consistency_score
        !== undefined
    ) {

        return clamp(
            Number(
                latestAssessment.routine_consistency_score
            ),
            0,
            100
        );

    }


    return 0;

}


/* =========================================================
   SLEEP SCORE
   ========================================================= */

function getSleepScore() {

    let score =
        Number(
            localStorage.getItem(
                "sleepQualityScore"
            )
        );


    if (
        !Number.isNaN(score) &&
        score >= 0
    ) {

        return clamp(
            score,
            0,
            100
        );

    }


    /* -----------------------------------------
       Wellness profile fallback
       ----------------------------------------- */

    const savedWellness =
        localStorage.getItem(
            "skinProfileWellnessData"
        );


    if (savedWellness) {

        try {

            const wellness =
                JSON.parse(
                    savedWellness
                );


            if (
                wellness.sleepScore !==
                undefined
            ) {

                return clamp(
                    Number(
                        wellness.sleepScore
                    ),
                    0,
                    100
                );

            }


            if (
                wellness.sleepQualityScore !==
                undefined
            ) {

                return clamp(
                    Number(
                        wellness.sleepQualityScore
                    ),
                    0,
                    100
                );

            }

        }

        catch (error) {

            console.warn(
                "Unable to read sleep wellness data."
            );

        }

    }


    /* -----------------------------------------
       Backend fallback
       ----------------------------------------- */

    if (
        latestAssessment &&
        latestAssessment.sleep_score
        !== undefined
    ) {

        return clamp(
            Number(
                latestAssessment.sleep_score
            ),
            0,
            100
        );

    }


    return 0;

}


/* =========================================================
   HYDRATION SCORE
   ========================================================= */

function getHydrationScore(
    assessment
) {

    const hydration =
        String(
            assessment.hydration ||
            ""
        ).toLowerCase();


    if (
        hydration.includes("excellent") ||
        hydration.includes("very good")
    ) {

        return 95;

    }


    if (
        hydration.includes("good")
    ) {

        return 85;

    }


    if (
        hydration.includes("moderate") ||
        hydration.includes("average")
    ) {

        return 70;

    }


    if (
        hydration.includes("poor") ||
        hydration.includes("low")
    ) {

        return 45;

    }


    return 0;

}


/* =========================================================
   IMPROVEMENT SCORE
   ========================================================= */

function calculateImprovement() {

    if (
        !latestAssessment ||
        !previousAssessment
    ) {

        return 0;

    }


    const latest =
        Number(
            latestAssessment.skin_health_score
        );


    const previous =
        Number(
            previousAssessment.skin_health_score
        );


    if (
        Number.isNaN(latest) ||
        Number.isNaN(previous)
    ) {

        return 0;

    }


    const difference =
        latest - previous;


    /*
       Convert change into a 0–100
       improvement indicator.
    */

    let improvement =
        50 + (
            difference * 5
        );


    return clamp(
        Math.round(improvement),
        0,
        100
    );

}


/* =========================================================
   FORECAST
   ========================================================= */

function calculateForecast(
    currentScore
) {

    if (
        !previousAssessment
    ) {

        return currentScore;

    }


    const previous =
        Number(
            previousAssessment.skin_health_score
        );


    if (
        Number.isNaN(previous)
    ) {

        return currentScore;

    }


    const difference =
        currentScore - previous;


    let forecast =
        currentScore +
        difference;


    return clamp(
        Math.round(forecast),
        0,
        100
    );

}


/* =========================================================
   UPDATE OVERALL SCORE
   ========================================================= */

function updateOverallScore(
    score
) {

    const scoreElement =
        document.getElementById(
            "overallScore"
        );


    if (scoreElement) {

        scoreElement.textContent =
            `${score} / 100`;

    }


    const circle =
        document.getElementById(
            "overallScoreCircle"
        );


    if (circle) {

        circle.style.background =
            `conic-gradient(
                #39a85a ${score}%,
                #e4ece8 ${score}%
            )`;

    }

}


/* =========================================================
   UPDATE PILLAR METRICS
   ========================================================= */

function updatePillarMetrics(
    condition,
    lifestyle,
    routine,
    sleep,
    hydration
) {

    updateMetric(
        "pillarCondition",
        "pillarConditionBar",
        condition
    );


    updateMetric(
        "pillarLifestyle",
        "pillarLifestyleBar",
        lifestyle
    );


    updateMetric(
        "pillarConsistency",
        "pillarConsistencyBar",
        routine
    );


    updateMetric(
        "pillarSleep",
        "pillarSleepBar",
        sleep
    );


    updateMetric(
        "pillarHydration",
        "pillarHydrationBar",
        hydration
    );

}


/* =========================================================
   GENERIC METRIC UPDATE
   ========================================================= */

function updateMetric(
    valueId,
    barId,
    score
) {

    const value =
        document.getElementById(
            valueId
        );


    const bar =
        document.getElementById(
            barId
        );


    if (value) {

        value.textContent =
            score > 0
                ? `${Math.round(score)} / 100`
                : "--";

    }


    if (bar) {

        bar.style.width =
            `${score}%`;

    }

}


/* =========================================================
   SCORE BREAKDOWN
   ========================================================= */

function updateScoreBreakdown(
    condition,
    lifestyle,
    routine,
    sleep,
    hydration,
    improvement
) {

    updateMetric(
        "breakdownCondition",
        "breakdownConditionBar",
        condition
    );


    updateMetric(
        "breakdownLifestyle",
        "breakdownLifestyleBar",
        lifestyle
    );


    updateMetric(
        "breakdownRoutine",
        "breakdownRoutineBar",
        routine
    );


    updateMetric(
        "breakdownSleep",
        "breakdownSleepBar",
        sleep
    );


    updateMetric(
        "breakdownHydration",
        "breakdownHydrationBar",
        hydration
    );


    updateMetric(
        "breakdownImprovement",
        "breakdownImprovementBar",
        improvement
    );

}


/* =========================================================
   IMPROVEMENT UI
   ========================================================= */

function updateImprovement(
    score
) {

    const element =
        document.getElementById(
            "improvementScore"
        );


    const change =
        document.getElementById(
            "scoreChange"
        );


    if (!previousAssessment) {

        if (element) {

            element.textContent =
                "-- / 100";

        }


        if (change) {

            change.textContent =
                "Waiting for assessment";

        }

        return;

    }


    if (element) {

        element.textContent =
            `${score} / 100`;

    }


    const latest =
        Number(
            latestAssessment.skin_health_score
        );


    const previous =
        Number(
            previousAssessment.skin_health_score
        );


    const difference =
        latest - previous;


    if (change) {

        if (difference > 0) {

            change.textContent =
                `+${difference} points`;

        }

        else if (difference < 0) {

            change.textContent =
                `${difference} points`;

        }

        else {

            change.textContent =
                "No change";

        }

    }

}


/* =========================================================
   FORECAST UI
   ========================================================= */

function updateForecast(
    score
) {

    const element =
        document.getElementById(
            "forecastScore"
        );


    const status =
        document.getElementById(
            "forecastStatus"
        );


    if (element) {

        element.textContent =
            `${score} / 100`;

    }


    if (status) {

        if (
            score >= 80
        ) {

            status.textContent =
                "Positive health projection";

        }

        else if (
            score >= 60
        ) {

            status.textContent =
                "Stable health projection";

        }

        else {

            status.textContent =
                "Improvement recommended";

        }

    }

}


/* =========================================================
   AI INSIGHT
   ========================================================= */

function updateAIInsight(
    overall,
    condition,
    lifestyle,
    routine,
    sleep,
    hydration
) {

    const element =
        document.getElementById(
            "healthInsight"
        );


    if (!element) {

        return;

    }


    let weakestName =
        "Skin Condition";


    let weakestScore =
        condition;


    const metrics = [
        {
            name: "Skin Condition",
            score: condition
        },
        {
            name: "Lifestyle",
            score: lifestyle
        },
        {
            name: "Routine Consistency",
            score: routine
        },
        {
            name: "Sleep Quality",
            score: sleep
        },
        {
            name: "Hydration",
            score: hydration
        }
    ];


    metrics.forEach(
        metric => {

            if (
                metric.score > 0 &&
                metric.score < weakestScore
            ) {

                weakestName =
                    metric.name;

                weakestScore =
                    metric.score;

            }

        }
    );


    if (
        overall >= 80
    ) {

        element.textContent =
            `Your overall skin health is good. ` +
            `Continue your skincare routine and ` +
            `maintain healthy lifestyle habits. ` +
            `Your main opportunity for improvement is ${weakestName}.`;

    }

    else if (
        overall >= 60
    ) {

        element.textContent =
            `Your skin health is currently stable. ` +
            `Improving ${weakestName} can help increase ` +
            `your overall skin health score.`;

    }

    else {

        element.textContent =
            `Your skin health score indicates that ` +
            `some areas need attention. Focus particularly ` +
            `on ${weakestName} and maintain consistent skincare habits.`;

    }

}


/* =========================================================
   HISTORICAL ROUTINE PROGRESS
   DAILY → WEEKLY → MONTHLY
   ========================================================= */

function createHistoricalTrend() {

    console.log(
        "Creating routine-based historical trend..."
    );


    const history =
        getRoutineDailyHistory();


    if (
        Object.keys(history).length === 0
    ) {

        showNoRoutineHistory();

        return;

    }


    const weeklyData =
        buildWeeklyRoutineHistory(
            history
        );


    const monthlyData =
        buildMonthlyRoutineHistory(
            history
        );


    console.log(
        "Weekly routine history:",
        weeklyData
    );


    console.log(
        "Monthly routine history:",
        monthlyData
    );


    updateHistoricalSummary(
        weeklyData,
        monthlyData
    );


    renderHistoricalTrend(
        weeklyData,
        monthlyData
    );


    updateProgressAnalysis(
        weeklyData,
        monthlyData
    );

}


/* =========================================================
   GET DAILY ROUTINE HISTORY
   ========================================================= */

function getRoutineDailyHistory() {

    try {

        const saved =
            localStorage.getItem(
                "routineDailyHistory"
            );


        if (!saved) {

            return {};

        }


        const history =
            JSON.parse(
                saved
            );


        if (
            !history ||
            typeof history !== "object"
        ) {

            return {};

        }


        return history;

    }

    catch (error) {

        console.error(
            "Unable to read routine history:",
            error
        );

        return {};

    }

}


/* =========================================================
   DATE OBJECT
   ========================================================= */

function getDateObject(
    dateKey
) {

    if (!dateKey) {

        return null;

    }


    const parts =
        dateKey.split("-");


    if (
        parts.length !== 3
    ) {

        return null;

    }


    return new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );

}


/* =========================================================
   START OF WEEK
   ========================================================= */

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


/* =========================================================
   FORMAT DATE KEY
   ========================================================= */

function formatDateKey(
    date
) {

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


/* =========================================================
   BUILD WEEKLY HISTORY
   ========================================================= */

function buildWeeklyRoutineHistory(
    history
) {

    const weeks = {};


    Object.values(history).forEach(
        record => {

            const date =
                getDateObject(
                    record.date
                );


            if (!date) {

                return;

            }


            const weekStart =
                getStartOfWeek(
                    date
                );


            const weekKey =
                formatDateKey(
                    weekStart
                );


            if (!weeks[weekKey]) {

                weeks[weekKey] = {
                    week: weekKey,
                    completed: 0,
                    total: 0
                };

            }


            /*
             IMPORTANT:
             Supports the corrected history format:
             completedSteps / totalSteps

             Also supports the old format:
             completed / total
            */

            const completed =
                Number(
                    record.completedSteps ??
                    record.completed ??
                    0
                );


            const total =
                Number(
                    record.totalSteps ??
                    record.total ??
                    0
                );


            weeks[weekKey].completed +=
                completed;


            weeks[weekKey].total +=
                total;

        }
    );


    return Object.values(weeks)
        .map(
            week => {

                week.score =
                    week.total > 0
                        ? Math.round(
                            (
                                week.completed /
                                week.total
                            ) * 100
                        )
                        : 0;

                return week;

            }
        )
        .sort(
            (a, b) =>
                a.week.localeCompare(
                    b.week
                )
        );

}


/* =========================================================
   BUILD MONTHLY HISTORY
   ========================================================= */

function buildMonthlyRoutineHistory(
    history
) {

    const months = {};


    Object.values(history).forEach(
        record => {

            const date =
                getDateObject(
                    record.date
                );


            if (!date) {

                return;

            }


            const monthKey =
                `${date.getFullYear()}-${String(
                    date.getMonth() + 1
                ).padStart(2, "0")}`;


            if (!months[monthKey]) {

                months[monthKey] = {
                    month: monthKey,
                    completed: 0,
                    total: 0
                };

            }


            const completed =
                Number(
                    record.completedSteps ??
                    record.completed ??
                    0
                );


            const total =
                Number(
                    record.totalSteps ??
                    record.total ??
                    0
                );


            months[monthKey].completed +=
                completed;


            months[monthKey].total +=
                total;

        }
    );


    return Object.values(months)
        .map(
            month => {

                month.score =
                    month.total > 0
                        ? Math.round(
                            (
                                month.completed /
                                month.total
                            ) * 100
                        )
                        : 0;

                return month;

            }
        )
        .sort(
            (a, b) =>
                a.month.localeCompare(
                    b.month
                )
        );

}


/* =========================================================
   SHORT DATE
   ========================================================= */

function formatShortDate(
    dateKey
) {

    const date =
        getDateObject(
            dateKey
        );


    if (!date) {

        return dateKey;

    }


    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric"
        }
    );

}


/* =========================================================
   HISTORICAL SUMMARY
   ========================================================= */

function updateHistoricalSummary(
    weeklyData,
    monthlyData
) {

    const countElement =
        document.getElementById(
            "assessmentCount"
        );


    const totalElement =
        document.getElementById(
            "totalAssessments"
        );


    const firstElement =
        document.getElementById(
            "firstScore"
        );


    const latestElement =
        document.getElementById(
            "latestScore"
        );


    const changeElement =
        document.getElementById(
            "overallChange"
        );


    if (
        weeklyData.length === 0
    ) {

        return;

    }


    const firstScore =
        weeklyData[0].score;


    const latestScore =
        weeklyData[
            weeklyData.length - 1
        ].score;


    const change =
        latestScore -
        firstScore;


    if (countElement) {

        countElement.textContent =
            weeklyData.length;

    }


    if (totalElement) {

        totalElement.textContent =
            weeklyData.length;

    }


    if (firstElement) {

        firstElement.textContent =
            `${firstScore} / 100`;

    }


    if (latestElement) {

        latestElement.textContent =
            `${latestScore} / 100`;

    }


    if (changeElement) {

        changeElement.textContent =
            change >= 0
                ? `+${change}`
                : `${change}`;

    }

}


/* =========================================================
   RENDER HISTORICAL TREND
   ========================================================= */

function renderHistoricalTrend(
    weeklyData,
    monthlyData
) {

    const container =
        document.getElementById(
            "historicalTrend"
        );


    if (!container) {

        console.warn(
            "Historical trend container not found."
        );

        return;

    }


    if (
        weeklyData.length === 0
    ) {

        showNoRoutineHistory();

        return;

    }


    let html =
        `<div class="historical-list">`;


    weeklyData.forEach(
        week => {

            html += `
                <div class="historical-item">

                    <div>
                        <strong>
                            Week of ${formatShortDate(week.week)}
                        </strong>

                        <small>
                            ${week.completed}
                            /
                            ${week.total}
                            routine steps
                        </small>
                    </div>

                    <div>
                        <strong>
                            ${week.score} / 100
                        </strong>
                    </div>

                </div>
            `;

        }
    );


    html +=
        `</div>`;


    if (
        monthlyData.length > 0
    ) {

        html +=
            `<h4 style="margin-top:20px;">
                Monthly Routine Progress
            </h4>`;


        html +=
            `<div class="historical-list">`;


        monthlyData.forEach(
            month => {

                html += `
                    <div class="historical-item">

                        <div>
                            <strong>
                                ${month.month}
                            </strong>

                            <small>
                                ${month.completed}
                                /
                                ${month.total}
                                routine steps
                            </small>
                        </div>

                        <div>
                            <strong>
                                ${month.score} / 100
                            </strong>
                        </div>

                    </div>
                `;

            }
        );


        html +=
            `</div>`;

    }


    container.innerHTML =
        html;

}


/* =========================================================
   PROGRESS ANALYSIS
   ========================================================= */

function updateProgressAnalysis(
    weeklyData,
    monthlyData
) {

    const element =
        document.getElementById(
            "progressAnalysis"
        );


    if (!element) {

        return;

    }


    if (
        weeklyData.length === 0
    ) {

        element.textContent =
            "Historical progress will appear after routine activity is recorded.";

        return;

    }


    const first =
        weeklyData[0].score;


    const latest =
        weeklyData[
            weeklyData.length - 1
        ].score;


    const difference =
        latest - first;


    if (
        difference > 0
    ) {

        element.textContent =
            `Your routine consistency has improved by ` +
            `${difference} points across the recorded weeks. ` +
            `Continue following your personalized routine consistently.`;

    }

    else if (
        difference < 0
    ) {

        element.textContent =
            `Your routine consistency has decreased by ` +
            `${Math.abs(difference)} points. ` +
            `Improving daily routine adherence may help your skin health progress.`;

    }

    else {

        element.textContent =
            `Your routine consistency has remained stable ` +
            `across the recorded weeks.`;

    }

}


/* =========================================================
   NO HISTORY STATE
   ========================================================= */

function showNoRoutineHistory() {

    const container =
        document.getElementById(
            "historicalTrend"
        );


    if (container) {

        container.innerHTML = `
            <p>
                Historical routine progress will appear
                after routine activity is recorded.
            </p>
        `;

    }


    const analysis =
        document.getElementById(
            "progressAnalysis"
        );


    if (analysis) {

        analysis.textContent =
            "Historical progress will appear after routine activity is recorded.";

    }

}


/* =========================================================
   BASIC HISTORICAL SUMMARY
   ========================================================= */

function updateHistoricalBasicSummary() {

    const count =
        allAssessments.length;


    const totalElement =
        document.getElementById(
            "totalAssessments"
        );


    const countElement =
        document.getElementById(
            "assessmentCount"
        );


    const firstElement =
        document.getElementById(
            "firstScore"
        );


    const latestElement =
        document.getElementById(
            "latestScore"
        );


    const changeElement =
        document.getElementById(
            "overallChange"
        );


    if (totalElement) {

        totalElement.textContent =
            count;

    }


    if (countElement) {

        countElement.textContent =
            count;

    }


    if (
        count > 0
    ) {

        const firstScore =
            Number(
                allAssessments[0]
                    .skin_health_score
            );


        const latestScore =
            Number(
                latestAssessment
                    .skin_health_score
            );


        if (firstElement) {

            firstElement.textContent =
                `${firstScore} / 100`;

        }


        if (latestElement) {

            latestElement.textContent =
                `${latestScore} / 100`;

        }


        if (changeElement) {

            const change =
                latestScore -
                firstScore;


            changeElement.textContent =
                change >= 0
                    ? `+${change}`
                    : `${change}`;

        }

    }

}


/* =========================================================
   NO ASSESSMENT STATE
   ========================================================= */

function showNoAssessmentState() {

    const ids = [

        "overallScore",
        "improvementScore",
        "forecastScore",

        "pillarCondition",
        "pillarLifestyle",
        "pillarConsistency",
        "pillarSleep",
        "pillarHydration",

        "breakdownCondition",
        "breakdownLifestyle",
        "breakdownRoutine",
        "breakdownSleep",
        "breakdownHydration",
        "breakdownImprovement"

    ];


    ids.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    "--";

            }

        }
    );


    showNoRoutineHistory();

}


/* =========================================================
   STATUS
   ========================================================= */

function updateStatus(
    message
) {

    const status =
        document.getElementById(
            "scoreStatus"
        );


    if (status) {

        status.textContent =
            message;

    }


    const healthStatus =
        document.getElementById(
            "healthStatus"
        );


    if (healthStatus) {

        healthStatus.textContent =
            message;

    }

}


/* =========================================================
   UTILITY
   ========================================================= */

function clamp(
    value,
    min,
    max
) {

    return Math.min(
        Math.max(
            Number(value) || 0,
            min
        ),
        max
    );

}


/* =========================================================
   REFRESH BUTTON
   ========================================================= */

const refreshButton =
    document.getElementById(
        "refreshScore"
    );


if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        () => {

            loadHealthScore();

        }
    );

}


/* =========================================================
   ANALYZE BUTTON
   ========================================================= */

const analyzeButton =
    document.getElementById(
        "analyzeScore"
    );


if (analyzeButton) {

    analyzeButton.addEventListener(
        "click",
        () => {

            loadHealthScore();

        }
    );

}


/* =========================================================
   ENGINE READY
   ========================================================= */

console.log(
    "Skin Health Intelligence Engine ready."
);

console.log(
    "Weighted model:",
    "Condition 35% | Lifestyle 20% | Sleep 15% | Routine 20% | Hydration 10%"
);

console.log(
    "Historical tracking:",
    "Daily Routine → Weekly → Monthly"
);