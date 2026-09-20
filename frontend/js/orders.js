document.addEventListener("DOMContentLoaded", async () => {

    const loggedIn = await requireLogin();

    if (!loggedIn) {
        return;
    }

    const urlParams =
        new URLSearchParams(window.location.search);

    const orderId =
        urlParams.get("id");

    loadNotificationCount();

    if (orderId) {

        loadOrderDetails(orderId);

    } else {

        loadOrders();
    }
});


/* =========================================
   LOAD ORDERS
========================================= */

async function loadOrders() {

    const loading =
        document.getElementById("ordersLoading");

    const container =
        document.getElementById("ordersContainer");

    const empty =
        document.getElementById("ordersEmpty");

    const message =
        document.getElementById("ordersMessage");


    try {

        loading.style.display = "flex";
        container.style.display = "none";
        empty.style.display = "none";
        message.style.display = "none";


        const data =
            await apiRequest("/orders/");


        loading.style.display = "none";


        const orders =
            Array.isArray(data)
                ? data
                : data?.results || [];


        if (!orders.length) {

            empty.style.display = "flex";

            return;
        }


        container.style.display = "grid";


        container.innerHTML =
            orders
                .map(order => createOrderCard(order))
                .join("");


    } catch (error) {

        console.error(
            "Orders loading error:",
            error
        );


        loading.style.display = "none";


        message.textContent =
            error.message ||
            "Unable to load orders.";

        message.className =
            "orders-message error";

        message.style.display =
            "block";
    }
}


/* =========================================
   LOAD SINGLE ORDER
========================================= */

async function loadOrderDetails(orderId) {

    const loading =
        document.getElementById("ordersLoading");

    const container =
        document.getElementById("ordersContainer");

    const empty =
        document.getElementById("ordersEmpty");

    const message =
        document.getElementById("ordersMessage");


    try {

        loading.style.display = "flex";
        container.style.display = "none";
        empty.style.display = "none";
        message.style.display = "none";


        const order =
            await apiRequest(
                `/orders/${orderId}/`
            );


        loading.style.display = "none";

        container.style.display = "block";


        container.innerHTML =
            createOrderDetails(order);


    } catch (error) {

        console.error(
            "Order details error:",
            error
        );


        loading.style.display = "none";


        if (error.status === 403) {

            showOrderError(
                "You do not have permission to view this order."
            );

            return;
        }


        if (error.status === 404) {

            showOrderError(
                "Order not found."
            );

            return;
        }


        showOrderError(
            error.message ||
            "Unable to load order details."
        );
    }
}


/* =========================================
   ORDER CARD
========================================= */

function createOrderCard(order) {

    const status =
        order.status || "Pending";


    const statusClass =
        getStatusClass(status);


    const itemCount =
        order.items
            ? order.items.reduce(
                (total, item) =>
                    total +
                    Number(item.quantity || 0),
                0
            )
            : 0;


    const orderDate =
        order.created_at
            ? formatOrderDate(
                order.created_at
            )
            : "Date unavailable";


    const total =
        formatCurrency(
            order.total_amount
        );


    return `
        <article class="order-card">

            <div class="order-card-header">

                <div>

                    <span class="order-label">
                        Order #${order.id}
                    </span>

                    <h2>
                        Order #${order.id}
                    </h2>

                </div>

                <span class="status-badge ${statusClass}">
                    ${escapeHtml(status)}
                </span>

            </div>


            <div class="order-card-info">

                <div class="order-info-item">

                    <span class="info-label">
                        Date
                    </span>

                    <strong>
                        ${orderDate}
                    </strong>

                </div>


                <div class="order-info-item">

                    <span class="info-label">
                        Items
                    </span>

                    <strong>
                        ${itemCount}
                    </strong>

                </div>


                <div class="order-info-item">

                    <span class="info-label">
                        Total
                    </span>

                    <strong>
                        ${total}
                    </strong>

                </div>

            </div>


            <div class="order-card-footer">

                <span class="order-status-text">
                    ${getStatusMessage(status)}
                </span>


                <button
                    type="button"
                    class="btn btn-primary btn-small"
                    onclick="viewOrderDetails(${order.id})">

                    View Details →

                </button>

            </div>

        </article>
    `;
}


/* =========================================
   ORDER DETAILS UI
========================================= */

function createOrderDetails(order) {

    const status =
        order.status || "Pending";


    const statusClass =
        getStatusClass(status);


    const orderDate =
        order.created_at
            ? formatOrderDate(
                order.created_at
            )
            : "Date unavailable";


    const items =
        order.items || [];


    const itemsHTML =
        items.length
            ? items
                .map(item => {

                    const subtotal =
                        item.subtotal ??
                        (
                            Number(item.price || 0) *
                            Number(item.quantity || 0)
                        );


                    return `
                        <div class="order-detail-item">

                            <div>

                                <h3>
                                    ${escapeHtml(
                                        item.product_name ||
                                        "Product"
                                    )}
                                </h3>

                                <p>
                                    Farmer:
                                    ${escapeHtml(
                                        item.farmer_name ||
                                        "Farmer"
                                    )}
                                </p>

                            </div>


                            <div class="order-item-meta">

                                <span>
                                    Qty:
                                    ${item.quantity}
                                </span>

                                <strong>
                                    ${formatCurrency(
                                        subtotal
                                    )}
                                </strong>

                            </div>

                        </div>
                    `;

                })
                .join("")
            : `
                <div class="empty-order-items">
                    No items found.
                </div>
            `;


    return `
        <section class="order-details-page">

            <div class="order-details-top">

                <button
                    type="button"
                    class="btn btn-secondary btn-small"
                    onclick="goBackToOrders()">

                    ← Back to Orders

                </button>

            </div>


            <div class="order-details-header">

                <div>

                    <span class="order-label">
                        Order #${order.id}
                    </span>

                    <h1>
                        Order Details
                    </h1>

                    <p>
                        Placed on ${orderDate}
                    </p>

                </div>


                <span
                    class="status-badge ${statusClass}">

                    ${escapeHtml(status)}

                </span>

            </div>


            <div class="order-details-grid">


                <!-- ITEMS -->

                <div class="order-details-main">

                    <div class="order-details-card">

                        <h2>
                            Order Items
                        </h2>

                        <div class="order-detail-items">

                            ${itemsHTML}

                        </div>

                    </div>


                    <!-- SHIPPING -->

                    <div class="order-details-card">

                        <h2>
                            Shipping Address
                        </h2>

                        <p class="shipping-address">

                            ${escapeHtml(
                                order.shipping_address ||
                                "Address not available"
                            )}

                        </p>

                    </div>

                </div>


                <!-- SUMMARY -->

                <aside class="order-details-sidebar">

                    <div class="order-details-card">

                        <h2>
                            Order Summary
                        </h2>


                        <div class="summary-row">

                            <span>
                                Order ID
                            </span>

                            <strong>
                                #${order.id}
                            </strong>

                        </div>


                        <div class="summary-row">

                            <span>
                                Status
                            </span>

                            <strong>
                                ${escapeHtml(status)}
                            </strong>

                        </div>


                        <div class="summary-row">

                            <span>
                                Items
                            </span>

                            <strong>
                                ${items.length}
                            </strong>

                        </div>


                        <div class="summary-divider"></div>


                        <div class="summary-total">

                            <span>
                                Total
                            </span>

                            <strong>
                                ${formatCurrency(
                                    order.total_amount
                                )}
                            </strong>

                        </div>

                    </div>


                    <div class="order-details-card">

                        <h2>
                            Status
                        </h2>

                        <p class="order-status-description">

                            ${getStatusMessage(status)}

                        </p>

                    </div>

                </aside>

            </div>

        </section>
    `;
}


/* =========================================
   VIEW DETAILS
========================================= */

function viewOrderDetails(orderId) {

    window.location.href =
        `orders.html?id=${orderId}`;
}


/* =========================================
   BACK TO ORDERS
========================================= */

function goBackToOrders() {

    window.location.href =
        "orders.html";
}


/* =========================================
   ERROR
========================================= */

function showOrderError(text) {

    const message =
        document.getElementById(
            "ordersMessage"
        );


    message.textContent =
        text;

    message.className =
        "orders-message error";

    message.style.display =
        "block";
}


/* =========================================
   STATUS CLASS
========================================= */

function getStatusClass(status) {

    switch (status) {

        case "Pending":
            return "status-pending";

        case "Accepted":
            return "status-accepted";

        case "Rejected":
            return "status-rejected";

        case "Processing":
            return "status-processing";

        case "Shipped":
            return "status-shipped";

        case "Delivered":
            return "status-delivered";

        case "Cancelled":
            return "status-cancelled";

        default:
            return "status-pending";
    }
}


/* =========================================
   STATUS MESSAGE
========================================= */

function getStatusMessage(status) {

    switch (status) {

        case "Pending":
            return "Waiting for farmer confirmation.";

        case "Accepted":
            return "Order accepted by farmer.";

        case "Rejected":
            return "Order was rejected by farmer.";

        case "Processing":
            return "Your order is being prepared.";

        case "Shipped":
            return "Your order has been shipped.";

        case "Delivered":
            return "Your order has been delivered.";

        case "Cancelled":
            return "This order has been cancelled.";

        default:
            return "Order status updated.";
    }
}


/* =========================================
   NOTIFICATION COUNT
========================================= */

async function loadNotificationCount() {

    try {

        const data =
            await getNotificationsCount();


        const badge =
            document.getElementById(
                "notificationBadge"
            );


        if (!badge) {
            return;
        }


        const count =
            Number(
                data?.unread_count ??
                data?.count ??
                0
            );


        if (count > 0) {

            badge.textContent =
                count > 99
                    ? "99+"
                    : count;

            badge.style.display =
                "inline-flex";

        } else {

            badge.style.display =
                "none";
        }


    } catch (error) {

        console.error(
            "Notification count error:",
            error
        );
    }
}


/* =========================================
   DATE
========================================= */

function formatOrderDate(dateString) {

    const date =
        new Date(dateString);


    if (Number.isNaN(
        date.getTime()
    )) {

        return "Date unavailable";
    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* =========================================
   CURRENCY
========================================= */

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }
    ).format(
        Number(amount || 0)
    );
}


/* =========================================
   HTML SECURITY
========================================= */

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}