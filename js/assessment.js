console.log("assessment.js loaded");

let selectedImageFile = null;
let cameraStream = null;

// ==========================================
// IMAGE UPLOAD
// ==========================================

const imageUpload = document.getElementById("imageUpload");
const imagePreview = document.getElementById("imagePreview");
const previewSection = document.getElementById("previewSection");
const analyzeBtn = document.getElementById("analyzeBtn");

if (imageUpload) {

    imageUpload.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) {
            return;
        }

        console.log("Image selected:", file.name);

        if (!file.type.startsWith("image/")) {
            alert("Please select an image.");
            return;
        }

        selectedImageFile = file;

        const reader = new FileReader();

        reader.onload = function (event) {

            imagePreview.src = event.target.result;

            previewSection.style.display = "block";

            analyzeBtn.style.display = "inline-block";

            console.log("Image preview shown");
        };

        reader.readAsDataURL(file);

    });

}

// ==========================================
// CAMERA
// ==========================================

async function openCamera() {

    const cameraContainer =
        document.getElementById("cameraContainer");

    const cameraVideo =
        document.getElementById("cameraVideo");

    try {

        cameraStream =
            await navigator.mediaDevices.getUserMedia({
                video: true
            });

        cameraVideo.srcObject = cameraStream;

        cameraContainer.style.display = "block";

        console.log("Camera opened");

    }

    catch (error) {

        console.error("Camera error:", error);

        alert("Camera permission denied.");

    }

}

// ==========================================
// CAPTURE PHOTO
// ==========================================

function capturePhoto() {

    const video =
        document.getElementById("cameraVideo");

    const canvas =
        document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context =
        canvas.getContext("2d");

    context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );

    canvas.toBlob(function (blob) {

        selectedImageFile =
            new File(
                [blob],
                "skin-photo.png",
                {
                    type: "image/png"
                }
            );

        imagePreview.src =
            canvas.toDataURL("image/png");

        previewSection.style.display = "block";

        analyzeBtn.style.display = "inline-block";

        console.log("Photo captured");

        if (cameraStream) {

            cameraStream
                .getTracks()
                .forEach(track => track.stop());

            cameraStream = null;

        }

        document.getElementById(
            "cameraContainer"
        ).style.display = "none";

    }, "image/png");

}

// ==========================================
// ANALYZE IMAGE
// ==========================================

if (analyzeBtn) {

    analyzeBtn.addEventListener(
        "click",
        async function () {

            console.log("Analyze button clicked");

            if (!selectedImageFile) {

                alert("Please upload an image first.");

                return;
            }

            const token =
                localStorage.getItem("token");

            if (!token) {

                alert("Please login again.");

                return;
            }

            analyzeBtn.disabled = true;

            analyzeBtn.innerHTML =
                "⏳ Analyzing...";

            try {

                const formData =
                    new FormData();

                formData.append(
                    "file",
                    selectedImageFile
                );

                console.log(
                    "Sending image to FastAPI..."
                );

                const response =
                    await fetch(
                        "http://127.0.0.1:8000/assessment/analyze-image/",
                        {
                            method: "POST",

                            headers: {
                                "Authorization":
                                    "Bearer " + token
                            },

                            body: formData
                        }
                    );

                console.log(
                    "FastAPI status:",
                    response.status
                );

                const data =
                    await response.json();

                console.log(
                    "FastAPI response:",
                    data
                );

                if (!response.ok) {

                    throw new Error(
                        data.detail || "Analysis failed"
                    );

                }

                // ==========================================
                // GET AI ANALYSIS
                // ==========================================

                const analysis =
                    data.analysis || {};

                console.log(
                    "AI Analysis:",
                    JSON.stringify(analysis, null, 2)
                );

                // ==========================================
                // SKIN HEALTH SCORE
                // ==========================================

                const skinScore =
                    document.getElementById("skinScore");

                if (skinScore) {

                    const score =
                        analysis.skin_health_score ??
                        analysis.health_score ??
                        analysis.score;

                    if (score !== undefined && score !== null) {

                        skinScore.innerHTML =
                            score + "%";

                    } else {

                        skinScore.innerHTML = "--";

                    }

                }

                // ==========================================
                // SKIN TYPE
                // ==========================================

                const skinType =
                    document.getElementById("skinType");

                if (skinType) {

                    skinType.innerHTML =
                        analysis.skin_type ??
                        "--";

                }

                // ==========================================
                // MAIN CONCERN
                // ==========================================

                const mainConcern =
                    document.getElementById("mainConcern");

                if (mainConcern) {

                    mainConcern.innerHTML =
                        analysis.main_concern ??
                        analysis.concern ??
                        analysis.primary_concern ??
                        "--";

                }

                // ==========================================
                // HYDRATION
                // ==========================================

                const hydration =
                    document.getElementById("hydration");

                if (hydration) {

                    hydration.innerHTML =
                        analysis.hydration ??
                        "--";

                }

                // ==========================================
                // ACNE LEVEL
                // ==========================================

                const acneLevel =
                    document.getElementById("acneLevel");

                if (acneLevel) {

                    acneLevel.innerHTML =
                        analysis.acne_level ??
                        analysis.acne ??
                        "--";

                }

                // ==========================================
                // SKIN CONDITION
                // ==========================================

                const skinCondition =
                    document.getElementById("skinCondition");

                if (skinCondition) {

                    skinCondition.innerHTML =
                        analysis.skin_condition ??
                        analysis.overall_condition ??
                        "--";

                }

                // ==========================================
                // DARK SPOTS
                // ==========================================

                const darkSpots =
                    document.getElementById("darkSpots");

                if (darkSpots) {

                    darkSpots.innerHTML =
                        analysis.dark_spots ??
                        analysis.dark_spot ??
                        analysis.hyperpigmentation ??
                        analysis.pigmentation ??
                        "--";

                }

                // ==========================================
                // REDNESS
                // ==========================================

                const redness =
                    document.getElementById("redness");

                if (redness) {

                    redness.innerHTML =
                        analysis.redness ??
                        "--";

                }

                // ==========================================
                // TEXTURE
                // ==========================================

                const texture =
                    document.getElementById("texture");

                if (texture) {

                    texture.innerHTML =
                        analysis.texture ??
                        "--";

                }

                // ==========================================
                // SENSITIVITY
                // ==========================================

                const sensitivity =
                    document.getElementById("sensitivity");

                if (sensitivity) {

                    sensitivity.innerHTML =
                        analysis.sensitivity ??
                        "--";

                }

                // ==========================================
                // RECOMMENDATION
                // ==========================================

                const recommendationText =
                    document.getElementById(
                        "recommendationText"
                    );

                if (recommendationText) {

                    recommendationText.innerHTML =
                        analysis.recommendation ??
                        analysis.recommendations ??
                        "Maintain a consistent skincare routine and monitor your skin regularly.";

                }

                // ==========================================
                // ANALYSIS STATUS
                // ==========================================

                const analysisStatus =
                    document.getElementById(
                        "analysisStatus"
                    );

                if (analysisStatus) {

                    analysisStatus.innerHTML =
                        "Analysis Completed";

                }

                // ==========================================
                // SUCCESS
                // ==========================================

                console.log(
                    "Analysis displayed successfully"
                );

                alert(
                    "✅ Skin analysis completed successfully!"
                );

            }

            catch (error) {

                console.error(
                    "Analysis error:",
                    error
                );

                alert(
                    "❌ " + error.message
                );

            }

            finally {

                analyzeBtn.disabled = false;

                analyzeBtn.innerHTML =
                    "🔍 Analyze My Skin";

            }

        }
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

console.log("assessment.js ready");