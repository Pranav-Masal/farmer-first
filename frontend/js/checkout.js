document.addEventListener("DOMContentLoaded", () => {
requireLogin();

loadCheckoutCart();

const checkoutForm =
    document.getElementById("checkoutForm");

if (checkoutForm) {
    checkoutForm.addEventListener(
        "submit",
        handleCheckout
    );
}

});

/* =========================================================
LOAD CART FOR CHECKOUT
========================================================= */

async function loadCheckoutCart() {

const itemsContainer =
    document.getElementById(
        "checkoutItems"
    );

if (!itemsContainer) return;


itemsContainer.innerHTML = `
    <div class="checkout-loading">

        <div>
            <div class="loading-spinner"></div>

            <p>
                Loading order summary...
            </p>
        </div>

    </div>
`;


try {

    const cart =
        await apiRequest(
            "/orders/cart/"
        );

    const items =
        cart?.items || [];


    if (!items.length) {

        showEmptyCheckout();

        return;
    }


    renderCheckoutItems(items);

    updateCheckoutSummary(items);

} catch (error) {

    console.error(
        "Load checkout cart error:",
        error
    );


    itemsContainer.innerHTML = `

        <div class="checkout-empty">

            <div class="checkout-empty-icon">
                ⚠️
            </div>

            <h3>
                Unable To Load Cart
            </h3>

            <p>
                ${escapeHtml(
                    error.message ||
                    "Something went wrong while loading your cart."
                )}
            </p>

        </div>

    `;

    disablePlaceOrder();

}

}

/* =========================================================
RENDER CHECKOUT ITEMS
========================================================= */

function renderCheckoutItems(items) {

const container =
    document.getElementById(
        "checkoutItems"
    );

if (!container) return;


container.innerHTML =
    items
        .map(
            item =>
                createCheckoutItem(item)
        )
        .join("");

}

/* =========================================================
CREATE CHECKOUT ITEM
========================================================= */

function createCheckoutItem(item) {

const productName =
    escapeHtml(
        item.product_name ||
        "Product"
    );

const quantity =
    Number(
        item.quantity || 0
    );

const price =
    Number(
        item.price || 0
    );

const subtotal =
    Number(
        item.subtotal ||
        price * quantity
    );


return `

    <div class="checkout-item">

        <div class="checkout-item-image">
            🌾
        </div>


        <div class="checkout-item-info">

            <h4>
                ${productName}
            </h4>

            <span>
                ${quantity}
                × ₹${price.toFixed(2)}
            </span>

        </div>


        <div class="checkout-item-total">

            ₹${subtotal.toFixed(2)}

        </div>

    </div>

`;

}

/* =========================================================
UPDATE CHECKOUT SUMMARY
========================================================= */

function updateCheckoutSummary(items) {

const itemCountElement =
    document.getElementById(
        "checkoutItemCount"
    );

const totalElement =
    document.getElementById(
        "checkoutTotal"
    );


let totalItems = 0;
let totalAmount = 0;


items.forEach(item => {

    const quantity =
        Number(
            item.quantity || 0
        );

    const subtotal =
        Number(
            item.subtotal ||
            Number(item.price || 0) *
            quantity
        );


    totalItems += quantity;

    totalAmount += subtotal;
});


if (itemCountElement) {

    itemCountElement.textContent =
        totalItems;
}


if (totalElement) {

    totalElement.textContent =
        totalAmount.toFixed(2);
}

}

/* =========================================================
HANDLE CHECKOUT
========================================================= */

async function handleCheckout(event) {

event.preventDefault();


const addressInput =
    document.getElementById(
        "shippingAddress"
    );

const placeOrderButton =
    document.getElementById(
        "placeOrderBtn"
    );

const message =
    document.getElementById(
        "checkoutMessage"
    );


if (!addressInput) return;


const shippingAddress =
    addressInput.value.trim();


/* Address validation */

if (!shippingAddress) {

    showCheckoutMessage(
        "Please enter your complete delivery address.",
        "error"
    );

    addressInput.focus();

    return;
}


if (shippingAddress.length < 10) {

    showCheckoutMessage(
        "Please enter a more complete delivery address.",
        "error"
    );

    addressInput.focus();

    return;
}


/* Loading state */

if (placeOrderButton) {

    placeOrderButton.disabled = true;

    placeOrderButton.textContent =
        "Placing Order...";
}


showCheckoutMessage(
    "Processing your order...",
    ""
);


try {

    const result =
        await apiRequest(
            "/orders/checkout/",
            {
                method: "POST",

                body: JSON.stringify({
                    shipping_address:
                        shippingAddress
                })
            }
        );


    /*
        Backend response:

        {
            "message":
                "Order placed successfully.",
            "order": {
                "id": 1,
                ...
            }
        }
    */


    const orderId =
        result?.order?.id;


    showCheckoutMessage(
        result?.message ||
        "Order placed successfully!",
        "success"
    );


    /*
        Redirect to order details
    */

    if (orderId) {

        setTimeout(() => {

            window.location.href =
                `orders.html?id=${orderId}`;

        }, 900);

    } else {

        setTimeout(() => {

            window.location.href =
                "orders.html";

        }, 900);
    }


} catch (error) {

    console.error(
        "Checkout error:",
        error
    );


    showCheckoutMessage(
        error.message ||
        "Unable to place your order.",
        "error"
    );


    if (placeOrderButton) {

        placeOrderButton.disabled =
            false;

        placeOrderButton.textContent =
            "Place Order 🛒";
    }
}

}

/* =========================================================
EMPTY CHECKOUT
========================================================= */

function showEmptyCheckout() {

const itemsContainer =
    document.getElementById(
        "checkoutItems"
    );

if (!itemsContainer) return;


itemsContainer.innerHTML = `

    <div class="checkout-empty">

        <div class="checkout-empty-icon">
            🛒
        </div>

        <h3>
            Your Cart Is Empty
        </h3>

        <p>
            Add some fresh products before
            proceeding to checkout.
        </p>

        <a
            href="products.html"
            class="btn btn-primary"
        >
            Explore Marketplace →
        </a>

    </div>

`;


const itemCount =
    document.getElementById(
        "checkoutItemCount"
    );

const total =
    document.getElementById(
        "checkoutTotal"
    );


if (itemCount) {
    itemCount.textContent = "0";
}

if (total) {
    total.textContent = "0.00";
}


disablePlaceOrder();

}

/* =========================================================
DISABLE PLACE ORDER
========================================================= */

function disablePlaceOrder() {

const button =
    document.getElementById(
        "placeOrderBtn"
    );

if (!button) return;


button.disabled = true;

button.textContent =
    "Cart Is Empty";

}

/* =========================================================
CHECKOUT MESSAGE
========================================================= */

function showCheckoutMessage(
message,
type
) {

const element =
    document.getElementById(
        "checkoutMessage"
    );

if (!element) return;


element.textContent =
    message;


element.className =
    type
    ? `form-message ${type}`
    : "form-message";

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