/* =========================================================
   SKIN AI - INGREDIENT INTELLIGENCE
   Database-backed Ingredient Intelligence Module
   JWT Authentication
   ========================================================= */

console.log("Ingredient Intelligence Module initialized.");


/* =========================================================
   API CONFIGURATION
========================================================= */

const API_BASE_URL = "http://127.0.0.1:8000";


/* =========================================================
   AUTHENTICATION
========================================================= */

function getAuthToken() {

    let token =
        localStorage.getItem("token") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken");

    if (token) {

        try {

            const parsed = JSON.parse(token);

            if (typeof parsed === "string") {

                token = parsed;

            }

            else if (parsed && typeof parsed === "object") {

                token =
                    parsed.access_token ||
                    parsed.accessToken ||
                    parsed.token ||
                    token;

            }

        }

        catch (error) {
            // Normal JWT string
        }

    }

    if (!token) {

        console.warn(
            "No JWT token found in localStorage."
        );

        return null;

    }

    return token;

}


/* =========================================================
   JWT AUTHORIZATION HEADERS
========================================================= */

function getAuthHeaders() {

    const token =
        getAuthToken();

    const headers = {

        "Content-Type":
            "application/json",

        "Accept":
            "application/json"

    };

    if (token) {

        headers["Authorization"] =
            `Bearer ${token}`;

    }

    return headers;

}


/* =========================================================
   CHECK LOGIN
========================================================= */

function isUserAuthenticated() {

    const token =
        getAuthToken();

    return !!token;

}


/* =========================================================
   HANDLE 401
========================================================= */

function handleUnauthorized() {

    console.warn(
        "JWT authentication failed or token expired."
    );

    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("accessToken");

    alert(
        "Your login session has expired. Please login again."
    );

    window.location.href =
        "login.html";

}


/* =========================================================
   GLOBAL INGREDIENT DATA
========================================================= */

let ingredientList = [];

let selectedIngredient1 = null;

let selectedIngredient2 = null;


/* =========================================================
   FALLBACK INGREDIENT LIST
========================================================= */

const fallbackIngredients = [

    {
        id: 1,
        name: "Retinoids",
        description:
            "Supports skin renewal, acne care and anti-aging routines."
    },

    {
        id: 2,
        name: "Niacinamide",
        description:
            "Supports skin barrier function and oil control."
    },

    {
        id: 3,
        name: "Vitamin C",
        description:
            "Antioxidant ingredient that supports brightening and uneven skin tone."
    },

    {
        id: 4,
        name: "Hyaluronic Acid",
        description:
            "Supports hydration and moisture retention."
    },

    {
        id: 5,
        name: "Salicylic Acid",
        description:
            "Supports acne, pore care and exfoliation."
    },

    {
        id: 6,
        name: "Ceramides",
        description:
            "Supports the skin barrier and moisture retention."
    },

    {
        id: 7,
        name: "Peptides",
        description:
            "Supports skin conditioning and anti-aging routines."
    },

    {
        id: 8,
        name: "AHAs/BHAs",
        description:
            "Supports exfoliation and uneven skin texture."
    }

];


/* =========================================================
   INITIALIZE MODULE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeIngredientInteraction();

    }
);


/* =========================================================
   INITIALIZE INGREDIENT INTERACTION
========================================================= */

async function initializeIngredientInteraction() {

    console.log(
        "Initializing Ingredient Interaction Analysis..."
    );

    if (!isUserAuthenticated()) {

        console.warn(
            "Ingredient Intelligence: JWT token not found."
        );

        ingredientList =
            fallbackIngredients;

        populateInteractionDropdowns();

        console.warn(
            "Using fallback ingredients because no JWT token is available."
        );

        return;

    }

    await loadIngredientsFromAPI();

    populateInteractionDropdowns();

    console.log(
        "Ingredient Interaction Analysis initialized."
    );

}


/* =========================================================
   LOAD INGREDIENTS FROM FASTAPI
========================================================= */

async function loadIngredientsFromAPI() {

    console.log(
        "Loading ingredients from:",
        `${API_BASE_URL}/ingredients/`
    );

    const token =
        getAuthToken();

    if (!token) {

        console.error(
            "Cannot load ingredients because JWT token is missing."
        );

        ingredientList =
            fallbackIngredients;

        return;

    }

    console.log(
        "JWT token found. Sending Authorization header."
    );

    try {

        const response =
            await fetch(

                `${API_BASE_URL}/ingredients/`,

                {

                    method: "GET",

                    headers:
                        getAuthHeaders(),

                    credentials: "include"

                }

            );

        console.log(
            "Ingredients API status:",
            response.status
        );

        if (
            response.status === 401
        ) {

            handleUnauthorized();

            return;

        }

        if (!response.ok) {

            throw new Error(
                "Ingredient API returned " +
                response.status
            );

        }

        const data =
            await response.json();

        console.log(
            "Ingredients received from FastAPI:",
            data
        );


        /* =================================================
           HANDLE DIFFERENT API RESPONSE FORMATS
        ================================================= */

        if (Array.isArray(data)) {

            ingredientList =
                data;

        }

        else if (
            Array.isArray(data.ingredients)
        ) {

            ingredientList =
                data.ingredients;

        }

        else if (
            Array.isArray(data.data)
        ) {

            ingredientList =
                data.data;

        }

        else {

            ingredientList = [];

        }


        /* =================================================
           NORMALIZE INGREDIENT OBJECTS
        ================================================= */

        ingredientList =
            ingredientList.map(
                function (ingredient) {

                    return {

                        id:
                            ingredient.id ??
                            ingredient.ingredient_id,

                        name:
                            ingredient.name ??
                            ingredient.ingredient_name,

                        description:
                            ingredient.description ??
                            ""

                    };

                }
            );


        /* =================================================
           REMOVE INVALID RECORDS
        ================================================= */

        ingredientList =
            ingredientList.filter(
                function (ingredient) {

                    return (
                        ingredient.id !== undefined &&
                        ingredient.id !== null &&
                        ingredient.name
                    );

                }
            );


        if (
            ingredientList.length === 0
        ) {

            throw new Error(
                "No ingredients returned by API."
            );

        }

        console.log(
            "Database ingredients loaded:",
            ingredientList
        );

    }

    catch (error) {

        console.error(
            "Unable to load ingredients from FastAPI:",
            error
        );

        console.warn(
            "Using fallback ingredient list because the Ingredient API could not be loaded."
        );

        ingredientList =
            fallbackIngredients;

    }

}


/* =========================================================
   POPULATE INTERACTION DROPDOWNS
========================================================= */

function populateInteractionDropdowns() {

    const ingredient1 =
        document.getElementById(
            "interactionIngredient1"
        );

    const ingredient2 =
        document.getElementById(
            "interactionIngredient2"
        );

    if (
        !ingredient1 ||
        !ingredient2
    ) {

        console.warn(
            "Interaction dropdowns not found in HTML."
        );

        return;

    }

    ingredient1.innerHTML =
        `<option value="">Choose ingredient</option>`;

    ingredient2.innerHTML =
        `<option value="">Choose ingredient</option>`;


    ingredientList.forEach(
        function (ingredient) {

            const option1 =
                document.createElement(
                    "option"
                );

            option1.value =
                ingredient.id;

            option1.textContent =
                ingredient.name;

            ingredient1.appendChild(
                option1
            );


            const option2 =
                document.createElement(
                    "option"
                );

            option2.value =
                ingredient.id;

            option2.textContent =
                ingredient.name;

            ingredient2.appendChild(
                option2
            );

        }
    );


    console.log(
        "Interaction dropdowns populated."
    );

}


/* =========================================================
   GET INGREDIENT NAME BY ID
========================================================= */

function getIngredientNameById(id) {

    const ingredient =
        ingredientList.find(
            function (item) {

                return (
                    String(item.id) ===
                    String(id)
                );

            }
        );

    return ingredient
        ? ingredient.name
        : "Unknown Ingredient";

}


/* =========================================================
   INGREDIENT ANALYSIS DATA
========================================================= */

const ingredientData = {

    "Retinoids": {

        function:
            "Retinoids support skin renewal and are commonly used in acne and anti-aging routines.",

        benefits:
            "May support acne management, skin texture and the appearance of fine lines.",

        caution:
            "May cause dryness, peeling or irritation, especially when introduced too quickly."

    },

    "Niacinamide": {

        function:
            "Niacinamide is a form of vitamin B3 that supports the skin barrier and helps regulate oil production.",

        benefits:
            "May support oil control, barrier function and the appearance of uneven skin tone.",

        caution:
            "Usually well tolerated, but sensitive skin may experience mild irritation."

    },

    "Vitamin C": {

        function:
            "Vitamin C is an antioxidant commonly used to support brightening and protection from environmental stressors.",

        benefits:
            "May support brighter-looking skin and the appearance of dark spots.",

        caution:
            "Some formulations may cause stinging or irritation."

    },

    "Hyaluronic Acid": {

        function:
            "Hyaluronic Acid is a humectant that helps attract and retain water in the skin.",

        benefits:
            "Supports hydration and helps the skin feel softer and more moisturized.",

        caution:
            "Generally well tolerated by many skin types."

    },

    "Salicylic Acid": {

        function:
            "Salicylic Acid is a beta hydroxy acid that helps exfoliate inside pores.",

        benefits:
            "May support acne care, pore appearance and oily skin management.",

        caution:
            "Overuse may cause dryness or irritation."

    },

    "Ceramides": {

        function:
            "Ceramides are lipids that support the skin barrier.",

        benefits:
            "May help reduce moisture loss and support barrier function.",

        caution:
            "Generally well tolerated."

    },

    "Peptides": {

        function:
            "Peptides are short chains of amino acids used in many skin-supporting formulations.",

        benefits:
            "May support skin conditioning and anti-aging routines.",

        caution:
            "Generally well tolerated, although individual formulations can differ."

    },

    "AHAs/BHAs": {

        function:
            "AHAs and BHAs are exfoliating acids used to improve skin texture and remove accumulated dead skin cells.",

        benefits:
            "May support smoother-looking skin and improve the appearance of uneven texture.",

        caution:
            "Overuse may increase dryness, irritation and sensitivity."

    }

};


/* =========================================================
   SELECT INGREDIENT FROM LIBRARY
========================================================= */

function selectIngredient(
    ingredientName
) {

    console.log(
        "Ingredient selected:",
        ingredientName
    );

    const result =
        document.getElementById(
            "ingredientResult"
        );

    if (!result) {

        return;

    }

    const data =
        ingredientData[
            ingredientName
        ];

    if (!data) {

        result.innerHTML = `

            <div class="result-icon">

                <i class="fa-solid fa-flask"></i>

            </div>

            <div>

                <h2>
                    ${ingredientName}
                </h2>

                <p>
                    Ingredient information is currently unavailable.
                </p>

            </div>

        `;

        result.style.display =
            "flex";

        return;

    }

    result.innerHTML = `

        <div class="result-icon">

            <i class="fa-solid fa-flask"></i>

        </div>

        <div style="width:100%;">

            <span class="section-label">
                INGREDIENT ANALYSIS
            </span>

            <h2
                style="
                    margin:8px 0;
                    color:#294237;
                    font-size:20px;
                "
            >
                ${ingredientName}
            </h2>

            <p
                style="
                    margin:10px 0;
                    color:#69766f;
                    font-size:12px;
                    line-height:1.7;
                "
            >

                <strong>
                    Function:
                </strong>

                ${data.function}

            </p>

            <p
                style="
                    margin:10px 0;
                    color:#69766f;
                    font-size:12px;
                    line-height:1.7;
                "
            >

                <strong>
                    Benefits:
                </strong>

                ${data.benefits}

            </p>

            <p
                style="
                    margin:10px 0;
                    color:#69766f;
                    font-size:12px;
                    line-height:1.7;
                "
            >

                <strong>
                    Caution:
                </strong>

                ${data.caution}

            </p>

        </div>

    `;

    result.style.display =
        "flex";

    result.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });

}


/* =========================================================
   INGREDIENT SUITABILITY ASSESSMENT
   DATABASE-BACKED
   UPDATED PROFILE-AWARE VERSION
========================================================= */

async function checkIngredientSuitability() {

    const ingredientElement =
        document.getElementById(
            "suitabilityIngredient"
        );

    const skinTypeElement =
        document.getElementById(
            "suitabilitySkinType"
        );

    const concernElement =
        document.getElementById(
            "suitabilityConcern"
        );

    const sensitivityElement =
        document.getElementById(
            "suitabilitySensitivity"
        );


    if (
        !ingredientElement ||
        !skinTypeElement ||
        !concernElement ||
        !sensitivityElement
    ) {

        console.error(
            "Suitability form elements not found."
        );

        return;

    }


    const ingredientId =
        ingredientElement.value;

    const skinType =
        skinTypeElement.value
            .trim()
            .toLowerCase();

    const concern =
        concernElement.value
            .trim()
            .toLowerCase();

    const sensitivity =
        sensitivityElement.value
            .trim()
            .toLowerCase();


    const result =
        document.getElementById(
            "suitabilityResult"
        );

    const name =
        document.getElementById(
            "suitabilityIngredientName"
        );

    const status =
        document.getElementById(
            "suitabilityStatus"
        );

    const message =
        document.getElementById(
            "suitabilityMessage"
        );

    const recommendation =
        document.getElementById(
            "suitabilityRecommendation"
        );


    if (
        !ingredientId ||
        !skinType ||
        !concern ||
        !sensitivity
    ) {

        alert(
            "Please select ingredient, skin type, main concern and sensitivity."
        );

        return;

    }


    /* =================================================
       CHECK JWT
    ================================================= */

    const token =
        getAuthToken();


    if (!token) {

        if (result) {

            result.style.display =
                "block";

            result.innerHTML = `

                <div class="result-icon">

                    <i class="fa-solid fa-lock"></i>

                </div>

                <div style="width:100%;">

                    <span class="section-label">
                        AUTHENTICATION REQUIRED
                    </span>

                    <h2>
                        Login Required
                    </h2>

                    <p
                        style="
                            margin-top:10px;
                            color:#a33a3a;
                            line-height:1.7;
                        "
                    >
                        Your JWT authentication token is missing.
                        Please login again before checking ingredient suitability.
                    </p>

                </div>

            `;

        }

        return;

    }


    const ingredientName =
        getIngredientNameById(
            ingredientId
        );


    /* =================================================
       SHOW LOADING
    ================================================= */

    if (result) {

        result.style.display =
            "block";

        result.innerHTML = `

            <div class="result-icon">

                <i class="fa-solid fa-spinner fa-spin"></i>

            </div>

            <div style="width:100%;">

                <span class="section-label">
                    ANALYZING SUITABILITY
                </span>

                <h2>
                    ${ingredientName}
                </h2>

                <p
                    style="
                        margin-top:10px;
                        color:#69766f;
                        line-height:1.7;
                    "
                >
                    Checking ingredient suitability from the database...
                </p>

            </div>

        `;

    }


    try {

        console.log(
            "Checking ingredient suitability:",
            ingredientName,
            "ID:",
            ingredientId
        );


        /* =================================================
           DATABASE-BACKED SUITABILITY API
        ================================================= */

        const response =
            await fetch(

                `${API_BASE_URL}/ingredients/suitability/${ingredientId}`,

                {

                    method: "GET",

                    headers:
                        getAuthHeaders(),

                    credentials: "include"

                }

            );


        console.log(
            "Suitability API status:",
            response.status
        );


        /* =================================================
           JWT EXPIRED
        ================================================= */

        if (
            response.status === 401
        ) {

            handleUnauthorized();

            return;

        }


        /* =================================================
           INGREDIENT NOT FOUND
        ================================================= */

        if (
            response.status === 404
        ) {

            throw new Error(
                "Ingredient suitability information was not found in the database."
            );

        }


        if (!response.ok) {

            throw new Error(
                "Suitability API returned " +
                response.status
            );

        }


        const data =
            await response.json();


        console.log(
            "Suitability received from FastAPI:",
            data
        );


        /* =================================================
           GET DATABASE SUITABILITY RECORDS
        ================================================= */

        const suitabilityRecords =
            Array.isArray(data.suitability)
                ? data.suitability
                : [];


        /* =================================================
           NORMALIZE VALUES
        ================================================= */

        const normalizedSkinType =
            skinType
                .replace(/[_-]/g, " ")
                .trim();

        const normalizedConcern =
            concern
                .replace(/[_-]/g, " ")
                .trim();


        /* =================================================
           FIND EXACT SKIN TYPE + CONCERN
        ================================================= */

        let matchingRecord =
            suitabilityRecords.find(
                function (item) {

                    const itemSkinType =
                        String(
                            item.skin_type ?? ""
                        )
                            .trim()
                            .toLowerCase()
                            .replace(/[_-]/g, " ");

                    const itemConcern =
                        String(
                            item.skin_concern ?? ""
                        )
                            .trim()
                            .toLowerCase()
                            .replace(/[_-]/g, " ");

                    return (
                        itemSkinType ===
                        normalizedSkinType &&

                        itemConcern ===
                        normalizedConcern
                    );

                }
            );


        /* =================================================
           SECOND TRY:
           SKIN TYPE ONLY
        ================================================= */

        if (!matchingRecord) {

            matchingRecord =
                suitabilityRecords.find(
                    function (item) {

                        const itemSkinType =
                            String(
                                item.skin_type ?? ""
                            )
                                .trim()
                                .toLowerCase()
                                .replace(/[_-]/g, " ");

                        return (
                            itemSkinType ===
                            normalizedSkinType
                        );

                    }
                );

        }


        /* =================================================
           THIRD TRY:
           CONCERN ONLY
        ================================================= */

        if (!matchingRecord) {

            matchingRecord =
                suitabilityRecords.find(
                    function (item) {

                        const itemConcern =
                            String(
                                item.skin_concern ?? ""
                            )
                                .trim()
                                .toLowerCase()
                                .replace(/[_-]/g, " ");

                        return (
                            itemConcern ===
                            normalizedConcern
                        );

                    }
                );

        }


        /* =================================================
           NO DATABASE MATCH
        ================================================= */

        if (!matchingRecord) {

            if (result) {

                result.style.display =
                    "block";

                result.innerHTML = `

                    <div class="result-icon">

                        <i class="fa-solid fa-circle-info"></i>

                    </div>

                    <div style="width:100%;">

                        <span class="section-label">
                            SUITABILITY RESULT
                        </span>

                        <h2>
                            ${ingredientName}
                        </h2>

                        <div
                            class="interaction-neutral"
                            style="
                                display:inline-block;
                                margin-bottom:15px;
                                padding:8px 16px;
                                border-radius:20px;
                                font-size:11px;
                                font-weight:700;
                            "
                        >
                            NO MATCH FOUND
                        </div>

                        <p
                            style="
                                margin:8px 0 15px;
                                color:#69766f;
                                font-size:13px;
                                line-height:1.7;
                            "
                        >
                            No suitability record was found for the selected
                            skin type and concern.
                        </p>

                        <p
                            style="
                                margin-top:12px;
                                color:#42554b;
                                font-size:12px;
                                line-height:1.7;
                            "
                        >

                            <strong>
                                Recommendation:
                            </strong>

                            Please choose another combination or add
                            a suitability record for this ingredient
                            in the database.

                        </p>

                    </div>

                `;

            }

            return;

        }


        /* =================================================
           DATABASE VALUES
        ================================================= */

        const databaseSuitability =
            String(
                matchingRecord.suitability ?? ""
            )
                .trim();

        const databaseReason =
            matchingRecord.reason ??
            "Suitability information is available for your selected skin profile.";

        const databaseCaution =
            matchingRecord.caution ??
            "Monitor your skin for dryness, redness or irritation.";


        const normalizedSuitability =
            databaseSuitability
                .toLowerCase()
                .trim();


        /* =================================================
           BASE SCORE
           
           GOOD       = 85
           MODERATE   = 65
           CAUTION    = 45
           POOR       = 25
        ================================================= */

        let suitabilityScore = 45;

        if (
            normalizedSuitability === "good" ||
            normalizedSuitability.includes("good")
        ) {

            suitabilityScore = 85;

        }

        else if (
            normalizedSuitability === "moderate" ||
            normalizedSuitability.includes("moderate")
        ) {

            suitabilityScore = 65;

        }

        else if (
            normalizedSuitability === "caution" ||
            normalizedSuitability.includes("caution")
        ) {

            suitabilityScore = 45;

        }

        else if (
            normalizedSuitability.includes("poor") ||
            normalizedSuitability.includes("avoid")
        ) {

            suitabilityScore = 25;

        }


        /* =================================================
           IRRITATION-PRONE INGREDIENTS
        ================================================= */

        const irritationProneIngredients = [

            "retinoids",

            "salicylic acid",

            "ahas/bhas",

            "aha",

            "bha",

            "vitamin c"

        ];


        const normalizedIngredientName =
            ingredientName
                .toLowerCase()
                .trim();


        const isIrritationProne =
            irritationProneIngredients.some(
                function (item) {

                    return normalizedIngredientName
                        .includes(item);

                }
            );


        /* =================================================
           SENSITIVITY-BASED ADJUSTMENT
        ================================================= */

        let sensitivityNote = "";


        if (
            sensitivity === "high"
        ) {

            if (isIrritationProne) {

                suitabilityScore = 35;

                sensitivityNote =
                    " Because your sensitivity level is high, this ingredient may increase irritation risk. Introduce it only with extra caution and monitor your skin closely.";

            }

            else {

                suitabilityScore -= 15;

                if (suitabilityScore < 0) {

                    suitabilityScore = 0;

                }

                sensitivityNote =
                    " Because your sensitivity level is high, introduce the ingredient slowly and monitor your skin closely.";

            }

        }


        else if (
            sensitivity === "moderate"
        ) {

            if (isIrritationProne) {

                suitabilityScore = 45;

                sensitivityNote =
                    " Because your sensitivity level is moderate, gradual introduction is recommended and your skin response should be monitored closely.";

            }

            else {

                sensitivityNote =
                    " Because your sensitivity level is moderate, introduce the ingredient gradually and monitor your skin response.";

            }

        }


        else if (
            sensitivity === "low"
        ) {

            sensitivityNote =
                " Your sensitivity level is low, but you should still introduce new ingredients gradually.";

        }


        /* =================================================
           ADD CONCERN-SPECIFIC INFORMATION
        ================================================= */

        let concernNote = "";


        if (
            concern.includes("acne")
        ) {

            if (
                normalizedIngredientName.includes("retinoid")
            ) {

                concernNote =
                    " Retinoids can support acne care and signs of skin aging.";

            }

            else if (
                normalizedIngredientName.includes("salicylic")
            ) {

                concernNote =
                    " Salicylic Acid can support acne care and pore management.";

            }

            else if (
                normalizedIngredientName.includes("niacinamide")
            ) {

                concernNote =
                    " Niacinamide can support oil control and skin barrier function.";

            }

        }


        else if (
            concern.includes("dark spot") ||
            concern.includes("pigmentation") ||
            concern.includes("uneven tone")
        ) {

            if (
                normalizedIngredientName.includes("vitamin c")
            ) {

                concernNote =
                    " Vitamin C can support the appearance of dark spots and uneven skin tone.";

            }

            else if (
                normalizedIngredientName.includes("niacinamide")
            ) {

                concernNote =
                    " Niacinamide can support the appearance of uneven skin tone.";

            }

        }


        else if (
            concern.includes("texture")
        ) {

            if (
                normalizedIngredientName.includes("retinoid")
            ) {

                concernNote =
                    " Retinoids can support skin renewal and the appearance of uneven texture.";

            }

            else if (
                normalizedIngredientName.includes("aha") ||
                normalizedIngredientName.includes("bha")
            ) {

                concernNote =
                    " Exfoliating acids can support smoother-looking skin texture.";

            }

        }


        /* =================================================
           FINAL STATUS
        ================================================= */

        let resultStatus =
            "USE WITH CAUTION";

        let statusBackground =
            "#ffe7e7";

        let statusColor =
            "#a33a3a";


        if (
            suitabilityScore >= 75
        ) {

            resultStatus =
                "GOOD MATCH";

            statusBackground =
                "#e8f6ed";

            statusColor =
                "#31864a";

        }


        else if (
            suitabilityScore >= 55
        ) {

            resultStatus =
                "MODERATE MATCH";

            statusBackground =
                "#fff4d6";

            statusColor =
                "#8a6914";

        }


        else {

            resultStatus =
                "USE WITH CAUTION";

            statusBackground =
                "#ffe7e7";

            statusColor =
                "#a33a3a";

        }


        /* =================================================
           BUILD FINAL MESSAGE
        ================================================= */

        const finalMessage =
            `${databaseReason}${concernNote}${sensitivityNote}`;


        const finalRecommendation =
            `${databaseCaution} Introduce the ingredient gradually and monitor your skin for dryness, redness or irritation.`;


        if (name) {

            name.textContent =
                ingredientName;

        }


        if (status) {

            status.textContent =
                resultStatus;

            status.style.background =
                statusBackground;

            status.style.color =
                statusColor;

        }


        if (message) {

            message.textContent =
                finalMessage;

        }


        if (recommendation) {

            recommendation.innerHTML =
                "<strong>Recommendation:</strong> " +
                finalRecommendation +
                `<br><br><strong>Suitability Score:</strong> ${suitabilityScore}/100`;

        }


        if (result) {

            result.style.display =
                "block";

            const scoreElement =
                document.getElementById(
                    "suitabilityScore"
                );


            if (scoreElement) {

                scoreElement.textContent =
                    `${suitabilityScore}/100`;

            }


            let dynamicScore =
                document.getElementById(
                    "dynamicSuitabilityScore"
                );


            if (!dynamicScore) {

                dynamicScore =
                    document.createElement(
                        "div"
                    );

                dynamicScore.id =
                    "dynamicSuitabilityScore";

                dynamicScore.style.marginTop =
                    "15px";

                dynamicScore.style.fontSize =
                    "13px";

                dynamicScore.style.fontWeight =
                    "700";

                dynamicScore.style.color =
                    "#294237";

                result.appendChild(
                    dynamicScore
                );

            }


            dynamicScore.innerHTML =
                `Suitability Score: ${suitabilityScore}/100`;


            result.scrollIntoView({

                behavior: "smooth",

                block: "center"

            });

        }

    }


    catch (error) {

        console.error(
            "Ingredient suitability request failed:",
            error
        );


        if (result) {

            result.style.display =
                "block";

            result.innerHTML = `

                <div class="result-icon">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                </div>

                <div style="width:100%;">

                    <span class="section-label">
                        SUITABILITY ERROR
                    </span>

                    <h2>
                        ${ingredientName}
                    </h2>

                    <p
                        style="
                            margin-top:10px;
                            color:#a33a3a;
                            line-height:1.7;
                        "
                    >
                        ${error.message}
                    </p>

                    <p
                        style="
                            margin-top:10px;
                            color:#69766f;
                            line-height:1.7;
                        "
                    >
                        Please verify that you are logged in,
                        the FastAPI server is running, and the
                        ingredient suitability records exist
                        in PostgreSQL.
                    </p>

                </div>

            `;

        }

    }


    if (result) {

        result.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });

    }

}


/* =========================================================
   DATABASE-BACKED INGREDIENT INTERACTION
========================================================= */

async function checkIngredientInteraction() {

    const ingredient1Element =
        document.getElementById(
            "interactionIngredient1"
        );

    const ingredient2Element =
        document.getElementById(
            "interactionIngredient2"
        );

    if (
        !ingredient1Element ||
        !ingredient2Element
    ) {

        console.error(
            "Interaction dropdown elements were not found."
        );

        return;

    }


    const ingredient1Id =
        ingredient1Element.value;

    const ingredient2Id =
        ingredient2Element.value;


    if (
        !ingredient1Id ||
        !ingredient2Id
    ) {

        alert(
            "Please select both ingredients."
        );

        return;

    }


    if (
        String(ingredient1Id) ===
        String(ingredient2Id)
    ) {

        alert(
            "Please select two different ingredients."
        );

        return;

    }


    const ingredient1Name =
        getIngredientNameById(
            ingredient1Id
        );

    const ingredient2Name =
        getIngredientNameById(
            ingredient2Id
        );


    console.log(
        "Checking interaction:",
        ingredient1Name,
        "+",
        ingredient2Name
    );


    const result =
        document.getElementById(
            "interactionResult"
        );


    if (result) {

        result.style.display =
            "block";

        result.innerHTML = `

            <div class="result-icon">

                <i class="fa-solid fa-spinner fa-spin"></i>

            </div>

            <div>

                <span class="section-label">
                    ANALYZING INTERACTION
                </span>

                <h2>
                    ${ingredient1Name}
                    +
                    ${ingredient2Name}
                </h2>

                <p>
                    Checking ingredient interaction...
                </p>

            </div>

        `;

    }


    /* =====================================================
       CHECK JWT
    ===================================================== */

    const token =
        getAuthToken();


    if (!token) {

        if (result) {

            result.innerHTML = `

                <div class="result-icon">

                    <i class="fa-solid fa-lock"></i>

                </div>

                <div style="width:100%;">

                    <span class="section-label">
                        AUTHENTICATION REQUIRED
                    </span>

                    <h2>
                        Login Required
                    </h2>

                    <p
                        style="
                            margin-top:10px;
                            color:#a33a3a;
                            line-height:1.7;
                        "
                    >
                        Your JWT authentication token is missing.
                        Please login again before checking ingredient interactions.
                    </p>

                </div>

            `;

        }

        return;

    }


    try {

        console.log(
            "JWT token found. Calling interaction API..."
        );


        const response =
            await fetch(

                `${API_BASE_URL}/ingredients/interactions/${ingredient1Id}/${ingredient2Id}`,

                {

                    method: "GET",

                    headers:
                        getAuthHeaders(),

                    credentials: "include"

                }

            );


        console.log(
            "Interaction API status:",
            response.status
        );


        if (
            response.status === 401
        ) {

            handleUnauthorized();

            return;

        }


        if (
            response.status === 404
        ) {

            throw new Error(
                "Interaction record was not found in the database."
            );

        }


        if (!response.ok) {

            throw new Error(
                "Interaction API returned " +
                response.status
            );

        }


        const data =
            await response.json();


        console.log(
            "Interaction received from FastAPI:",
            data
        );


        displayInteractionResult(

            ingredient1Name,

            ingredient2Name,

            data

        );

    }


    catch (error) {

        console.error(
            "Ingredient interaction request failed:",
            error
        );


        if (result) {

            result.style.display =
                "block";

            result.innerHTML = `

                <div class="result-icon">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                </div>

                <div style="width:100%;">

                    <span class="section-label">
                        INTERACTION ERROR
                    </span>

                    <h2>
                        ${ingredient1Name}
                        +
                        ${ingredient2Name}
                    </h2>

                    <p
                        style="
                            margin-top:10px;
                            color:#a33a3a;
                            line-height:1.7;
                        "
                    >
                        ${error.message}
                    </p>

                    <p
                        style="
                            margin-top:10px;
                            color:#69766f;
                            line-height:1.7;
                        "
                    >
                        Please verify that you are logged in,
                        the FastAPI server is running, and the
                        IngredientInteraction record exists
                        in PostgreSQL.
                    </p>

                </div>

            `;

        }

    }


    if (result) {

        result.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });

    }

}


/* =========================================================
   DISPLAY DATABASE INTERACTION RESULT
========================================================= */

function displayInteractionResult(

    ingredient1Name,

    ingredient2Name,

    data

) {

    const result =
        document.getElementById(
            "interactionResult"
        );


    if (!result) {

        console.error(
            "interactionResult element not found."
        );

        return;

    }


    const compatibility =
        data.compatibility ??
        data.interaction ??
        data.status ??
        data.result ??
        "Unknown";


    const explanation =
        data.explanation ??
        data.reason ??
        data.description ??
        data.message ??
        "These ingredients can generally be used together in a skincare routine.";


    const recommendation =
        data.recommendation ??
        data.caution ??
        data.advice ??
        "Use according to the product instructions and monitor your skin for any unexpected irritation.";


    const severity =
        data.severity ??
        data.risk_level ??
        data.risk ??
        "";


    const normalizedCompatibility =
        String(
            compatibility
        )
            .trim()
            .toLowerCase();


    let statusClass =
        "interaction-neutral";


    let icon =
        "fa-circle-info";


    let displayStatus =
        String(
            compatibility
        );


    if (

        normalizedCompatibility.includes(
            "compatible"
        ) ||

        normalizedCompatibility.includes(
            "safe"
        ) ||

        normalizedCompatibility.includes(
            "good"
        )

    ) {

        statusClass =
            "interaction-safe";


        icon =
            "fa-circle-check";


        displayStatus =
            "COMPATIBLE";

    }


    else if (

        normalizedCompatibility.includes(
            "caution"
        ) ||

        normalizedCompatibility.includes(
            "moderate"
        ) ||

        normalizedCompatibility.includes(
            "warning"
        )

    ) {

        statusClass =
            "interaction-caution";


        icon =
            "fa-triangle-exclamation";


        displayStatus =
            "USE WITH CAUTION";

    }


    else if (

        normalizedCompatibility.includes(
            "avoid"
        ) ||

        normalizedCompatibility.includes(
            "incompatible"
        ) ||

        normalizedCompatibility.includes(
            "high"
        )

    ) {

        statusClass =
            "interaction-danger";


        icon =
            "fa-circle-xmark";


        displayStatus =
            "NOT RECOMMENDED";

    }


    result.innerHTML = `

        <div class="result-icon">

            <i class="fa-solid ${icon}"></i>

        </div>


        <div style="width:100%;">

            <span
                class="section-label"
                style="
                    display:block;
                    margin-bottom:8px;
                "
            >
                INTERACTION RESULT
            </span>


            <h2
                style="
                    margin:0 0 15px;
                    color:#294237;
                    font-size:20px;
                    font-weight:600;
                "
            >
                ${ingredient1Name} + ${ingredient2Name}
            </h2>


            <div
                class="${statusClass}"
                style="
                    display:inline-block;
                    margin-bottom:15px;
                    padding:8px 16px;
                    border-radius:20px;
                    font-size:11px;
                    font-weight:700;
                "
            >

                ${displayStatus}

            </div>


            <p
                style="
                    margin:8px 0 15px;
                    color:#69766f;
                    font-size:13px;
                    line-height:1.7;
                "
            >

                ${explanation}

            </p>


            ${
                severity
                    ?
                    `

                    <p
                        style="
                            margin:8px 0 12px;
                            color:#42554b;
                            font-size:12px;
                            line-height:1.6;
                        "
                    >

                        <strong>
                            Severity:
                        </strong>

                        ${severity}

                    </p>

                    `
                    :
                    ""
            }


            <p
                style="
                    margin-top:12px;
                    color:#42554b;
                    font-size:12px;
                    line-height:1.7;
                "
            >

                <strong>
                    Recommendation:
                </strong>

                ${recommendation}

            </p>

        </div>

    `;


    result.style.display =
        "flex";


    result.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });

}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "access_token"
    );

    localStorage.removeItem(
        "accessToken"
    );

    localStorage.removeItem(
        "role"
    );

    window.location.href =
        "login.html";

}