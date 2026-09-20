
/* =========================================================
   FARMER FIRST — PRODUCTS PAGE
========================================================= */


/* =========================================================
   PAGE INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    requireLogin();

    loadProducts();

    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");

    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            loadProducts();
        });
    }

    if (searchInput) {
        searchInput.addEventListener("keydown", (event) => {

            if (event.key === "Enter") {
                loadProducts();
            }

        });
    }

});


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    const container = document.getElementById("productsContainer");
    const searchInput = document.getElementById("searchInput");
    const productCount = document.getElementById("productCount");
    const message = document.getElementById("productsMessage");

    if (!container) return;

    container.innerHTML = `
        <div class="loading">
            Loading fresh products...
        </div>
    `;

    if (message) {
        message.textContent = "";
        message.className = "form-message";
    }

    try {

        const search =
            searchInput?.value.trim() || "";

        let endpoint = "/products/";

        if (search) {
            endpoint += `?search=${encodeURIComponent(search)}`;
        }

        const data = await apiRequest(endpoint);

        const products =
            data?.results ||
            data ||
            [];

        if (productCount) {
            productCount.textContent =
                `${products.length} Product${products.length !== 1 ? "s" : ""}`;
        }

        if (!products.length) {

            container.innerHTML = `
                <div class="empty-state">

                    <div class="empty-state-icon">
                        🌱
                    </div>

                    <h3>
                        No Products Found
                    </h3>

                    <p>
                        We couldn't find any products matching your search.
                    </p>

                </div>
            `;

            return;
        }

        container.innerHTML =
            products.map(product =>
                createProductCard(product)
            ).join("");

    } catch (error) {

        console.error(
            "Load products error:",
            error
        );

        if (productCount) {
            productCount.textContent = "Products";
        }

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-state-icon">
                    ⚠️
                </div>

                <h3>
                    Unable To Load Products
                </h3>

                <p>
                    Please check your connection and try again.
                </p>

            </div>
        `;

        if (message) {

            message.textContent =
                error.message ||
                "Unable to load products.";

            message.className =
                "form-message error";
        }
    }
}


/* =========================================================
   CREATE PRODUCT CARD
========================================================= */

function createProductCard(product) {

    const imageUrl =
        getImageUrl(product.image);

    const category =
        product.category_name ||
        product.category ||
        "Agriculture";

    const farmer =
        product.farmer_name ||
        "Local Farmer";

    const description =
        product.description ||
        "Fresh agricultural product from a local farmer.";

    const quantity =
        Number(product.quantity || 0);

    const isAvailable =
        product.is_available !== false &&
        quantity > 0;

    const availabilityText =
        isAvailable
            ? "Available"
            : "Out of Stock";

    const price =
        Number(product.price || 0)
            .toFixed(2);

    const productName =
        escapeHtml(product.name || "Product");

    return `

        <article class="product-card">

            <!-- PRODUCT IMAGE -->

            <div
                class="product-image-wrapper
                ${imageUrl ? "" : "no-image"}"
            >

                ${
                    imageUrl

                    ? `
                        <img
                            src="${escapeHtml(imageUrl)}"
                            alt="${productName}"
                            loading="lazy"
                            onerror="this.parentElement.classList.add('no-image'); this.remove();"
                        >
                    `

                    : `
                        <span>
                            🌾
                        </span>
                    `
                }


                <!-- CATEGORY -->

                <span class="product-category">
                    ${escapeHtml(category)}
                </span>


                <!-- AVAILABILITY -->

                <span
                    class="product-availability
                    ${isAvailable ? "" : "out-of-stock"}"
                >
                    ${availabilityText}
                </span>

            </div>


            <!-- PRODUCT CONTENT -->

            <div class="product-content">

                <h3>
                    ${productName}
                </h3>


                <p class="product-description">
                    ${escapeHtml(description)}
                </p>


                <!-- PRODUCT META -->

                <div class="product-meta">

                    <div class="product-farmer">

                        <span>
                            👨‍🌾
                        </span>

                        <span>
                            Farmer:
                            <strong>
                                ${escapeHtml(farmer)}
                            </strong>
                        </span>

                    </div>


                    <div class="product-stock">

                        <span>
                            📦
                        </span>

                        <span>
                            Stock:
                            <strong>
                                ${quantity}
                            </strong>
                        </span>

                    </div>

                </div>


                <!-- PRICE -->

                <div class="product-price">

                    <span class="currency">
                        ₹
                    </span>

                    <span class="amount">
                        ${price}
                    </span>

                    <span class="unit">
                        / unit
                    </span>

                </div>


                <!-- DETAILS BUTTON -->

                ${
                    isAvailable

                    ? `
                        <a
                            href="product-details.html?id=${encodeURIComponent(product.id)}"
                            class="btn btn-primary"
                        >
                            View Details →
                        </a>
                    `

                    : `
                        <button
                            class="btn btn-secondary"
                            type="button"
                            disabled
                        >
                            Currently Unavailable
                        </button>
                    `
                }

            </div>

        </article>

    `;
}


/* =========================================================
   IMAGE URL
========================================================= */

function getImageUrl(imagePath) {

    if (!imagePath) {
        return "";
    }

    if (
        imagePath.startsWith("http://") ||
        imagePath.startsWith("https://")
    ) {
        return imagePath;
    }

    return `http://127.0.0.1:8000${imagePath}`;
}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

