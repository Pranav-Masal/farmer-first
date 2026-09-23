document.addEventListener("DOMContentLoaded", () => {
requireLogin();

const urlParams = new URLSearchParams(
    window.location.search
);

const productId = urlParams.get("id");

if (!productId) {
    showProductError(
        "Product ID is missing.",
        "Please return to the marketplace and select a product."
    );
    return;
}

loadProduct(productId);

});

/* =========================================================
LOAD PRODUCT
========================================================= */

async function loadProduct(productId) {

const container = document.getElementById(
    "productDetails"
);

if (!container) return;

container.innerHTML = `
    <div class="product-details-loading">

        <div class="loading-spinner"></div>

        <p>
            Loading product details...
        </p>

    </div>
`;

try {

    const product = await apiRequest(
        `/products/${productId}/`
    );

    if (!product) {
        throw new Error(
            "Product could not be found."
        );
    }

    renderProduct(product);

} catch (error) {

    console.error(
        "Load product error:",
        error
    );

    showProductError(
        "Unable To Load Product",
        error.message ||
        "Something went wrong while loading this product."
    );
}

}

/* =========================================================
RENDER PRODUCT
========================================================= */

function renderProduct(product) {

const container = document.getElementById(
    "productDetails"
);

if (!container) return;

const imageUrl = getImageUrl(
    product.image
);

const productName = escapeHtml(
    product.name || "Product"
);

const category = escapeHtml(
    product.category_name ||
    product.category ||
    "Agriculture"
);

const farmer = escapeHtml(
    product.farmer_name ||
    "Local Farmer"
);

const description = escapeHtml(
    product.description ||
    "Fresh agricultural product directly from a local farmer."
);

const price = Number(
    product.price || 0
).toFixed(2);

const quantity = Number(
    product.quantity || 0
);

const isAvailable =
    product.is_available !== false &&
    quantity > 0;


container.innerHTML = `

    <!-- =========================
         PRODUCT IMAGE
    ========================== -->

    <div
        class="
            product-detail-image-wrapper
            ${imageUrl ? "" : "no-image"}
        "
    >

        ${
            imageUrl
            ? `
                <img
                    src="${escapeHtml(imageUrl)}"
                    alt="${productName}"
                    onerror="
                        this.parentElement.classList.add('no-image');
                        this.remove();
                    "
                >
            `
            : ""
        }

        <span class="product-detail-category">
            ${category}
        </span>

        <span
            class="
                product-detail-availability
                ${isAvailable ? "" : "out-of-stock"}
            "
        >
            ${
                isAvailable
                ? "✓ Available"
                : "Out of Stock"
            }
        </span>

    </div>


    <!-- =========================
         PRODUCT INFORMATION
    ========================== -->

    <div class="product-detail-info">

        <span class="product-detail-label">
            Fresh From Farmer
        </span>

        <h1>
            ${productName}
        </h1>

        <p class="product-detail-description">
            ${description}
        </p>


        <!-- PRICE -->

        <div class="product-detail-price">

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


        <!-- META -->

        <div class="product-detail-meta">

            <div class="product-meta-card">

                <span class="meta-icon">
                    📦
                </span>

                <span class="meta-label">
                    Available Stock
                </span>

                <span class="meta-value">
                    ${quantity} units
                </span>

            </div>


            <div class="product-meta-card">

                <span class="meta-icon">
                    🌱
                </span>

                <span class="meta-label">
                    Category
                </span>

                <span class="meta-value">
                    ${category}
                </span>

            </div>

        </div>


        <!-- FARMER -->

        <div class="product-farmer-card">

            <div class="product-farmer-avatar">
                👨‍🌾
            </div>

            <div class="product-farmer-info">

                <span>
                    Sold By
                </span>

                <strong>
                    ${farmer}
                </strong>

            </div>

        </div>


        ${
            isAvailable
            ? `

                <!-- STOCK -->

                <div class="product-stock-info">

                    <span>
                        📦
                    </span>

                    <span>
                        Available:
                        <strong>
                            ${quantity} units
                        </strong>
                    </span>

                </div>


                <!-- QUANTITY -->

                <div class="quantity-section">

                    <label for="quantity">
                        Select Quantity
                    </label>

                    <div class="quantity-control">

                        <button
                            type="button"
                            id="decreaseQuantity"
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>

                        <input
                            type="number"
                            id="quantity"
                            value="1"
                            min="1"
                            max="${quantity}"
                            aria-label="Product quantity"
                        >

                        <button
                            type="button"
                            id="increaseQuantity"
                            aria-label="Increase quantity"
                        >
                            +
                        </button>

                    </div>

                </div>


                <!-- ADD TO CART -->

                <div class="product-add-to-cart">

                    <button
                        type="button"
                        id="addToCartBtn"
                        class="btn btn-primary"
                    >
                        Add to Cart 🛒
                    </button>

                    <a
                        href="products.html"
                        class="btn btn-secondary"
                    >
                        Continue Shopping
                    </a>

                </div>

            `
            : `

                <div class="product-unavailable-message">

                    ⚠️ This product is currently
                    unavailable.

                    Please check back later or explore
                    other products from our farmers.

                </div>

                <div class="product-add-to-cart">

                    <a
                        href="products.html"
                        class="btn btn-secondary"
                    >
                        ← Back to Marketplace
                    </a>

                </div>

            `
        }

    </div>
`;


/* =====================================================
   QUANTITY CONTROLS
===================================================== */

if (isAvailable) {

    const quantityInput =
        document.getElementById(
            "quantity"
        );

    const decreaseButton =
        document.getElementById(
            "decreaseQuantity"
        );

    const increaseButton =
        document.getElementById(
            "increaseQuantity"
        );

    const addToCartButton =
        document.getElementById(
            "addToCartBtn"
        );


    /* Decrease */

    if (decreaseButton) {

        decreaseButton.addEventListener(
            "click",
            () => {

                let current =
                    parseInt(
                        quantityInput.value
                    ) || 1;

                if (current > 1) {

                    current--;

                    quantityInput.value =
                        current;
                }
            }
        );
    }


    /* Increase */

    if (increaseButton) {

        increaseButton.addEventListener(
            "click",
            () => {

                let current =
                    parseInt(
                        quantityInput.value
                    ) || 1;

                if (current < quantity) {

                    current++;

                    quantityInput.value =
                        current;
                }
            }
        );
    }


    /* Manual input */

    if (quantityInput) {

        quantityInput.addEventListener(
            "input",
            () => {

                let current =
                    parseInt(
                        quantityInput.value
                    );

                if (isNaN(current)) {

                    quantityInput.value = 1;

                    return;
                }

                if (current < 1) {

                    quantityInput.value = 1;

                } else if (current > quantity) {

                    quantityInput.value =
                        quantity;
                }
            }
        );
    }


    /* Add to Cart */

    if (addToCartButton) {

        addToCartButton.addEventListener(
            "click",
            () => {

                addProductToCart(
                    product
                );

            }
        );
    }
}

}

/* =========================================================
ADD PRODUCT TO CART
========================================================= */

async function addProductToCart(product) {

const quantityInput =
    document.getElementById(
        "quantity"
    );

const cartMessage =
    document.getElementById(
        "cartMessage"
    );

const addToCartBtn =
    document.getElementById(
        "addToCartBtn"
    );


if (!quantityInput) return;


const quantity =
    parseInt(
        quantityInput.value
    );


/* Validation */

if (
    !quantity ||
    quantity < 1 ||
    quantity > product.quantity
) {

    showCartMessage(
        "Please enter a valid quantity.",
        "error"
    );

    return;
}


/* Loading state */

if (addToCartBtn) {

    addToCartBtn.disabled = true;

    addToCartBtn.textContent =
        "Adding to Cart...";
}


showCartMessage(
    "Adding product to cart...",
    ""
);


try {

    const response =
        await apiRequest(
            "/orders/cart/add/",
            {
                method: "POST",

                body: JSON.stringify({
                    product: product.id,
                    quantity: quantity
                })
            }
        );


    showCartMessage(
        response?.message ||
        "Product added to cart successfully.",
        "success"
    );


    /* Redirect */

    setTimeout(() => {

        window.location.href =
            "cart.html";

    }, 900);


} catch (error) {

    console.error(
        "Add to cart error:",
        error
    );


    showCartMessage(
        error.message ||
        "Unable to add product to cart.",
        "error"
    );


    if (addToCartBtn) {

        addToCartBtn.disabled = false;

        addToCartBtn.textContent =
            "Add to Cart 🛒";
    }
}

}

/* =========================================================
PRODUCT ERROR
========================================================= */

function showProductError(
title,
message
) {

const container =
    document.getElementById(
        "productDetails"
    );

if (!container) return;


container.innerHTML = `

    <div class="product-details-error">

        <div class="error-icon">
            🌱
        </div>

        <h2>
            ${escapeHtml(title)}
        </h2>

        <p>
            ${escapeHtml(message)}
        </p>

        <a
            href="products.html"
            class="btn btn-primary"
        >
            ← Back to Marketplace
        </a>

    </div>

`;

}

/* =========================================================
CART MESSAGE
========================================================= */

function showCartMessage(
message,
type
) {

const element =
    document.getElementById(
        "cartMessage"
    );

if (!element) return;


element.textContent = message;

element.className =
    type
    ? `form-message ${type}`
    : "form-message";

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

return `https://farmer-first-backend.onrender.com${imagePath}`;

}

/* =========================================================
HTML ESCAPE
========================================================= */

function escapeHtml(value) {

if (
    value === null ||
    value === undefined
) {
    return "";
}

return String(value)
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