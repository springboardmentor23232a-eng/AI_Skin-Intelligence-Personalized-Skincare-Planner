console.log("User dashboard JS loaded");

function getBaseUrl() {
    if (typeof window.APP_CONFIG !== "undefined" && window.APP_CONFIG.API_BASE_URL) {
        return window.APP_CONFIG.API_BASE_URL;
    }
    const isLocalHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    return isLocalHost ? "http://127.0.0.1:8000" : window.location.origin;
}

function setText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = text;
    }
}

async function loadUserDashboard() {
    const token = localStorage.getItem("token");
    console.log("Token exists:", !!token);

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    let userData = null;
    let assessments = null;
    const baseUrl = getBaseUrl();

    try {
        const userResponse = await fetch(`${baseUrl}/dashboard/user`, {
            headers: { "Authorization": "Bearer " + token }
        });
        if (userResponse.ok) {
            userData = await userResponse.json();
        }
    } catch (e) {
        console.log("User details endpoint unavailable, using default profile display.");
    }

    try {
        const assessmentResponse = await fetch(`${baseUrl}/assessment/`, {
            headers: { "Authorization": "Bearer " + token }
        });
        if (assessmentResponse.ok) {
            assessments = await assessmentResponse.json();
        }
    } catch (e) {
        console.log("Assessment endpoint unavailable, using default assessment display.");
    }

    // Populate User Name
    const userName = document.getElementById("userName");
    if (userName) {
        const name = (userData && userData.user && userData.user.name) ? userData.user.name : "User";
        userName.innerHTML = "Welcome, " + name + " 👋";
    }

    // Latest Assessment Data
    const latest = (Array.isArray(assessments) && assessments.length > 0)
        ? assessments[assessments.length - 1]
        : {
            skin_health_score: 86,
            skin_type: "Combination",
            acne_level: "Low / Mild",
            hydration: "76%",
            pigmentation: "Minimal",
            redness: "Low",
            sensitivity: "Normal",
            overall_condition: "Healthy Skin Barrier & Good Hydration",
            primary_concern: "Mild Dehydration & Sun Exposure"
        };

    // Render All Dashboard Elements
    setText("skinScore", (latest.skin_health_score ?? 86) + "%");
    setText("skinCondition", latest.overall_condition || "Healthy Skin Barrier & Good Hydration");
    setText("dashboardSkinType", latest.skin_type || "Combination");
    setText("recommendedProductsCount", "12");

    setText("acne", "Acne Detection: " + (latest.acne_level || "Low / Mild"));
    setText("hydration", "Hydration Level: " + (latest.hydration || "76%"));
    setText("spots", "Skin Health Score: " + (latest.skin_health_score ?? 86) + "%");
    setText("pigmentation", "Pigmentation: " + (latest.pigmentation || "Minimal"));
    setText("redness", "Redness: " + (latest.redness || "Low / Minimal"));
    setText("sensitivity", "Sensitivity: " + (latest.sensitivity || "Normal"));

    // Recent Assessment Section
    setText("recentSkinScore", (latest.skin_health_score ?? 86) + "%");
    setText("recentPrimaryConcern", latest.primary_concern || latest.main_concern || "Mild Dehydration");
    setText("recentSkinCondition", latest.overall_condition || "Balanced Barrier");
}

document.addEventListener("DOMContentLoaded", loadUserDashboard);
loadUserDashboard();

// Download PDF Report
function downloadPDFReport() {
    alert("Downloading PDF Skin Assessment Report...");
    const content = `
AI SKIN INTELLIGENCE - HEALTH ASSESSMENT REPORT
Date: ${new Date().toLocaleDateString()}
Skin Health Score: 86%
Skin Type: Combination
Hydration Level: 76%
Acne Level: Low / Mild
Pigmentation: Minimal
Recommendation: Continue daily hydration and broad-spectrum SPF 50 sunscreen.
`;
    const blob = new Blob([content], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Skin_Assessment_Report.pdf";
    link.click();
}

// Download Excel Report
function downloadExcelReport() {
    alert("Downloading Excel Skin Assessment Report...");
    const content = `Metric,Value\nSkin Health Score,86%\nSkin Type,Combination\nHydration,76%\nAcne Level,Low\nPigmentation,Minimal\n`;
    const blob = new Blob([content], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Skin_Assessment_Report.csv";
    link.click();
}