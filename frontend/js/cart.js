document.addEventListener("DOMContentLoaded", () => {
    requireLogin();
    loadCart();
});


// ========================================
// LOAD CART
// ========================================

async function loadCart() {
    const cartItemsContainer = document.getElementById("cartItems");
    const cartMessage = document.getElementById("cartMessage");

    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = `
        <div class="cart-loading">
            <div class="loading-spinner"></div>
            <p>Loading your cart...</p>
        </div>
    `;

    try {
        const cart = await apiRequest("/orders/cart/");

        const items = cart?.items || [];

        renderCart(items);
        updateCartSummary(items);

        if (cartMessage) {
            cartMessage.textContent = "";
            cartMessage.className = "form-message";
        }

    } catch (error) {

        console.error("Load cart error:", error);

        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">⚠️</div>

                <h2>Unable To Load Cart</h2>

                <p>
                    ${escapeHtml(
                        error.message ||
                        "Something went wrong while loading your cart."
                    )}
                </p>

                <button
                    type="button"
                    class="btn btn-primary"
                    onclick="loadCart()"
                >
                    Try Again
                </button>
            </div>
        `;
    }
}


// ========================================
// RENDER CART
// ========================================

function renderCart(items) {

    const container = document.getElementById("cartItems");

    if (!container) return;

    if (!items.length) {

        container.innerHTML = `
            <div class="cart-empty">

                <div class="cart-empty-icon">
                    🛒
                </div>

                <h2>Your Cart Is Empty</h2>

                <p>
                    You haven't added any products yet.
                    Explore fresh products directly from local farmers.
                </p>

                <a
                    href="products.html"
                    class="btn btn-primary"
                >
                    Explore Marketplace →
                </a>

            </div>
        `;

        return;
    }

    container.innerHTML = items
        .map(item => createCartItem(item))
        .join("");
}


// ========================================
// CREATE CART ITEM
// ========================================

function createCartItem(item) {

    const productName = escapeHtml(
        item.product_name || "Product"
    );

    const farmerName = escapeHtml(
        item.farmer_name || "Local Farmer"
    );

    const quantity = Number(
        item.quantity || 0
    );

    const price = Number(
        item.price || 0
    );

    const subtotal = Number(
        item.subtotal || price * quantity
    );

    return `
        <article
            class="cart-item"
            data-item-id="${item.id}"
        >

            <div class="cart-item-image">
                🌾
            </div>


            <div class="cart-item-info">

                <h3>
                    ${productName}
                </h3>

                <div class="cart-item-farmer">

                    <span>👨‍🌾</span>

                    <span>
                        Farmer:
                        <strong>
                            ${farmerName}
                        </strong>
                    </span>

                </div>


                <div class="cart-item-price">

                    ₹${price.toFixed(2)}

                    <span>
                        / unit
                    </span>

                </div>

            </div>


            <div class="cart-item-actions">

                <div class="cart-quantity-control">

                    <button
                        type="button"
                        onclick="changeQuantity(
                            ${item.id},
                            ${quantity - 1}
                        )"
                        ${quantity <= 1 ? "disabled" : ""}
                        aria-label="Decrease quantity"
                    >
                        −
                    </button>


                    <span class="cart-quantity-value">
                        ${quantity}
                    </span>


                    <button
                        type="button"
                        onclick="changeQuantity(
                            ${item.id},
                            ${quantity + 1}
                        )"
                        aria-label="Increase quantity"
                    >
                        +
                    </button>

                </div>


                <div class="cart-item-subtotal">

                    ₹${subtotal.toFixed(2)}

                </div>


                <button
                    type="button"
                    class="cart-remove-btn"
                    onclick="removeCartItem(${item.id})"
                >
                    Remove
                </button>

            </div>

        </article>
    `;
}


// ========================================
// CHANGE QUANTITY
// ========================================

async function changeQuantity(itemId, newQuantity) {

    if (newQuantity < 1) {
        return;
    }

    const message = document.getElementById(
        "cartMessage"
    );

    try {

        if (message) {

            message.textContent =
                "Updating cart...";

            message.className =
                "form-message";
        }


        await apiRequest(
            `/orders/cart/${itemId}/update/`,
            {
                method: "PATCH",

                body: JSON.stringify({
                    quantity: newQuantity
                })
            }
        );


        await loadCart();


        if (message) {

            message.textContent =
                "Cart updated successfully.";

            message.className =
                "form-message success";


            setTimeout(() => {

                message.textContent = "";

                message.className =
                    "form-message";

            }, 1800);
        }

    } catch (error) {

        console.error(
            "Update cart error:",
            error
        );


        if (message) {

            message.textContent =
                error.message ||
                "Unable to update cart.";

            message.className =
                "form-message error";
        }
    }
}


// ========================================
// REMOVE CART ITEM
// ========================================

async function removeCartItem(itemId) {

    const confirmed = window.confirm(
        "Remove this product from your cart?"
    );

    if (!confirmed) {
        return;
    }


    const message = document.getElementById(
        "cartMessage"
    );


    try {

        if (message) {

            message.textContent =
                "Removing product...";

            message.className =
                "form-message";
        }


        await apiRequest(
            `/orders/cart/${itemId}/remove/`,
            {
                method: "DELETE"
            }
        );


        await loadCart();


        if (message) {

            message.textContent =
                "Product removed from cart.";

            message.className =
                "form-message success";


            setTimeout(() => {

                message.textContent = "";

                message.className =
                    "form-message";

            }, 1800);
        }

    } catch (error) {

        console.error(
            "Remove cart item error:",
            error
        );


        if (message) {

            message.textContent =
                error.message ||
                "Unable to remove cart item.";

            message.className =
                "form-message error";
        }
    }
}


// ========================================
// CART SUMMARY
// ========================================

function updateCartSummary(items) {

    const itemCount =
        document.getElementById(
            "cartItemCount"
        );

    const cartTotal =
        document.getElementById(
            "cartTotal"
        );

    const grandTotal =
        document.getElementById(
            "cartGrandTotal"
        );

    const checkoutButton =
        document.getElementById(
            "checkoutBtn"
        );


    let totalItems = 0;

    let totalAmount = 0;


    items.forEach(item => {

        const quantity =
            Number(item.quantity || 0);

        const subtotal =
            Number(
                item.subtotal ||
                Number(item.price || 0) *
                quantity
            );


        totalItems += quantity;

        totalAmount += subtotal;

    });


    if (itemCount) {

        itemCount.textContent =
            totalItems;
    }


    if (cartTotal) {

        cartTotal.textContent =
            totalAmount.toFixed(2);
    }


    if (grandTotal) {

        grandTotal.textContent =
            totalAmount.toFixed(2);
    }


    // ========================================
    // CHECKOUT BUTTON
    // ========================================

    if (checkoutButton) {

        if (!items.length) {

            checkoutButton.disabled = true;

            checkoutButton.classList.add(
                "disabled"
            );

            checkoutButton.setAttribute(
                "aria-disabled",
                "true"
            );

        } else {

            checkoutButton.disabled = false;

            checkoutButton.classList.remove(
                "disabled"
            );

            checkoutButton.removeAttribute(
                "aria-disabled"
            );


            checkoutButton.onclick = function () {

                window.location.href =
                    "checkout.html";

            };
        }
    }
}


// ========================================
// ESCAPE HTML
// ========================================

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