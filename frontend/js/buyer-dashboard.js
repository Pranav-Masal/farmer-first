document.addEventListener("DOMContentLoaded", () => {

    requireLogin();

    loadBuyerDashboard();

});


async function loadBuyerDashboard() {

    try {

        await loadBuyerProfile();

        await loadBuyerOrders();

        await loadBuyerCart();

        await loadBuyerNotifications();

    } catch (error) {

        console.error(
            "Buyer dashboard error:",
            error
        );

    }

}


/* =========================================
   BUYER PROFILE
========================================= */

async function loadBuyerProfile() {

    try {

        const profile =
            await getProfile();

        const buyerName =
            document.getElementById(
                "buyerName"
            );

        if (buyerName) {

            buyerName.textContent =
                profile.username ||
                profile.first_name ||
                "Buyer";

        }

    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

        const buyerName =
            document.getElementById(
                "buyerName"
            );

        if (buyerName) {

            buyerName.textContent =
                getUsername() || "Buyer";

        }

    }

}


/* =========================================
   ORDERS
========================================= */

async function loadBuyerOrders() {

    const recentOrders =
        document.getElementById(
            "recentOrders"
        );

    try {

        const data =
            await apiRequest(
                "/orders/"
            );

        const orders =
            data.results || data || [];

        updateOrderStats(orders);

        displayRecentOrders(
            orders
        );

    } catch (error) {

        console.error(
            "Orders loading error:",
            error
        );

        if (recentOrders) {

            recentOrders.innerHTML = `
                <div class="error-message">
                    <h3>
                        Unable to load orders
                    </h3>

                    <p>
                        ${escapeHtml(
                            error.message ||
                            "Something went wrong."
                        )}
                    </p>

                    <button
                        class="btn btn-primary"
                        onclick="loadBuyerOrders()"
                    >
                        Try Again
                    </button>
                </div>
            `;

        }

    }

}


function updateOrderStats(orders) {

    const totalOrders =
        document.getElementById(
            "totalOrders"
        );

    const totalSpent =
        document.getElementById(
            "totalSpent"
        );

    if (totalOrders) {

        totalOrders.textContent =
            orders.length;

    }

    let spent = 0;

    orders.forEach(order => {

        spent +=
            Number(
                order.total_amount || 0
            );

    });

    if (totalSpent) {

        totalSpent.textContent =
            `₹${spent.toFixed(2)}`;

    }

}


function displayRecentOrders(orders) {

    const recentOrders =
        document.getElementById(
            "recentOrders"
        );

    if (!recentOrders) {
        return;
    }

    if (
        !orders ||
        orders.length === 0
    ) {

        recentOrders.innerHTML = `
            <div class="empty-message">

                <div class="empty-icon">
                    📦
                </div>

                <h3>
                    No Orders Yet
                </h3>

                <p>
                    Start shopping from our marketplace.
                </p>

                <a
                    href="products.html"
                    class="btn btn-primary"
                >
                    Browse Products
                </a>

            </div>
        `;

        return;

    }


    const recent =
        orders.slice(0, 5);


    recentOrders.innerHTML = "";


    recent.forEach(order => {

        const orderCard =
            document.createElement(
                "div"
            );

        orderCard.className =
            "recent-order-card";


        const statusClass =
            getStatusClass(
                order.status
            );


        const orderDate =
            formatDate(
                order.created_at
            );


        orderCard.innerHTML = `

            <div class="recent-order-info">

                <div class="recent-order-title">

                    <h3>
                        Order #${order.id}
                    </h3>

                    <span
                        class="order-status ${statusClass}"
                    >
                        ${escapeHtml(
                            order.status
                        )}
                    </span>

                </div>

                <p>
                    ${orderDate}
                </p>

                <p>
                    ${
                        order.items
                            ? order.items.length
                            : 0
                    }
                    product(s)
                </p>

            </div>


            <div class="recent-order-total">

                <strong>
                    ₹${Number(
                        order.total_amount || 0
                    ).toFixed(2)}
                </strong>

                <a
                    href="orders.html?id=${order.id}"
                    class="btn btn-secondary"
                >
                    View Order
                </a>

            </div>

        `;


        recentOrders.appendChild(
            orderCard
        );

    });

}


/* =========================================
   CART
========================================= */

async function loadBuyerCart() {

    try {

        const cart =
            await apiRequest(
                "/orders/cart/"
            );

        const items =
            cart.items || [];

        let totalQuantity = 0;

        items.forEach(item => {

            totalQuantity +=
                Number(
                    item.quantity || 0
                );

        });


        const cartItems =
            document.getElementById(
                "cartItems"
            );

        if (cartItems) {

            cartItems.textContent =
                totalQuantity;

        }

    } catch (error) {

        console.error(
            "Cart loading error:",
            error
        );

    }

}


/* =========================================
   NOTIFICATIONS
========================================= */

async function loadBuyerNotifications() {

    try {

        const data =
            await getNotificationsCount();


        let count = 0;


        if (
            typeof data ===
            "number"
        ) {

            count = data;

        } else if (
            data &&
            data.unread_count !== undefined
        ) {

            count =
                Number(
                    data.unread_count
                );

        } else if (
            data &&
            data.count !== undefined
        ) {

            count =
                Number(
                    data.count
                );

        }


        const notificationCount =
            document.getElementById(
                "unreadNotifications"
            );

        const notificationBadge =
            document.getElementById(
                "notificationBadge"
            );


        if (notificationCount) {

            notificationCount.textContent =
                count;

        }


        if (notificationBadge) {

            notificationBadge.textContent =
                count;

            notificationBadge.style.display =
                count > 0
                    ? "inline-flex"
                    : "none";

        }

    } catch (error) {

        console.error(
            "Notification loading error:",
            error
        );

    }

}


/* =========================================
   STATUS CLASS
========================================= */

function getStatusClass(status) {

    if (!status) {
        return "";
    }

    return status
        .toLowerCase()
        .replace(/\s+/g, "-");

}


/* =========================================
   DATE FORMAT
========================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "Date unavailable";
    }

    const date =
        new Date(dateString);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Date unavailable";

    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================
   HTML ESCAPE
========================================= */

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