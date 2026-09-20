
const urlParams =
    new URLSearchParams(
        window.location.search
    );

const orderId =
    urlParams.get("id");


/* =========================================
   PAGE ELEMENTS
========================================= */

const loadingElement =
    document.getElementById(
        "orderDetailsLoading"
    );

const containerElement =
    document.getElementById(
        "orderDetailsContainer"
    );

const messageElement =
    document.getElementById(
        "orderDetailsMessage"
    );

const orderIdElement =
    document.getElementById(
        "orderId"
    );

const orderStatusElement =
    document.getElementById(
        "orderStatus"
    );

const orderDateElement =
    document.getElementById(
        "orderDate"
    );

const orderItemCountElement =
    document.getElementById(
        "orderItemCount"
    );

const paymentStatusElement =
    document.getElementById(
        "paymentStatus"
    );

const orderItemsElement =
    document.getElementById(
        "orderItems"
    );

const shippingAddressElement =
    document.getElementById(
        "shippingAddress"
    );

const summaryItemCountElement =
    document.getElementById(
        "summaryItemCount"
    );

const orderSubtotalElement =
    document.getElementById(
        "orderSubtotal"
    );

const deliveryChargeElement =
    document.getElementById(
        "deliveryCharge"
    );

const orderGrandTotalElement =
    document.getElementById(
        "orderGrandTotal"
    );


/* =========================================
   SHOW MESSAGE
========================================= */

function showMessage(
    message,
    type = "error"
) {

    if (!messageElement) {
        return;
    }

    messageElement.textContent =
        message;

    messageElement.className =
        "form-message";

    if (type === "success") {

        messageElement.classList.add(
            "success"
        );

    } else {

        messageElement.classList.add(
            "error"
        );
    }

    messageElement.style.display =
        "block";
}


/* =========================================
   HIDE MESSAGE
========================================= */

function hideMessage() {

    if (!messageElement) {
        return;
    }

    messageElement.textContent =
        "";

    messageElement.style.display =
        "none";
}


/* =========================================
   SHOW LOADING
========================================= */

function showLoading() {

    if (loadingElement) {

        loadingElement.style.display =
            "flex";
    }

    if (containerElement) {

        containerElement.style.display =
            "none";
    }
}


/* =========================================
   HIDE LOADING
========================================= */

function hideLoading() {

    if (loadingElement) {

        loadingElement.style.display =
            "none";
    }

    if (containerElement) {

        containerElement.style.display =
            "flex";
    }
}


/* =========================================
   FORMAT CURRENCY
========================================= */

function formatCurrency(
    amount
) {

    const value =
        Number(amount || 0);

    return value.toLocaleString(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2
        }
    );
}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(
    dateValue
) {

    if (!dateValue) {

        return "--";
    }

    const date =
        new Date(dateValue);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateValue;
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
   GET STATUS CLASS
========================================= */

function getStatusClass(
    status
) {

    if (!status) {

        return "";
    }

    return String(status)
        .toLowerCase()
        .replace(
            /\s+/g,
            "-"
        );
}


/* =========================================
   DISPLAY ORDER STATUS
========================================= */

function displayOrderStatus(
    status
) {

    const currentStatus =
        status || "Pending";

    if (!orderStatusElement) {

        return;
    }

    orderStatusElement.textContent =
        currentStatus;

    orderStatusElement.className =
        "order-status";

    const statusClass =
        getStatusClass(
            currentStatus
        );

    if (statusClass) {

        orderStatusElement.classList.add(
            statusClass
        );
    }
}


/* =========================================
   GET PRODUCT NAME
========================================= */

function getProductName(
    item
) {

    return (
        item.product_name ||
        item.productName ||
        item.name ||
        item.product?.name ||
        "Product"
    );
}


/* =========================================
   GET PRODUCT IMAGE
========================================= */

function getProductImage(
    item
) {

    return (
        item.product_image ||
        item.productImage ||
        item.image ||
        item.product?.image ||
        ""
    );
}


/* =========================================
   GET QUANTITY
========================================= */

function getQuantity(
    item
) {

    return Number(
        item.quantity ||
        item.qty ||
        0
    );
}


/* =========================================
   GET PRICE
========================================= */

function getPrice(
    item
) {

    return Number(
        item.price ||
        item.product_price ||
        item.unit_price ||
        item.product?.price ||
        0
    );
}


/* =========================================
   FIX IMAGE URL
========================================= */

function getImageUrl(
    image
) {

    if (!image) {

        return "";
    }


    if (
        image.startsWith(
            "http://"
        ) ||
        image.startsWith(
            "https://"
        )
    ) {

        return image;
    }


    const API_BASE_URL =
        "http://127.0.0.1:8000";


    if (
        image.startsWith("/")
    ) {

        return (
            API_BASE_URL +
            image
        );
    }


    return (
        API_BASE_URL +
        "/" +
        image
    );
}


/* =========================================
   RENDER ORDER ITEMS
========================================= */

function renderOrderItems(
    items
) {

    if (!orderItemsElement) {

        return;
    }

    orderItemsElement.innerHTML =
        "";


    if (
        !items ||
        items.length === 0
    ) {

        orderItemsElement.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    📦
                </div>

                <h3>
                    No products found
                </h3>

                <p>
                    No products were found for this order.
                </p>

            </div>

        `;

        return;
    }


    items.forEach(
        item => {

            const productName =
                getProductName(item);

            const quantity =
                getQuantity(item);

            const price =
                getPrice(item);

            /*
                FIXED:
                getImageImage()
                →
                getProductImage()
            */

            const image =
                getProductImage(item);


            const itemTotal =
                price * quantity;


            const orderItem =
                document.createElement(
                    "div"
                );

            orderItem.className =
                "order-item";


            orderItem.innerHTML = `

                <div class="order-item-info">

                    ${
                        image
                        ?
                        `
                        <img
                            src="${getImageUrl(image)}"
                            alt="${productName}"
                            class="order-item-image"
                            onerror="this.style.display='none'"
                        >
                        `
                        :
                        `
                        <div class="order-item-image">
                            🥬
                        </div>
                        `
                    }


                    <div class="order-item-details">

                        <div class="order-item-name">

                            ${productName}

                        </div>


                        <div class="order-item-quantity">

                            Quantity:
                            ${quantity}

                        </div>

                    </div>

                </div>


                <div class="order-item-price">

                    ${formatCurrency(
                        itemTotal
                    )}

                </div>

            `;


            orderItemsElement.appendChild(
                orderItem
            );
        }
    );
}


/* =========================================
   CALCULATE SUBTOTAL
========================================= */

function calculateSubtotal(
    items
) {

    if (
        !items ||
        items.length === 0
    ) {

        return 0;
    }


    return items.reduce(
        (
            total,
            item
        ) => {

            const quantity =
                getQuantity(item);

            const price =
                getPrice(item);

            return (
                total +
                (
                    quantity *
                    price
                )
            );

        },
        0
    );
}


/* =========================================
   GET ITEMS FROM ORDER
========================================= */

function getOrderItems(
    order
) {

    return (
        order.items ||
        order.order_items ||
        order.orderItems ||
        []
    );
}


/* =========================================
   DISPLAY ORDER
========================================= */

function displayOrder(
    order
) {

    if (!order) {

        throw new Error(
            "Order data not found."
        );
    }


    /* Order ID */

    if (orderIdElement) {

        orderIdElement.textContent =
            "#" +
            (
                order.id ||
                order.order_id ||
                orderId
            );
    }


    /* Status */

    displayOrderStatus(
        order.status ||
        "Pending"
    );


    /* Date */

    if (orderDateElement) {

        orderDateElement.textContent =
            formatDate(
                order.created_at ||
                order.order_date ||
                order.date ||
                order.createdAt
            );
    }


    /* Items */

    const items =
        getOrderItems(order);


    const itemCount =
        items.reduce(
            (
                total,
                item
            ) =>
                total +
                getQuantity(item),
            0
        );


    if (orderItemCountElement) {

        orderItemCountElement.textContent =
            itemCount;
    }


    if (summaryItemCountElement) {

        summaryItemCountElement.textContent =
            itemCount;
    }


    /* Payment */

    if (paymentStatusElement) {

        paymentStatusElement.textContent =
            order.payment_status ||
            order.paymentStatus ||
            order.payment_method ||
            "Pending";
    }


    /* Shipping Address */

    if (shippingAddressElement) {

        shippingAddressElement.textContent =
            order.shipping_address ||
            order.shippingAddress ||
            order.address ||
            "Address not available";
    }


    /* Subtotal */

    const subtotal =
        Number(
            order.subtotal ||
            order.sub_total ||
            calculateSubtotal(items)
        );


    if (orderSubtotalElement) {

        orderSubtotalElement.textContent =
            formatCurrency(
                subtotal
            );
    }


    /* Delivery */

    const delivery =
        Number(
            order.delivery_charge ||
            order.deliveryCharge ||
            0
        );


    if (deliveryChargeElement) {

        deliveryChargeElement.textContent =
            delivery > 0
            ?
            formatCurrency(
                delivery
            )
            :
            "Free";
    }


    /* Grand Total */

    const grandTotal =
        Number(
            order.total_amount ||
            order.total ||
            order.grand_total ||
            subtotal + delivery
        );


    if (orderGrandTotalElement) {

        orderGrandTotalElement.textContent =
            formatCurrency(
                grandTotal
            );
    }


    /* Render Products */

    renderOrderItems(
        items
    );
}


/* =========================================
   FETCH ORDER DETAILS
========================================= */

async function loadOrderDetails() {

    showLoading();

    hideMessage();


    /* =====================================
       CHECK ORDER ID
    ===================================== */

    if (!orderId) {

        hideLoading();

        showMessage(
            "Order ID is missing. Please open the order from My Orders."
        );

        return;
    }


    /* =====================================
       CHECK TOKEN
    ===================================== */

    const token =
        localStorage.getItem(
            "access"
        );


    if (!token) {

        hideLoading();

        showMessage(
            "Please login to view your order."
        );

        return;
    }


    try {

        /* =================================
           GET ORDER
        ================================= */

        const response =
            await fetch(
                `http://127.0.0.1:8000/api/orders/${orderId}/`,
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


        /* =================================
           UNAUTHORIZED
        ================================= */

        if (
            response.status === 401
        ) {

            hideLoading();

            showMessage(
                "Your login session is no longer valid. Please login again."
            );

            return;
        }


        /* =================================
           FORBIDDEN
        ================================= */

        if (
            response.status === 403
        ) {

            hideLoading();

            showMessage(
                "You do not have permission to view this order."
            );

            return;
        }


        /* =================================
           NOT FOUND
        ================================= */

        if (
            response.status === 404
        ) {

            hideLoading();

            showMessage(
                "Order not found."
            );

            return;
        }


        /* =================================
           OTHER ERROR
        ================================= */

        if (!response.ok) {

            const errorData =
                await response
                    .json()
                    .catch(
                        () => ({})
                    );


            throw new Error(
                errorData.detail ||
                "Failed to load order details."
            );
        }


        /* =================================
           GET JSON
        ================================= */

        const data =
            await response.json();


        /*
            Some APIs return:

            {
                order: {...}
            }

            Others return:

            {...}
        */

        const order =
            data.order ||
            data.data ||
            data;


        displayOrder(
            order
        );


        hideLoading();


    } catch (error) {

        console.error(
            "Order Details Error:",
            error
        );

        hideLoading();

        showMessage(
            error.message ||
            "Something went wrong while loading the order."
        );
    }
}


/* =========================================
   PAGE START
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
            Check login only if the function
            exists.
        */

        if (
            typeof requireLogin ===
            "function"
        ) {

            requireLogin();
        }


        loadOrderDetails();
    }
);

