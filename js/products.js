// =========================================================
// AI PRODUCT RECOMMENDATIONS + PRODUCT COMPARISON
// =========================================================

let recommendedProducts = [];
let selectedProducts = [];


// =========================================================
// LOAD PRODUCTS
// =========================================================

async function loadProducts() {

    const container = document.getElementById("productContainer");

    if (!container) {
        console.error("productContainer not found");
        return;
    }

    const token = localStorage.getItem("token");

    if (!token) {

        container.innerHTML = `
            <div class="no-products">
                <h3>Login Required</h3>
                <p>Please login to view your personalized products.</p>
            </div>
        `;

        return;
    }


    container.innerHTML = `
        <div class="products-loading">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <p>Analyzing your latest skin assessment...</p>
        </div>
    `;

    try {
        const baseUrl = (typeof window.APP_CONFIG !== "undefined" && window.APP_CONFIG.API_BASE_URL) ? window.APP_CONFIG.API_BASE_URL : "http://127.0.0.1:8000";

        const response = await fetch(
            `${baseUrl}/products/recommended`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );


        if (!response.ok) {

            const errorData =
                await response.json().catch(() => ({}));

            throw new Error(
                errorData.detail ||
                "Unable to load AI product recommendations."
            );
        }


        const data = await response.json();


        console.log(
            "AI Product Recommendation Response:",
            data
        );


        if (
            !data.products ||
            data.products.length === 0
        ) {

            container.innerHTML = `
                <div class="no-products">

                    <i class="fa-solid fa-box-open"></i>

                    <h3>
                        No matching products found
                    </h3>

                    <p>
                        Complete another skin assessment
                        to receive personalized recommendations.
                    </p>

                </div>
            `;

            return;
        }


        // =====================================================
        // SAVE PRODUCTS FOR COMPARISON
        // =====================================================

        recommendedProducts = data.products;

        selectedProducts = [];

        updateSkinProfile(data.skin_profile);


        // =====================================================
        // CREATE COMPARE BAR
        // =====================================================

        createCompareBar();


        container.innerHTML = "";


        // =====================================================
        // DISPLAY PRODUCTS
        // =====================================================

        data.products.forEach((product, index) => {

            const image =
                getProductImage(
                    product.category,
                    product.name
                );


            const matchScore =
                product.match_score || 0;


            const reason =
                product.ai_reason ||
                "Recommended based on your latest AI skin assessment.";


            const price =
                product.price ||
                getProductPrice(product.name);


            const description =
                product.description ||
                "Personalized skincare product selected using your latest AI skin assessment.";


            container.innerHTML += `

                <article
                    class="professional-product-card"
                    data-product-index="${index}"
                >

                    <!-- PRODUCT IMAGE -->

                    <div class="product-image-area">

                        <div class="product-category">

                            ${escapeHtml(
                                product.category ||
                                "SKINCARE"
                            )}

                        </div>


                        <img
                            src="${escapeHtml(image)}"
                            alt="${escapeHtml(product.name)}"
                            class="real-product-image"
                            onerror="handleProductImageError(this)"
                        >


                        <!-- MATCH -->

                        <div class="match-badge">

                            <i class="fa-solid fa-check"></i>

                            ${matchScore}% Match

                        </div>


                        <!-- COMPARE CHECKBOX -->

                        <label class="compare-check">

                            <input
                                type="checkbox"
                                class="compare-product-checkbox"
                                data-index="${index}"
                                onchange="toggleProductComparison(${index}, this)"
                            >

                            <span>
                                Compare
                            </span>

                        </label>

                    </div>


                    <!-- PRODUCT CONTENT -->

                    <div class="product-content">


                        <span class="product-type">

                            ${escapeHtml(
                                product.category ||
                                "SKINCARE"
                            )}

                        </span>


                        <h3>

                            ${escapeHtml(
                                product.name
                            )}

                        </h3>


                        <p class="product-description">

                            ${escapeHtml(
                                description
                            )}

                        </p>


                        <!-- BENEFITS -->

                        <div class="product-benefits">

                            <span>

                                <i class="fa-solid fa-check"></i>

                                AI Matched

                            </span>


                            <span>

                                <i class="fa-solid fa-check"></i>

                                Personalized

                            </span>


                            <span>

                                <i class="fa-solid fa-check"></i>

                                Current Assessment

                            </span>

                        </div>


                        <!-- AI REASON -->

                        <div class="ai-reason">

                            <i class="fa-solid fa-brain"></i>

                            <div>

                                <strong>
                                    Why AI recommends this
                                </strong>

                                <p>

                                    ${escapeHtml(reason)}

                                </p>

                            </div>

                        </div>


                        <!-- PRICE -->

                        <div class="product-price-box">

                            <span>
                                Price
                            </span>

                            <strong>
                                ₹${escapeHtml(price)}
                            </strong>

                        </div>


                        <!-- FOOTER -->

                        <div class="product-footer">

                            <div>

                                <small>
                                    AI Match Score
                                </small>

                                <strong>
                                    ${matchScore}%
                                </strong>

                            </div>


                            <button
                                class="product-btn"
                                type="button"

                                onclick="viewProduct(
                                    '${escapeJs(product.name)}',
                                    '${escapeJs(price)}',
                                    '${escapeJs(image)}',
                                    '${escapeJs(description)}',
                                    '${escapeJs(product.buy_url || "")}'
                                )"
                            >

                                Buy Now

                                <i class="fa-solid fa-cart-shopping"></i>

                            </button>

                        </div>

                    </div>

                </article>
            `;

        });


    } catch (error) {

        console.error(
            "Product recommendation error:",
            error
        );


        container.innerHTML = `

            <div class="no-products">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>
                    Unable to load recommendations
                </h3>

                <p>
                    ${escapeHtml(error.message)}
                </p>

            </div>

        `;
    }
}


// =========================================================
// CREATE COMPARE BAR
// =========================================================

function createCompareBar() {

    const oldBar =
        document.getElementById("compareBar");

    if (oldBar) {
        oldBar.remove();
    }


    const bar =
        document.createElement("div");

    bar.id = "compareBar";

    bar.innerHTML = `

        <div class="compare-bar-left">

            <i class="fa-solid fa-scale-balanced"></i>

            <span>

                <strong id="compareCount">
                    0
                </strong>

                products selected

            </span>

        </div>


        <div class="compare-bar-buttons">

            <button
                type="button"
                id="clearCompareBtn"
                onclick="clearProductComparison()"
            >

                Clear

            </button>


            <button
                type="button"
                id="compareSelectedBtn"
                onclick="compareSelectedProducts()"
                disabled
            >

                <i class="fa-solid fa-code-compare"></i>

                Compare Selected

            </button>

        </div>

    `;


    document.body.appendChild(bar);
}


// =========================================================
// SELECT / UNSELECT PRODUCT
// =========================================================

function toggleProductComparison(index, checkbox) {

    const product =
        recommendedProducts[index];


    if (!product) {
        return;
    }


    if (checkbox.checked) {

        if (selectedProducts.length >= 4) {

            checkbox.checked = false;

            alert(
                "You can compare a maximum of 4 products."
            );

            return;
        }


        if (!selectedProducts.includes(index)) {

            selectedProducts.push(index);

        }

    } else {

        selectedProducts =
            selectedProducts.filter(
                item => item !== index
            );
    }


    updateCompareBar();
}


// =========================================================
// UPDATE COMPARE BAR
// =========================================================

function updateCompareBar() {

    const count =
        document.getElementById("compareCount");

    const compareButton =
        document.getElementById(
            "compareSelectedBtn"
        );


    if (count) {

        count.textContent =
            selectedProducts.length;

    }


    if (compareButton) {

        compareButton.disabled =
            selectedProducts.length < 2;

    }
}


// =========================================================
// CLEAR COMPARISON
// =========================================================

function clearProductComparison() {

    selectedProducts = [];


    document
        .querySelectorAll(
            ".compare-product-checkbox"
        )
        .forEach(checkbox => {

            checkbox.checked = false;

        });


    updateCompareBar();
}


// =========================================================
// COMPARE SELECTED PRODUCTS
// =========================================================

function compareSelectedProducts() {

    if (selectedProducts.length < 2) {

        alert(
            "Please select at least 2 products to compare."
        );

        return;
    }


    const productsToCompare =
        selectedProducts.map(
            index =>
                recommendedProducts[index]
        );


    openComparisonModal(
        productsToCompare
    );
}


// =========================================================
// OPEN COMPARISON MODAL
// =========================================================

function openComparisonModal(products) {

    const oldModal =
        document.getElementById(
            "productComparisonModal"
        );


    if (oldModal) {
        oldModal.remove();
    }


    const modal =
        document.createElement("div");


    modal.id =
        "productComparisonModal";


    modal.className =
        "product-comparison-modal";


    let productColumns = "";


    products.forEach(product => {

        const image =
            getProductImage(
                product.category,
                product.name
            );


        const matchScore =
            product.match_score || 0;


        const price =
            product.price ||
            getProductPrice(product.name);


        const description =
            product.description ||
            "Personalized skincare product.";


        const reason =
            product.ai_reason ||
            "Recommended based on your AI skin assessment.";


        productColumns += `

            <div class="comparison-product">

                <img
                    src="${escapeHtml(image)}"
                    alt="${escapeHtml(product.name)}"
                >


                <h3>

                    ${escapeHtml(
                        product.name
                    )}

                </h3>


                <div class="comparison-match">

                    ${matchScore}%

                    <span>
                        Match
                    </span>

                </div>


                <div class="comparison-row">

                    <span>
                        Category
                    </span>

                    <strong>
                        ${escapeHtml(
                            product.category ||
                            "Skincare"
                        )}
                    </strong>

                </div>


                <div class="comparison-row">

                    <span>
                        Price
                    </span>

                    <strong>
                        ₹${escapeHtml(price)}
                    </strong>

                </div>


                <div class="comparison-row">

                    <span>
                        Description
                    </span>

                    <strong>
                        ${escapeHtml(description)}
                    </strong>

                </div>


                <div class="comparison-reason">

                    <i class="fa-solid fa-brain"></i>

                    <span>

                        ${escapeHtml(reason)}

                    </span>

                </div>


                <button
                    class="comparison-buy-btn"
                    onclick="buyProduct(
                        '${escapeJs(product.name)}',
                        '${escapeJs(price)}',
                        '${escapeJs(product.buy_url || "")}'
                    )"
                >

                    <i class="fa-solid fa-cart-shopping"></i>

                    Buy Now

                </button>

            </div>

        `;

    });


    modal.innerHTML = `

        <div
            class="comparison-overlay"
            onclick="closeComparisonModal()"
        ></div>


        <div class="comparison-box">


            <div class="comparison-header">

                <div>

                    <h2>

                        <i class="fa-solid fa-scale-balanced"></i>

                        Compare Products

                    </h2>

                    <p>
                        Compare your AI-recommended skincare products
                    </p>

                </div>


                <button
                    class="comparison-close"
                    onclick="closeComparisonModal()"
                >

                    <i class="fa-solid fa-xmark"></i>

                </button>

            </div>


            <div class="comparison-products">

                ${productColumns}

            </div>


            <div class="comparison-footer">

                <p>

                    <i class="fa-solid fa-circle-info"></i>

                    Match percentages are calculated from your
                    latest AI skin assessment.

                </p>


                <button
                    onclick="closeComparisonModal()"
                    class="comparison-done-btn"
                >

                    Done

                </button>

            </div>

        </div>

    `;


    document.body.appendChild(modal);
}


// =========================================================
// CLOSE COMPARISON MODAL
// =========================================================

function closeComparisonModal() {

    const modal =
        document.getElementById(
            "productComparisonModal"
        );


    if (modal) {
        modal.remove();
    }
}


// =========================================================
// AI SKIN PROFILE
// =========================================================

function updateSkinProfile(profile) {

    if (!profile) {
        return;
    }


    const tags =
        document.querySelector(".skin-tags");


    if (tags) {

        tags.innerHTML = `

            <span>

                <i class="fa-solid fa-droplet"></i>

                ${escapeHtml(
                    profile.skin_type ||
                    "Unknown"
                )}

                Skin

            </span>


            <span>

                <i class="fa-solid fa-face-smile"></i>

                ${escapeHtml(
                    profile.acne_level ||
                    "Unknown"
                )}

                Acne

            </span>


            <span>

                <i class="fa-solid fa-sun"></i>

                ${escapeHtml(
                    profile.pigmentation ||
                    "Unknown"
                )}

                Pigmentation

            </span>


            <span>

                <i class="fa-solid fa-heart-pulse"></i>

                ${escapeHtml(
                    profile.hydration ||
                    "Unknown"
                )}

                Hydration

            </span>

        `;
    }


    const scoreElement =
        document.querySelector(
            ".ai-score-box strong"
        );


    if (
        scoreElement &&
        profile.skin_health_score !== null &&
        profile.skin_health_score !== undefined
    ) {

        scoreElement.textContent =
            profile.skin_health_score + "%";

    }
}


// =========================================================
// PRODUCT IMAGE
// =========================================================

function getProductImage(category, productName) {

    const type =
        String(category || "")
            .toLowerCase();


    const name =
        String(productName || "")
            .toLowerCase();


    if (
        name.includes("acne control") ||
        name.includes("acne treatment")
    ) {

        return "../images/acne-control.png.jpg";

    }


    if (
        name.includes("sensitive skin soothing") ||
        name.includes("sensitive moisturizer") ||
        name.includes("soothing moisturizer")
    ) {

        return "../images/sensitive-moisturizer.jpg.jpg";

    }


    if (
        name.includes("gentle foaming cleanser") ||
        type.includes("cleanser") ||
        type.includes("clean")
    ) {

        return "../images/cleanser.png";

    }


    if (
        name.includes("daily sunscreen") ||
        name.includes("spf 50") ||
        type.includes("sunscreen") ||
        type.includes("sun") ||
        type.includes("spf")
    ) {

        return "../images/sunscreen.png";

    }


    if (
        name.includes("vitamin c") ||
        name.includes("brightening") ||
        type.includes("serum")
    ) {

        return "../images/serum.png";

    }


    if (
        type.includes("treatment")
    ) {

        return "../images/acne-control.png.jpg";

    }


    if (
        type.includes("moist")
    ) {

        return "../images/moisturizer.png";

    }


    return "../images/serum.png";
}


// =========================================================
// IMAGE ERROR
// =========================================================

function handleProductImageError(image) {

    console.error(
        "Product image could not be loaded:",
        image.src
    );

    image.style.display = "none";
}


// =========================================================
// PRODUCT PRICE
// =========================================================

function getProductPrice(productName) {

    const name =
        String(productName || "")
            .toLowerCase();


    if (
        name.includes("gentle foaming cleanser")
    ) {

        return "499";

    }


    if (
        name.includes("daily sunscreen")
    ) {

        return "699";

    }


    if (
        name.includes("vitamin c")
    ) {

        return "799";

    }


    if (
        name.includes("acne control")
    ) {

        return "749";

    }


    if (
        name.includes("sensitive skin soothing")
    ) {

        return "649";

    }


    if (
        name.includes("hydrating barrier")
    ) {

        return "599";

    }


    return "499";
}


// =========================================================
// VIEW PRODUCT
// =========================================================

function viewProduct(
    productName,
    price,
    image,
    description,
    buyUrl
) {

    const oldModal =
        document.querySelector(
            ".product-details-modal"
        );


    if (oldModal) {
        oldModal.remove();
    }


    const modal =
        document.createElement("div");


    modal.className =
        "product-details-modal";


    modal.innerHTML = `

        <div
            class="product-modal-overlay"
            onclick="closeProductModal()"
        ></div>


        <div class="product-details-box">


            <button
                class="product-close-btn"
                type="button"
                onclick="closeProductModal()"
            >

                <i class="fa-solid fa-xmark"></i>

            </button>


            <img
                src="${escapeHtml(image)}"
                alt="${escapeHtml(productName)}"
                class="product-details-image"
                onerror="handleProductImageError(this)"
            >


            <span class="section-label">

                AI RECOMMENDED PRODUCT

            </span>


            <h2>

                ${escapeHtml(productName)}

            </h2>


            <p class="product-details-description">

                ${escapeHtml(description)}

            </p>


            <div class="product-details-match">

                <i class="fa-solid fa-check"></i>

                AI Personalized Recommendation

            </div>


            <div class="product-details-price">

                <span>
                    Price
                </span>

                <strong>
                    ₹${escapeHtml(price)}
                </strong>

            </div>


            <button
                class="buy-now-btn"
                type="button"

                onclick="buyProduct(
                    '${escapeJs(productName)}',
                    '${escapeJs(price)}',
                    '${escapeJs(buyUrl || "")}'
                )"
            >

                <i class="fa-solid fa-cart-shopping"></i>

                Buy Now

            </button>


            <p class="product-details-note">

                Recommended based on your AI skin assessment.

            </p>


        </div>

    `;


    document.body.appendChild(modal);
}


// =========================================================
// CLOSE PRODUCT POPUP
// =========================================================

function closeProductModal() {

    const modal =
        document.querySelector(
            ".product-details-modal"
        );


    if (modal) {
        modal.remove();
    }
}


// =========================================================
// BUY NOW
// =========================================================

function buyProduct(
    productName,
    price,
    buyUrl
) {

    if (
        buyUrl &&
        buyUrl.trim() !== ""
    ) {

        window.open(
            buyUrl,
            "_blank"
        );

        return;
    }


    const button =
        document.querySelector(
            ".buy-now-btn"
        );


    if (!button) {
        return;
    }


    button.innerHTML = `

        <i class="fa-solid fa-check"></i>

        Selected

    `;


    button.classList.add(
        "product-selected"
    );


    button.disabled = true;


    const note =
        document.querySelector(
            ".product-details-note"
        );


    if (note) {

        note.textContent =
            productName +
            " selected • ₹" +
            price;

    }
}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}


// =========================================================
// ESCAPE JAVASCRIPT
// =========================================================

function escapeJs(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(/\\/g, "\\\\")

        .replace(/'/g, "\\'")

        .replace(/"/g, '\\"')

        .replace(/\n/g, "\\n")

        .replace(/\r/g, "\\r");
}


// =========================================================
// LOGOUT
// =========================================================

function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("role");

    window.location.href =
        "login.html";
}


// =========================================================
// START
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    loadProducts
);