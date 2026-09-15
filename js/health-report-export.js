// =====================================================
// SKIN HEALTH REPORT EXPORT
// PDF + EXCEL
// =====================================================

// =====================================================
// GET ELEMENT VALUE
// =====================================================

function getReportValue(id) {

    const element = document.getElementById(id);

    if (!element) {
        return "--";
    }

    return element.innerText.trim();
}


// =====================================================
// COLLECT HEALTH REPORT DATA
// =====================================================

function collectHealthReportData() {

    return {

        overallScore: getReportValue("overallScore"),

        improvement: getReportValue("improvementScore"),

        scoreChange: getReportValue("scoreChange"),

        forecast: getReportValue("forecastScore"),

        forecastStatus: getReportValue("forecastStatus"),

        condition: getReportValue("pillarCondition"),

        lifestyle: getReportValue("pillarLifestyle"),

        routine: getReportValue("pillarConsistency"),

        sleep: getReportValue("pillarSleep"),

        hydration: getReportValue("pillarHydration"),

        breakdownCondition: getReportValue("breakdownCondition"),

        breakdownLifestyle: getReportValue("breakdownLifestyle"),

        breakdownRoutine: getReportValue("breakdownRoutine"),

        breakdownSleep: getReportValue("breakdownSleep"),

        breakdownHydration: getReportValue("breakdownHydration"),

        breakdownImprovement: getReportValue("breakdownImprovement"),

        totalAssessments: getReportValue("totalAssessments"),

        firstScore: getReportValue("firstScore"),

        latestScore: getReportValue("latestScore"),

        overallChange: getReportValue("overallChange"),

        dataCoverage: getReportValue("dataCoverage"),

        progressAnalysis: getReportValue("progressAnalysis"),

        healthInsight: getReportValue("healthInsight"),

        scoreStatus: getReportValue("scoreStatus")
    };
}


// =====================================================
// PDF EXPORT
// =====================================================

function exportHealthReportPDF() {

    try {

        const { jsPDF } = window.jspdf;

        const report = collectHealthReportData();

        const pdf = new jsPDF();

        let y = 20;


        pdf.setFontSize(20);
        pdf.setFont("helvetica", "bold");

        pdf.text(
            "Skin AI - Skin Health Report",
            20,
            y
        );

        y += 12;


        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");

        pdf.text(
            "Generated on: " +
            new Date().toLocaleString(),
            20,
            y
        );

        y += 15;


        // OVERALL SCORE

        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");

        pdf.text(
            "Overall Skin Health",
            20,
            y
        );

        y += 9;

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");

        pdf.text(
            "Health Score: " +
            report.overallScore +
            " / 100",
            20,
            y
        );

        y += 7;

        pdf.text(
            "Status: " +
            report.scoreStatus,
            20,
            y
        );

        y += 14;


        // HEALTH METRICS

        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");

        pdf.text(
            "Skin Health Metrics",
            20,
            y
        );

        y += 9;

        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");

        pdf.text(
            "Skin Condition: " + report.condition,
            20,
            y
        );

        y += 7;

        pdf.text(
            "Lifestyle: " + report.lifestyle,
            20,
            y
        );

        y += 7;

        pdf.text(
            "Routine Consistency: " + report.routine,
            20,
            y
        );

        y += 7;

        pdf.text(
            "Sleep Quality: " + report.sleep,
            20,
            y
        );

        y += 7;

        pdf.text(
            "Hydration Level: " + report.hydration,
            20,
            y
        );

        y += 14;


        // IMPROVEMENT

        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");

        pdf.text(
            "Skin Improvement",
            20,
            y
        );

        y += 9;

        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");

        pdf.text(
            "Improvement Score: " +
            report.improvement,
            20,
            y
        );

        y += 7;

        pdf.text(
            "Change: " +
            report.scoreChange,
            20,
            y
        );

        y += 14;


        // PROJECTION

        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");

        pdf.text(
            "Health Projection",
            20,
            y
        );

        y += 9;

        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");

        pdf.text(
            "Projected Score: " +
            report.forecast +
            " / 100",
            20,
            y
        );

        y += 7;

        pdf.text(
            "Projection Status: " +
            report.forecastStatus,
            20,
            y
        );

        y += 14;


        // HISTORICAL PROGRESS

        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");

        pdf.text(
            "Historical Skin Health Progress",
            20,
            y
        );

        y += 9;

        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");

        pdf.text(
            "Total Assessments: " +
            report.totalAssessments,
            20,
            y
        );

        y += 7;

        pdf.text(
            "First Score: " +
            report.firstScore,
            20,
            y
        );

        y += 7;

        pdf.text(
            "Latest Score: " +
            report.latestScore,
            20,
            y
        );

        y += 7;

        pdf.text(
            "Overall Change: " +
            report.overallChange,
            20,
            y
        );

        y += 14;


        // AI INSIGHT

        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");

        pdf.text(
            "AI Skin Health Insight",
            20,
            y
        );

        y += 9;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");

        const insightLines =
            pdf.splitTextToSize(
                report.healthInsight,
                170
            );

        pdf.text(
            insightLines,
            20,
            y
        );


        // FOOTER

        pdf.setFontSize(8);

        pdf.text(
            "Skin AI - Personalized Skin Intelligence",
            20,
            285
        );

        pdf.text(
            "AI-generated insights are for informational purposes only.",
            20,
            290
        );


        // SAVE PDF

        pdf.save(
            "Skin_AI_Health_Report.pdf"
        );

        alert(
            "Skin Health PDF report exported successfully!"
        );

    } catch (error) {

        console.error(
            "PDF export error:",
            error
        );

        alert(
            "Unable to export PDF report."
        );
    }
}


// =====================================================
// EXCEL EXPORT
// =====================================================

function exportHealthReportExcel() {

    try {

        const report =
            collectHealthReportData();


        const data = [

            ["SKIN AI - SKIN HEALTH REPORT", ""],

            ["Generated On",
             new Date().toLocaleString()],

            ["", ""],

            ["OVERALL HEALTH", ""],

            ["Overall Score",
             report.overallScore],

            ["Status",
             report.scoreStatus],

            ["", ""],

            ["SKIN HEALTH METRICS", ""],

            ["Skin Condition",
             report.condition],

            ["Lifestyle",
             report.lifestyle],

            ["Routine Consistency",
             report.routine],

            ["Sleep Quality",
             report.sleep],

            ["Hydration Level",
             report.hydration],

            ["", ""],

            ["IMPROVEMENT", ""],

            ["Improvement Score",
             report.improvement],

            ["Score Change",
             report.scoreChange],

            ["", ""],

            ["HEALTH PROJECTION", ""],

            ["Projected Score",
             report.forecast],

            ["Projection Status",
             report.forecastStatus],

            ["", ""],

            ["HISTORICAL PROGRESS", ""],

            ["Total Assessments",
             report.totalAssessments],

            ["First Score",
             report.firstScore],

            ["Latest Score",
             report.latestScore],

            ["Overall Change",
             report.overallChange],

            ["", ""],

            ["SCORE BREAKDOWN", ""],

            ["Skin Condition",
             report.breakdownCondition],

            ["Lifestyle",
             report.breakdownLifestyle],

            ["Routine Consistency",
             report.breakdownRoutine],

            ["Sleep Quality",
             report.breakdownSleep],

            ["Hydration",
             report.breakdownHydration],

            ["Skin Improvement",
             report.breakdownImprovement],

            ["", ""],

            ["DATA COVERAGE",
             report.dataCoverage],

            ["", ""],

            ["AI SKIN HEALTH INSIGHT",
             report.healthInsight]
        ];


        const worksheet =
            XLSX.utils.aoa_to_sheet(data);


        worksheet["!cols"] = [

            {
                wch: 28
            },

            {
                wch: 70
            }
        ];


        const workbook =
            XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Skin Health Report"
        );


        XLSX.writeFile(
            workbook,
            "Skin_AI_Health_Report.xlsx"
        );


        alert(
            "Skin Health Excel report exported successfully!"
        );

    } catch (error) {

        console.error(
            "Excel export error:",
            error
        );

        alert(
            "Unable to export Excel report."
        );
    }
}