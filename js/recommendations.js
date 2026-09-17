// =====================================================
// PRODUCT RECOMMENDATION ENGINE
// =====================================================

console.log("Product Recommendation Engine loaded");


// =====================================================
// PRODUCT DATABASE
// =====================================================

const products = [

    {
        id: 1,
        name: "Gentle Hydrating Cleanser",
        category: "Cleanser",
        price: 299,

        image: "../images/cleanser.png",

        suitableFor: [
            "dryness",
            "sensitivity",
            "acne",
            "combination"
        ],

        ingredients: [
            "Glycerin",
            "Ceramides",
            "Hyaluronic Acid"
        ]
    },

    {
        id: 2,
        name: "Vitamin C Brightening Serum",
        category: "Serum",
        price: 499,

        image: "../images/serum.png",

        suitableFor: [
            "pigmentation",
            "dark spots",
            "dullness",
            "combination"
        ],

        ingredients: [
            "Vitamin C",
            "Ferulic Acid",
            "Vitamin E"
        ]
    },

    {
        id: 3,
        name: "Niacinamide 10% Serum",
        category: "Serum",
        price: 399,

        image: "../images/serum.png",

        suitableFor: [
            "acne",
            "pigmentation",
            "oiliness",
            "combination"
        ],

        ingredients: [
            "Niacinamide",
            "Zinc"
        ]
    },

    {
        id: 4,
        name: "Hyaluronic Acid Hydrating Serum",
        category: "Serum",
        price: 449,

        image: "../images/serum.png",

        suitableFor: [
            "dryness",
            "dehydration",
            "combination"
        ],

        ingredients: [
            "Hyaluronic Acid",
            "Glycerin"
        ]
    },

    {
        id: 5,
        name: "Barrier Repair Moisturizer",
        category: "Moisturizer",
        price: 349,

        image: "../images/moisturizer.png",

        suitableFor: [
            "dryness",
            "sensitivity",
            "combination"
        ],

        ingredients: [
            "Ceramides",
            "Panthenol",
            "Squalane"
        ]
    },

    {
        id: 6,
        name: "Acne Control Treatment",
        category: "Treatment",
        price: 399,

        image: "../images/acne-control.png.jpg",

        suitableFor: [
            "acne",
            "breakouts",
            "oily"
        ],

        ingredients: [
            "Salicylic Acid",
            "Niacinamide"
        ]
    },

    {
        id: 7,
        name: "Mineral SPF 50 Sunscreen",
        category: "Sunscreen",
        price: 599,

        image: "../images/sunscreen.png",

        suitableFor: [
            "sensitivity",
            "pigmentation",
            "acne",
            "dryness",
            "combination"
        ],

        ingredients: [
            "Zinc Oxide",
            "Titanium Dioxide"
        ]
    }

];


// =====================================================
// MARKETPLACE SEARCH LINKS
// =====================================================

function getAmazonLink(product) {

    return "https://www.amazon.in/s?k=" +
        encodeURIComponent(product.name);

}


function getNykaaLink(product) {

    return "https://www.nykaa.com/search/result/?q=" +
        encodeURIComponent(product.name);

}


function getPurplleLink(product) {

    return "https://www.purplle.com/search?q=" +
        encodeURIComponent(product.name);

}


// =====================================================
// GET LATEST SKIN ASSESSMENT
// =====================================================

async function getLatestAssessment() {

    const token =
        localStorage.getItem("token");

    if (!token) {

        console.warn(
            "No JWT token found"
        );

        return null;
    }

        const baseUrl = (typeof window.APP_CONFIG !== "undefined" && window.APP_CONFIG.API_BASE_URL) ? window.APP_CONFIG.API_BASE_URL : "http://127.0.0.1:8000";

        const response =
            await fetch(
                `${baseUrl}/assessment/`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            console.error(
                "Assessment API error:",
                response.status
            );

            return null;
        }


        const assessments =
            await response.json();


        console.log(
            "Assessments received:",
            assessments
        );


        if (
            !Array.isArray(assessments) ||
            assessments.length === 0
        ) {

            return null;
        }


        return assessments[
            assessments.length - 1
        ];

    }

    catch (error) {

        console.error(
            "Failed to load assessment:",
            error
        );

        return null;
    }
}


// =====================================================
// NORMALIZE SKIN CONCERN
// =====================================================

function normalizeConcern(assessment) {

    if (!assessment) {

        return "combination";
    }


    const concernText = (

        assessment.main_concern ||

        assessment.overall_condition ||

        assessment.skin_type ||

        ""

    ).toLowerCase();


    if (
        concernText.includes("acne") ||
        concernText.includes("breakout")
    ) {

        return "acne";
    }


    if (
        concernText.includes("pigmentation") ||
        concernText.includes("dark spot")
    ) {

        return "pigmentation";
    }


    if (
        concernText.includes("dry") ||
        concernText.includes("dehydrat")
    ) {

        return "dryness";
    }


    if (
        concernText.includes("sensitive") ||
        concernText.includes("sensitivity")
    ) {

        return "sensitivity";
    }


    if (
        concernText.includes("combination")
    ) {

        return "combination";
    }


    return "combination";
}


// =====================================================
// CALCULATE PRODUCT SUITABILITY SCORE
// =====================================================

function calculateSuitability(
    product,
    concern
) {

    let score = 50;


    if (
        product.suitableFor.includes(
            concern
        )
    ) {

        score += 40;
    }


    // General skincare compatibility

    if (
        product.category === "Sunscreen"
    ) {

        score += 5;
    }


    if (
        product.category === "Cleanser"
    ) {

        score += 5;
    }


    return Math.min(
        score,
        100
    );
}


// =====================================================
// GENERATE PRODUCT RECOMMENDATIONS
// =====================================================

function generateRecommendations(
    assessment
) {

    const concern =
        normalizeConcern(
            assessment
        );


    console.log(
        "Detected skin concern:",
        concern
    );


    const recommendations =
        products.map(
            product => {

                const score =
                    calculateSuitability(
                        product,
                        concern
                    );


                return {

                    ...product,

                    suitabilityScore:
                        score,

                    recommendationConcern:
                        concern

                };

            }
        );


    recommendations.sort(
        (a, b) =>
            b.suitabilityScore -
            a.suitabilityScore
    );


    return recommendations;
}


// =====================================================
// MARKETPLACE BUTTONS
// =====================================================

function createMarketplaceButtons(
    product
) {

    return `

        <div class="marketplace-section">

            <div class="marketplace-title">

                <i class="fa-solid fa-cart-shopping"></i>

                <span>Shop this product</span>

            </div>


            <div class="marketplace-buttons">

                <a
                    href="${getAmazonLink(product)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="marketplace-btn amazon-btn"
                >

                    <i class="fa-brands fa-amazon"></i>

                    Amazon

                </a>


                <a
                    href="${getNykaaLink(product)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="marketplace-btn nykaa-btn"
                >

                    <i class="fa-solid fa-bag-shopping"></i>

                    Nykaa

                </a>


                <a
                    href="${getPurplleLink(product)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="marketplace-btn purplle-btn"
                >

                    <i class="fa-solid fa-store"></i>

                    Purplle

                </a>

            </div>

        </div>

    `;
}


// =====================================================
// DISPLAY PRODUCT RECOMMENDATIONS
// =====================================================

function displayProductRecommendations(
    recommendations
) {

    console.log(
        "Displaying product recommendations..."
    );


    const grid =
        document.getElementById(
            "productRecommendationGrid"
        );


    console.log(
        "Grid inside display function:",
        grid
    );


    if (!grid) {

        console.error(
            "ERROR: productRecommendationGrid was not found."
        );

        return;
    }


    grid.innerHTML = "";


    if (
        !recommendations ||
        recommendations.length === 0
    ) {

        grid.innerHTML = `

            <div class="no-products">

                <i class="fa-solid fa-box-open"></i>

                <h3>
                    No Products Found
                </h3>

                <p>
                    No suitable products were found
                    for your skin profile.
                </p>

            </div>

        `;

        return;
    }


    const topProducts =
        recommendations.slice(
            0,
            5
        );


    topProducts.forEach(
        product => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "professional-product-card";


            card.innerHTML = `

                <div class="product-image-area">

                    <div class="product-category">

                        ${product.category || "Product"}

                    </div>


                    <img
                        src="${product.image}"
                        alt="${product.name}"
                        class="real-product-image"

                        onerror="
                            this.style.display='none';
                            this.nextElementSibling.style.display='flex';
                        "
                    >


                    <div
                        style="
                            display:none;
                            align-items:center;
                            justify-content:center;
                            width:100%;
                            height:100%;
                            font-size:60px;
                            color:#2f8f83;
                        "
                    >

                        <i class="fa-solid fa-pump-soap"></i>

                    </div>


                    <div class="match-badge">

                        <i class="fa-solid fa-check"></i>

                        ${product.suitabilityScore || 0}%
                        Match

                    </div>

                </div>


                <div class="product-content">


                    <span class="product-type">

                        ${product.category || "Skincare"}

                    </span>


                    <h3>

                        ${product.name ||
                        "Recommended Product"}

                    </h3>


                    <p class="product-description">

                        ${
                            product.description ||
                            "Recommended based on your personalized skin assessment."
                        }

                    </p>


                    <div class="product-benefits">

                        ${
                            product.ingredients

                                ? product.ingredients
                                    .slice(0, 4)
                                    .map(
                                        ingredient => `

                                            <span>

                                                <i class="fa-solid fa-leaf"></i>

                                                ${ingredient}

                                            </span>

                                        `
                                    )
                                    .join("")

                                : ""
                        }

                    </div>


                    <div class="ai-reason">

                        <i class="fa-solid fa-brain"></i>

                        <div>

                            <strong>
                                Why AI Recommended This
                            </strong>

                            <p>

                                This product was selected
                                based on your detected skin
                                concerns and personalized
                                suitability score.

                            </p>

                        </div>

                    </div>


                    <div class="product-price-box">

                        <span>
                            Price
                        </span>

                        <strong>

                            ₹${product.price || "N/A"}

                        </strong>

                    </div>


                    ${createMarketplaceButtons(product)}


                    <button
                        class="compare-product-btn"

                        onclick="
                            addToComparison(
                                ${product.id},
                                ${product.suitabilityScore}
                            )
                        "
                    >

                        <i class="fa-solid fa-code-compare"></i>

                        Compare Product

                    </button>


                    <button
                        class="alternative-product-btn"

                        onclick="
                            showAlternatives(
                                ${product.id},
                                '${product.recommendationConcern}'
                            )
                        "
                    >

                        <i class="fa-solid fa-shuffle"></i>

                        View Alternatives

                    </button>


                </div>

            `;


            grid.appendChild(
                card
            );

        }
    );


    console.log(
        "Product recommendations displayed successfully:",
        topProducts
    );
}


// =====================================================
// INITIALIZE PRODUCT RECOMMENDATION ENGINE
// =====================================================

async function initializeRecommendationEngine() {

    console.log(
        "Initializing Product Recommendation Engine..."
    );


    const assessment =
        await getLatestAssessment();


    if (!assessment) {

        console.warn(
            "No assessment available"
        );

        return;
    }


    const recommendations =
        generateRecommendations(
            assessment
        );


    console.log(
        "Personalized Recommendations:",
        recommendations
    );


    console.log(
        "Top Recommended Products:",
        recommendations.slice(0, 5)
    );


    displayProductRecommendations(
        recommendations
    );
}


// =====================================================
// START ENGINE
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Products page loaded"
        );


        const grid =
            document.getElementById(
                "productRecommendationGrid"
            );


        console.log(
            "Grid found:",
            grid
        );


        initializeRecommendationEngine();

    }
);


// =====================================================
// PRODUCT COMPARISON
// =====================================================

let comparisonProducts = [];


// =====================================================
// ADD PRODUCT TO COMPARISON
// =====================================================

function addToComparison(
    productId,
    suitabilityScore
) {

    const product =
        products.find(
            p => p.id === productId
        );


    if (!product) {

        console.error(
            "Product not found:",
            productId
        );

        return;
    }


    const comparisonProduct = {

        ...product,

        suitabilityScore:
            suitabilityScore

    };


    if (
        comparisonProducts.some(
            p => p.id === productId
        )
    ) {

        alert(
            "This product is already selected for comparison."
        );

        return;
    }


    if (
        comparisonProducts.length >= 2
    ) {

        alert(
            "You can compare only 2 products at a time."
        );

        return;
    }


    comparisonProducts.push(
        comparisonProduct
    );


    console.log(
        "Products selected for comparison:",
        comparisonProducts
    );


    if (
        comparisonProducts.length === 2
    ) {

        showProductComparison();

    }

    else {

        alert(
            "Product added. Select one more product to compare."
        );

    }

}


// =====================================================
// SHOW PRODUCT COMPARISON
// =====================================================

// =====================================================
// SHOW PRODUCT COMPARISON - MODERN DESIGN
// =====================================================

// =====================================================
// SHOW PRODUCT COMPARISON - PROFESSIONAL UI
// =====================================================

function showProductComparison() {

    const product1 = comparisonProducts[0];
    const product2 = comparisonProducts[1];

    if (!product1 || !product2) {
        return;
    }

    const score1 = product1.suitabilityScore || 0;
    const score2 = product2.suitabilityScore || 0;

    const product1Best = score1 >= score2;
    const product2Best = score2 > score1;

    const modal = document.createElement("div");

    modal.className = "comparison-modal";

    modal.innerHTML = `

        <style>

            /* =================================================
               PROFESSIONAL COMPARISON MODAL
            ================================================= */

            .comparison-modal {
                position: fixed;
                inset: 0;
                z-index: 99999;

                display: flex;
                align-items: center;
                justify-content: center;

                padding: 25px;

                font-family: 'Poppins', sans-serif;
            }


            /* BACKGROUND */

            .comparison-modal .comparison-overlay {
                position: absolute;
                inset: 0;

                background: rgba(20, 35, 32, 0.58);

                backdrop-filter: blur(6px);
            }


            /* MAIN PANEL */

            .comparison-modal .comparison-box {

                position: relative;
                z-index: 2;

                width: 100%;
                max-width: 820px;

                max-height: 88vh;
                overflow-y: auto;

                background: #ffffff;

                border-radius: 20px;

                padding: 28px;

                box-shadow:
                    0 25px 70px rgba(0, 0, 0, 0.22);

                animation: comparisonOpen 0.25s ease;
            }


            @keyframes comparisonOpen {

                from {
                    opacity: 0;
                    transform: translateY(15px) scale(0.98);
                }

                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }

            }


            /* CLOSE */

            .comparison-modal .comparison-close {

                position: absolute;

                top: 18px;
                right: 18px;

                width: 34px;
                height: 34px;

                border: 1px solid #e4ece9;

                border-radius: 50%;

                background: #f7faf9;

                color: #52615b;

                display: flex;
                align-items: center;
                justify-content: center;

                cursor: pointer;

                transition: 0.2s ease;
            }


            .comparison-modal .comparison-close:hover {

                background: #2f8f83;

                border-color: #2f8f83;

                color: #ffffff;
            }


            /* HEADER */

            .comparison-modal .comparison-header {

                text-align: center;

                padding-right: 35px;

                margin-bottom: 24px;
            }


            .comparison-modal .comparison-header-icon {

                width: 44px;
                height: 44px;

                margin: 0 auto 10px;

                display: flex;

                align-items: center;
                justify-content: center;

                border-radius: 12px;

                background: #edf7f5;

                color: #2f8f83;

                font-size: 19px;
            }


            .comparison-modal .comparison-header h2 {

                margin: 0;

                color: #243b35;

                font-size: 22px;

                font-weight: 600;
            }


            .comparison-modal .comparison-header p {

                margin: 6px 0 0;

                color: #8a9691;

                font-size: 10px;
            }


            /* COMPARISON GRID */

            .comparison-modal .comparison-grid {

                display: grid;

                grid-template-columns: repeat(2, 1fr);

                gap: 16px;
            }


            /* PRODUCT CARD */

            .comparison-modal .comparison-product {

                position: relative;

                background: #ffffff;

                border: 1px solid #e2ebe7;

                border-radius: 15px;

                padding: 19px;

                overflow: hidden;

                transition: 0.2s ease;
            }


            .comparison-modal .comparison-product:hover {

                border-color: #b9d8d0;

                box-shadow:
                    0 8px 25px rgba(35, 80, 70, 0.08);
            }


            /* BEST MATCH CARD */

            .comparison-modal .comparison-product.best-product {

                border: 1.5px solid #2f8f83;

                background: #fbfefd;
            }


            /* BEST MATCH BADGE */

            .comparison-modal .best-badge {

                position: absolute;

                top: 0;
                right: 0;

                background: #2f8f83;

                color: #ffffff;

                padding: 6px 11px;

                border-radius: 0 0 0 9px;

                font-size: 8px;

                font-weight: 600;

                letter-spacing: 0.3px;
            }


            /* CATEGORY */

            .comparison-modal .comparison-category {

                display: inline-block;

                background: #edf7f5;

                color: #2f8f83;

                padding: 5px 9px;

                border-radius: 6px;

                font-size: 8px;

                font-weight: 600;

                text-transform: uppercase;

                letter-spacing: 0.5px;

                margin-bottom: 10px;
            }


            /* PRODUCT NAME */

            .comparison-modal .comparison-product h3 {

                margin: 0 0 12px;

                color: #243b35;

                font-size: 15px;

                font-weight: 600;

                line-height: 1.45;

                min-height: 43px;
            }


            /* PRICE */

            .comparison-modal .comparison-price-row {

                display: flex;

                align-items: center;

                justify-content: space-between;

                padding: 12px 0;

                border-top: 1px solid #edf1ef;

                border-bottom: 1px solid #edf1ef;

                margin-bottom: 14px;
            }


            .comparison-modal .comparison-price-label {

                color: #89938f;

                font-size: 9px;
            }


            .comparison-modal .comparison-price {

                color: #243b35;

                font-size: 18px;

                font-weight: 600;
            }


            /* AI MATCH */

            .comparison-modal .match-row {

                display: flex;

                align-items: center;

                justify-content: space-between;

                margin-bottom: 15px;
            }


            .comparison-modal .match-label {

                display: flex;

                align-items: center;

                gap: 6px;

                color: #52615b;

                font-size: 9px;

                font-weight: 500;
            }


            .comparison-modal .match-label i {

                color: #2f8f83;
            }


            .comparison-modal .match-score {

                display: inline-flex;

                align-items: center;

                gap: 5px;

                padding: 6px 10px;

                border-radius: 7px;

                background: #edf7f5;

                color: #2f8f83;

                font-size: 9px;

                font-weight: 600;
            }


            /* INGREDIENT TITLE */

            .comparison-modal .ingredients-title {

                display: flex;

                align-items: center;

                gap: 6px;

                margin-bottom: 9px;

                color: #34463f;

                font-size: 9px;

                font-weight: 600;
            }


            .comparison-modal .ingredients-title i {

                color: #2f8f83;
            }


            /* INGREDIENT CHIPS */

            .comparison-modal .ingredient-list {

                display: flex;

                flex-wrap: wrap;

                gap: 6px;

                margin-bottom: 15px;
            }


            .comparison-modal .ingredient-chip {

                display: inline-flex;

                align-items: center;

                gap: 4px;

                background: #f5f8f7;

                border: 1px solid #e8eeec;

                color: #64716d;

                padding: 5px 7px;

                border-radius: 5px;

                font-size: 7.5px;
            }


            .comparison-modal .ingredient-chip i {

                color: #2f8f83;

                font-size: 7px;
            }


            /* AI ADVANTAGE */

            .comparison-modal .product-advantage {

                display: flex;

                align-items: center;

                gap: 7px;

                padding: 8px 10px;

                margin-bottom: 14px;

                background: #f5faf8;

                border-radius: 7px;

                color: #2f8f83;

                font-size: 8px;

                font-weight: 500;
            }


            .comparison-modal .product-advantage i {

                font-size: 11px;
            }


            /* SUMMARY */

            .comparison-modal .comparison-summary {

                display: flex;

                align-items: center;

                gap: 12px;

                margin-top: 17px;

                padding: 14px 16px;

                background: #f5faf8;

                border: 1px solid #dcece7;

                border-radius: 11px;
            }


            .comparison-modal .summary-icon {

                width: 34px;
                height: 34px;

                min-width: 34px;

                display: flex;

                align-items: center;
                justify-content: center;

                background: #2f8f83;

                color: #ffffff;

                border-radius: 8px;

                font-size: 13px;
            }


            .comparison-modal .comparison-summary strong {

                display: block;

                color: #243b35;

                font-size: 10px;

                margin-bottom: 3px;
            }


            .comparison-modal .comparison-summary p {

                margin: 0;

                color: #64716d;

                font-size: 8.5px;

                line-height: 1.5;
            }


            /* MARKETPLACE BUTTON AREA */

            .comparison-modal .comparison-product > div:last-child {

                margin-top: 8px;
            }


            /* MOBILE */

            @media (max-width: 700px) {

                .comparison-modal {

                    padding: 10px;
                }

                .comparison-modal .comparison-box {

                    padding: 20px;

                    max-height: 94vh;
                }

                .comparison-modal .comparison-grid {

                    grid-template-columns: 1fr;
                }

                .comparison-modal .comparison-product h3 {

                    min-height: auto;
                }

            }

        </style>


        <!-- OVERLAY -->

        <div
            class="comparison-overlay"
            onclick="closeComparison()"
        ></div>


        <!-- COMPARISON PANEL -->

        <div class="comparison-box">


            <!-- CLOSE -->

            <button
                class="comparison-close"
                onclick="closeComparison()"
                title="Close comparison"
            >

                <i class="fa-solid fa-xmark"></i>

            </button>


            <!-- HEADER -->

            <div class="comparison-header">

                <div class="comparison-header-icon">

                    <i class="fa-solid fa-code-compare"></i>

                </div>

                <h2>
                    Product Comparison
                </h2>

                <p>
                    Compare products using AI suitability,
                    price and ingredients.
                </p>

            </div>


            <!-- PRODUCTS -->

            <div class="comparison-grid">


                <!-- PRODUCT 1 -->

                <div
                    class="comparison-product
                    ${product1Best ? "best-product" : ""}"
                >

                    ${
                        product1Best
                        ? `
                            <div class="best-badge">
                                <i class="fa-solid fa-star"></i>
                                BEST MATCH
                            </div>
                        `
                        : ""
                    }


                    <span class="comparison-category">
                        ${product1.category}
                    </span>


                    <h3>
                        ${product1.name}
                    </h3>


                    <!-- PRICE -->

                    <div class="comparison-price-row">

                        <span class="comparison-price-label">
                            PRICE
                        </span>

                        <span class="comparison-price">
                            ₹${product1.price}
                        </span>

                    </div>


                    <!-- AI MATCH -->

                    <div class="match-row">

                        <span class="match-label">

                            <i class="fa-solid fa-brain"></i>

                            AI Suitability

                        </span>

                        <span class="match-score">

                            <i class="fa-solid fa-check"></i>

                            ${score1}% Match

                        </span>

                    </div>


                    <!-- INGREDIENTS -->

                    <div class="ingredients-title">

                        <i class="fa-solid fa-leaf"></i>

                        KEY INGREDIENTS

                    </div>


                    <div class="ingredient-list">

                        ${
                            product1.ingredients
                                .map(
                                    ingredient => `

                                        <span class="ingredient-chip">

                                            <i class="fa-solid fa-leaf"></i>

                                            ${ingredient}

                                        </span>

                                    `
                                )
                                .join("")
                        }

                    </div>


                    ${
                        product1Best
                        ? `
                            <div class="product-advantage">

                                <i class="fa-solid fa-circle-check"></i>

                                Higher AI suitability for your skin profile

                            </div>
                        `
                        : ""
                    }


                    ${createMarketplaceButtons(product1)}

                </div>


                <!-- PRODUCT 2 -->

                <div
                    class="comparison-product
                    ${product2Best ? "best-product" : ""}"
                >

                    ${
                        product2Best
                        ? `
                            <div class="best-badge">
                                <i class="fa-solid fa-star"></i>
                                BEST MATCH
                            </div>
                        `
                        : ""
                    }


                    <span class="comparison-category">
                        ${product2.category}
                    </span>


                    <h3>
                        ${product2.name}
                    </h3>


                    <!-- PRICE -->

                    <div class="comparison-price-row">

                        <span class="comparison-price-label">
                            PRICE
                        </span>

                        <span class="comparison-price">
                            ₹${product2.price}
                        </span>

                    </div>


                    <!-- AI MATCH -->

                    <div class="match-row">

                        <span class="match-label">

                            <i class="fa-solid fa-brain"></i>

                            AI Suitability

                        </span>

                        <span class="match-score">

                            <i class="fa-solid fa-check"></i>

                            ${score2}% Match

                        </span>

                    </div>


                    <!-- INGREDIENTS -->

                    <div class="ingredients-title">

                        <i class="fa-solid fa-leaf"></i>

                        KEY INGREDIENTS

                    </div>


                    <div class="ingredient-list">

                        ${
                            product2.ingredients
                                .map(
                                    ingredient => `

                                        <span class="ingredient-chip">

                                            <i class="fa-solid fa-leaf"></i>

                                            ${ingredient}

                                        </span>

                                    `
                                )
                                .join("")
                        }

                    </div>


                    ${
                        product2Best
                        ? `
                            <div class="product-advantage">

                                <i class="fa-solid fa-circle-check"></i>

                                Higher AI suitability for your skin profile

                            </div>
                        `
                        : ""
                    }


                    ${createMarketplaceButtons(product2)}

                </div>


            </div>


            <!-- AI SUMMARY -->

            <div class="comparison-summary">

                <div class="summary-icon">

                    <i class="fa-solid fa-brain"></i>

                </div>


                <div>

                    <strong>
                        AI Comparison Result
                    </strong>

                    <p>

                        ${
                            score1 === score2

                            ?

                            `Both products have the same
                             AI suitability score of ${score1}%.`

                            :

                            `${score1 > score2
                                ? product1.name
                                : product2.name
                            } is the better match for your
                            current skin profile with a
                            ${Math.max(score1, score2)}% suitability score.`

                        }

                    </p>

                </div>

            </div>


        </div>

    `;


    document.body.appendChild(modal);
}

// =====================================================
// CLOSE COMPARISON
// =====================================================

function closeComparison() {

    const modal =
        document.querySelector(
            ".comparison-modal"
        );


    if (modal) {

        modal.remove();

    }


    comparisonProducts = [];

}


// =====================================================
// ALTERNATIVE PRODUCT SUGGESTIONS
// =====================================================

function getAlternativeProducts(
    productId,
    concern
) {

    console.log(
        "Finding alternative products for:",
        productId,
        "Concern:",
        concern
    );


    const selectedProduct =
        products.find(
            product => product.id === productId
        );


    if (!selectedProduct) {

        console.error(
            "Selected product not found:",
            productId
        );

        return [];
    }


    let alternatives =
        products.filter(

            product =>

                product.id !== productId &&

                product.category ===
                    selectedProduct.category &&

                product.suitableFor.includes(
                    concern
                )

        );


    if (
        alternatives.length === 0
    ) {

        console.log(
            "No same-category alternatives found."
        );


        console.log(
            "Searching for other suitable products..."
        );


        alternatives =
            products.filter(

                product =>

                    product.id !== productId &&

                    product.suitableFor.includes(
                        concern
                    )

            );

    }


    console.log(
        "Alternative products found:",
        alternatives
    );


    return alternatives;
}


// =====================================================
// SHOW ALTERNATIVE PRODUCTS
// =====================================================

function showAlternatives(
    productId,
    concern
) {

    console.log(
        "Showing alternatives for:",
        productId,
        "Concern:",
        concern
    );


    const selectedProduct =
        products.find(
            product => product.id === productId
        );


    if (!selectedProduct) {

        console.error(
            "Selected product not found:",
            productId
        );

        return;
    }


    const alternatives =
        getAlternativeProducts(
            productId,
            concern
        );


    const modal =
        document.createElement(
            "div"
        );


    modal.className =
        "alternative-modal";


    let alternativeHTML = "";


    if (
        alternatives.length === 0
    ) {

        alternativeHTML = `

            <div class="no-alternatives">

                <i class="fa-solid fa-circle-info"></i>

                <h3>
                    No Alternatives Found
                </h3>

                <p>

                    There are no other products
                    suitable for your current
                    skin concern.

                </p>

            </div>

        `;

    }

    else {

        alternativeHTML =

            alternatives
                .map(
                    product => {

                        const score =
                            calculateSuitability(
                                product,
                                concern
                            );


                        return `

                            <div
                                class="alternative-product-card"
                            >

                                <div
                                    class="alternative-image"
                                >

                                    <img
                                        src="${product.image}"
                                        alt="${product.name}"

                                        onerror="
                                            this.style.display='none';
                                        "
                                    >

                                </div>


                                <div
                                    class="alternative-content"
                                >

                                    <span
                                        class="alternative-category"
                                    >

                                        ${product.category}

                                    </span>


                                    <h3>

                                        ${product.name}

                                    </h3>


                                    <p>

                                        Suitable alternative
                                        for your
                                        ${concern}
                                        skin concern.

                                    </p>


                                    <div
                                        class="alternative-info"
                                    >

                                        <strong>

                                            <i
                                                class="fa-solid fa-brain"
                                            ></i>

                                            AI Match:
                                            ${score}%

                                        </strong>


                                        <strong>

                                            ₹${product.price}

                                        </strong>

                                    </div>


                                    <div
                                        class="alternative-ingredients"
                                    >

                                        ${
                                            product.ingredients
                                                .slice(0, 4)
                                                .map(
                                                    ingredient => `

                                                        <span>

                                                            <i
                                                                class="fa-solid fa-leaf"
                                                            ></i>

                                                            ${ingredient}

                                                        </span>

                                                    `
                                                )
                                                .join("")
                                        }

                                    </div>


                                    ${createMarketplaceButtons(product)}

                                </div>

                            </div>

                        `;

                    }
                )
                .join("");

    }


    modal.innerHTML = `

        <div
            class="alternative-overlay"
            onclick="closeAlternatives()"
        ></div>


        <div class="alternative-box">


            <button
                class="alternative-close"
                onclick="closeAlternatives()"
            >

                <i class="fa-solid fa-xmark"></i>

            </button>


            <h2>

                <i class="fa-solid fa-shuffle"></i>

                Alternative Products

            </h2>


            <p class="alternative-subtitle">

                Alternatives to

                <strong>
                    ${selectedProduct.name}
                </strong>

                based on your skin concern.

            </p>


            <div class="alternative-grid">

                ${alternativeHTML}

            </div>


        </div>

    `;


    document.body.appendChild(
        modal
    );
}


// =====================================================
// CLOSE ALTERNATIVE PRODUCTS
// =====================================================

function closeAlternatives() {

    const modal =
        document.querySelector(
            ".alternative-modal"
        );


    if (modal) {

        modal.remove();

    }

}


// =====================================================
// BUDGET-BASED PRODUCT RECOMMENDATIONS
// =====================================================

function showBudgetRecommendations() {

    console.log(
        "Opening budget recommendations..."
    );


    const modal =
        document.createElement(
            "div"
        );


    modal.className =
        "budget-modal";


    modal.innerHTML = `

        <div
            class="budget-overlay"
            onclick="closeBudgetRecommendations()"
        ></div>


        <div class="budget-box">


            <button
                class="budget-close"
                onclick="closeBudgetRecommendations()"
            >

                <i class="fa-solid fa-xmark"></i>

            </button>


            <h2>

                <i class="fa-solid fa-wallet"></i>

                Budget-Based Recommendations

            </h2>


            <p>

                Enter your budget and AI will recommend
                suitable skincare products within your budget.

            </p>


            <div class="budget-input-area">

                <label>
                    Enter Your Budget
                </label>


                <div class="budget-input-wrapper">

                    <span>₹</span>

                    <input
                        type="number"
                        id="userBudget"
                        placeholder="Example: 1000"
                        min="1"
                    >

                </div>

            </div>


            <button
                class="find-budget-products-btn"
                onclick="findBudgetProducts()"
            >

                <i class="fa-solid fa-magnifying-glass"></i>

                Find Products

            </button>


            <div
                id="budgetResults"
                class="budget-results"
            ></div>


        </div>

    `;


    document.body.appendChild(
        modal
    );
}


// =====================================================
// FIND PRODUCTS WITHIN BUDGET
// =====================================================

function findBudgetProducts() {

    const budgetInput =
        document.getElementById(
            "userBudget"
        );


    const results =
        document.getElementById(
            "budgetResults"
        );


    const budget =
        Number(
            budgetInput.value
        );


    if (
        !budget ||
        budget <= 0
    ) {

        results.innerHTML = `

            <div class="budget-error">

                <i class="fa-solid fa-circle-exclamation"></i>

                <p>
                    Please enter a valid budget.
                </p>

            </div>

        `;

        return;
    }


    console.log(
        "User budget:",
        budget
    );


    const affordableProducts =
        products.filter(
            product =>
                product.price <= budget
        );


    console.log(
        "Affordable products:",
        affordableProducts
    );


    if (
        affordableProducts.length === 0
    ) {

        results.innerHTML = `

            <div class="budget-error">

                <i class="fa-solid fa-box-open"></i>

                <h3>
                    No Products Found
                </h3>

                <p>
                    No products are available
                    within ₹${budget}.
                </p>

                <p>
                    Try increasing your budget.
                </p>

            </div>

        `;

        return;
    }


    getLatestAssessment()
        .then(
            assessment => {

                const concern =
                    normalizeConcern(
                        assessment
                    );


                const budgetRecommendations =
                    affordableProducts.map(
                        product => {

                            const score =
                                calculateSuitability(
                                    product,
                                    concern
                                );


                            return {

                                ...product,

                                suitabilityScore:
                                    score

                            };

                        }
                    );


                budgetRecommendations.sort(
                    (a, b) =>
                        b.suitabilityScore -
                        a.suitabilityScore
                );


                console.log(
                    "Budget Recommendations:",
                    budgetRecommendations
                );


                results.innerHTML = `

                    <h3 class="budget-result-title">

                        AI Recommendations Within
                        ₹${budget}

                    </h3>


                    <div class="budget-product-grid">

                        ${
                            budgetRecommendations
                                .map(
                                    product => `

                                        <div
                                            class="budget-product-card"
                                        >

                                            <div
                                                class="budget-product-image"
                                            >

                                                <img
                                                    src="${product.image}"
                                                    alt="${product.name}"
                                                >

                                            </div>


                                            <div
                                                class="budget-product-content"
                                            >

                                                <span>
                                                    ${product.category}
                                                </span>


                                                <h4>
                                                    ${product.name}
                                                </h4>


                                                <div
                                                    class="budget-product-info"
                                                >

                                                    <strong>
                                                        ₹${product.price}
                                                    </strong>


                                                    <strong>
                                                        ${product.suitabilityScore}%
                                                        Match
                                                    </strong>

                                                </div>


                                                ${createMarketplaceButtons(product)}

                                            </div>

                                        </div>

                                    `
                                )
                                .join("")
                        }

                    </div>

                `;

            }
        )

        .catch(
            error => {

                console.error(
                    "Budget recommendation error:",
                    error
                );


                results.innerHTML = `

                    <div class="budget-error">

                        <i class="fa-solid fa-circle-exclamation"></i>

                        <p>
                            Unable to generate recommendations.
                        </p>

                    </div>

                `;

            }
        );

}


// =====================================================
// CLOSE BUDGET RECOMMENDATIONS
// =====================================================

function closeBudgetRecommendations() {

    const modal =
        document.querySelector(
            ".budget-modal"
        );


    if (modal) {

        modal.remove();

    }

}


// =====================================================
// INLINE BUDGET FILTER
// =====================================================
// This works with the budget box that was added
// directly to products.html.

function applyBudgetFilter() {

    const budgetInput =
        document.getElementById(
            "budgetInput"
        );


    if (!budgetInput) {

        console.error(
            "budgetInput was not found."
        );

        return;
    }


    const budget =
        Number(
            budgetInput.value
        );


    if (
        !budget ||
        budget <= 0
    ) {

        alert(
            "Please enter a valid budget."
        );

        return;
    }


    getLatestAssessment()
        .then(
            assessment => {

                const concern =
                    normalizeConcern(
                        assessment
                    );


                const affordableProducts =
                    products

                        .filter(
                            product =>
                                product.price <= budget
                        )

                        .map(
                            product => ({

                                ...product,

                                suitabilityScore:
                                    calculateSuitability(
                                        product,
                                        concern
                                    ),

                                recommendationConcern:
                                    concern

                            })
                        )

                        .sort(
                            (a, b) =>
                                b.suitabilityScore -
                                a.suitabilityScore
                        );


                if (
                    affordableProducts.length === 0
                ) {

                    alert(
                        "No products found within your budget."
                    );

                    return;
                }


                displayProductRecommendations(
                    affordableProducts
                );


                console.log(
                    "Budget-filtered products:",
                    affordableProducts
                );

            }
        )

        .catch(
            error => {

                console.error(
                    "Budget recommendation error:",
                    error
                );


                alert(
                    "Unable to generate budget recommendations."
                );

            }
        );

}