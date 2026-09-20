
// ============================================================
// FARMER DASHBOARD
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    requireLogin();

    const role = getUserRole();

    if (role !== "Farmer") {
        alert("Only farmers can access this dashboard.");
        redirectByRole();
        return;
    }

    const farmerNameElement = document.getElementById("farmerName");

    if (farmerNameElement) {
        farmerNameElement.textContent = getUsername() || "Farmer";
    }

    await loadCategories();
    await loadMyProducts();
    await loadFarmerOrders();
    await loadNotifications();

    const productForm = document.getElementById("productForm");

    if (productForm) {
        productForm.addEventListener("submit", createProduct);
    }

    // Refresh notifications every 30 seconds
    setInterval(loadNotifications, 30000);
});


// ============================================================
// OPEN PRODUCT FORM
// ============================================================

function openProductForm() {

    const formSection = document.getElementById("productFormSection");

    if (formSection) {
        formSection.style.display = "block";

        formSection.scrollIntoView({
            behavior: "smooth"
        });
    }
}


// ============================================================
// CLOSE PRODUCT FORM
// ============================================================

function closeProductForm() {

    const formSection = document.getElementById("productFormSection");

    if (formSection) {
        formSection.style.display = "none";
    }

    const productForm = document.getElementById("productForm");

    if (productForm) {
        productForm.reset();
    }

    const message = document.getElementById("productMessage");

    if (message) {
        message.textContent = "";
        message.className = "form-message";
    }
}


// ============================================================
// LOAD CATEGORIES
// ============================================================

async function loadCategories() {

    const categorySelect = document.getElementById("productCategory");

    if (!categorySelect) {
        return;
    }

    try {

        const data = await apiRequest("/products/categories/");

        const categories = data.results || data || [];

        categorySelect.innerHTML = `
            <option value="">Select Category</option>
        `;

        categories.forEach(category => {

            const option = document.createElement("option");

            option.value = category.id;
            option.textContent = category.name;

            categorySelect.appendChild(option);
        });

    } catch (error) {

        console.error("Category loading error:", error);

        categorySelect.innerHTML = `
            <option value="">Unable to load categories</option>
        `;
    }
}


// ============================================================
// CREATE PRODUCT
// ============================================================

async function createProduct(event) {

    event.preventDefault();

    const message = document.getElementById("productMessage");
    const submitButton = event.target.querySelector(
        'button[type="submit"]'
    );

    const name = document.getElementById("productName").value.trim();
    const category = document.getElementById("productCategory").value;
    const description = document.getElementById("productDescription").value.trim();
    const price = document.getElementById("productPrice").value;
    const quantity = document.getElementById("productQuantity").value;
    const imageInput = document.getElementById("productImage");

    if (!name || !category || !price || !quantity) {

        if (message) {
            message.textContent = "Please fill all required fields.";
            message.className = "form-message error";
        }

        return;
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("quantity", quantity);

    if (
        imageInput &&
        imageInput.files &&
        imageInput.files.length > 0
    ) {
        formData.append("image", imageInput.files[0]);
    }

    try {

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Adding Product...";
        }

        if (message) {
            message.textContent = "Creating product...";
            message.className = "form-message";
        }

        await apiRequest("/products/", {
            method: "POST",
            body: formData
        });

        if (message) {
            message.textContent =
                "Product added successfully!";

            message.className = "form-message success";
        }

        event.target.reset();

        await loadMyProducts();

        setTimeout(() => {

            closeProductForm();

        }, 1000);

    } catch (error) {

        console.error("Create product error:", error);

        if (message) {

            message.textContent =
                error.message ||
                "Unable to create product.";

            message.className =
                "form-message error";
        }

    } finally {

        if (submitButton) {

            submitButton.disabled = false;
            submitButton.textContent =
                "Add Product";
        }
    }
}


// ============================================================
// LOAD MY PRODUCTS
// ============================================================

async function loadMyProducts() {

    try {

        const username = getUsername();

        const data = await apiRequest(
            "/products/?page_size=100"
        );

        const products = data.results || data || [];

        const myProducts = products.filter(
            product =>
                product.farmer_name === username
        );

        const totalProducts =
            document.getElementById("totalProducts");

        if (totalProducts) {
            totalProducts.textContent =
                myProducts.length;
        }

        displayMyProducts(myProducts);

    } catch (error) {

        console.error(
            "Products loading error:",
            error
        );

        const container =
            document.getElementById("myProducts");

        if (container) {

            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>

                    <h3>
                        Unable to load products
                    </h3>

                    <p>
                        ${escapeHtml(
                            error.message ||
                            "Something went wrong."
                        )}
                    </p>
                </div>
            `;
        }
    }
}


// ============================================================
// DISPLAY MY PRODUCTS
// ============================================================

function displayMyProducts(products) {

    const container =
        document.getElementById("myProducts");

    if (!container) {
        return;
    }

    if (!products.length) {

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    🌱
                </div>

                <h3>
                    No Products Yet
                </h3>

                <p>
                    Add your first farm product
                    to start selling.
                </p>

                <button
                    class="btn btn-primary"
                    onclick="openProductForm()"
                >
                    Add Product
                </button>

            </div>
        `;

        return;
    }

    container.innerHTML = products.map(product => {

        const imageUrl =
            getImageUrl(product.image);

        return `
            <div class="product-card">

                ${
                    imageUrl
                        ? `
                            <img
                                src="${imageUrl}"
                                alt="${escapeHtml(product.name)}"
                                class="product-image"
                                onerror="this.style.display='none'"
                            >
                        `
                        : `
                            <div class="product-image-placeholder">
                                🌾
                            </div>
                        `
                }

                <div class="product-card-content">

                    <span class="product-category">
                        ${escapeHtml(
                            product.category_name ||
                            "Agricultural Product"
                        )}
                    </span>

                    <h3>
                        ${escapeHtml(product.name)}
                    </h3>

                    <p class="product-description">
                        ${escapeHtml(
                            product.description ||
                            "Fresh farm product."
                        )}
                    </p>

                    <div class="product-info">

                        <strong>
                            ₹${Number(
                                product.price || 0
                            ).toFixed(2)}
                        </strong>

                        <span>
                            Stock:
                            ${product.quantity}
                        </span>

                    </div>

                    <div class="product-footer">

                        <span>
                            ${
                                product.is_available
                                    ? "Available"
                                    : "Unavailable"
                            }
                        </span>

                        <span>
                            ${formatOrderDate(
                                product.created_at
                            )}
                        </span>

                    </div>

                </div>

            </div>
        `;

    }).join("");
}


// ============================================================
// LOAD FARMER ORDERS
// ============================================================

async function loadFarmerOrders() {

    const container =
        document.getElementById(
            "farmerOrdersContainer"
        );

    if (!container) {
        return;
    }

    try {

        const username = getUsername();

        const data =
            await apiRequest("/orders/");

        const orders =
            data.results || data || [];

        const farmerOrders =
            orders.filter(order => {

                if (!order.items) {
                    return false;
                }

                return order.items.some(
                    item =>
                        item.farmer_name === username
                );
            });

        const totalOrders =
            document.getElementById(
                "totalOrders"
            );

        if (totalOrders) {

            totalOrders.textContent =
                farmerOrders.length;
        }

        displayFarmerOrders(farmerOrders);

    } catch (error) {

        console.error(
            "Farmer orders error:",
            error
        );

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to load orders
                </h3>

                <p>
                    ${escapeHtml(
                        error.message ||
                        "Something went wrong."
                    )}
                </p>

            </div>
        `;
    }
}


// ============================================================
// DISPLAY FARMER ORDERS
// ============================================================

function displayFarmerOrders(orders) {

    const container =
        document.getElementById(
            "farmerOrdersContainer"
        );

    if (!container) {
        return;
    }

    if (!orders.length) {

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    📦
                </div>

                <h3>
                    No Orders Yet
                </h3>

                <p>
                    Buyer orders for your products
                    will appear here.
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML =
        orders
            .map(order =>
                createFarmerOrderCard(order)
            )
            .join("");
}


// ============================================================
// CREATE FARMER ORDER CARD
// ============================================================

function createFarmerOrderCard(order) {

    const username = getUsername();

    const farmerItems =
        (order.items || []).filter(
            item =>
                item.farmer_name === username
        );

    const status =
        order.status || "Pending";

    const statusClass =
        getOrderStatusClass(status);

    const itemsHTML =
        farmerItems.map(item => {

            return `
                <div class="farmer-order-item">

                    <div>
                        <strong>
                            ${escapeHtml(
                                item.product_name
                            )}
                        </strong>

                        <span>
                            Quantity:
                            ${item.quantity}
                        </span>
                    </div>

                    <strong>
                        ₹${Number(
                            item.subtotal || 0
                        ).toFixed(2)}
                    </strong>

                </div>
            `;

        }).join("");

    let actionHTML = "";

    if (status === "Pending") {

        actionHTML = `
            <div class="order-actions">

                <button
                    class="btn btn-success"
                    onclick="updateFarmerOrderStatus(
                        ${order.id},
                        'Accepted'
                    )"
                >
                    ✓ Accept Order
                </button>

                <button
                    class="btn btn-danger"
                    onclick="updateFarmerOrderStatus(
                        ${order.id},
                        'Rejected'
                    )"
                >
                    ✕ Reject Order
                </button>

            </div>
        `;

    } else {

        actionHTML = `
            <div class="order-status-message">

                ${
                    status === "Accepted"
                        ? "✓ You accepted this order."
                        : status === "Rejected"
                        ? "✕ You rejected this order."
                        : `Order status: ${escapeHtml(
                            status
                        )}`
                }

            </div>
        `;
    }

    return `
        <div class="farmer-order-card">

            <div class="order-card-header">

                <div>

                    <span class="order-label">
                        ORDER #${order.id}
                    </span>

                    <h3>
                        Buyer:
                        ${escapeHtml(
                            order.buyer_name ||
                            "Buyer"
                        )}
                    </h3>

                </div>

                <span
                    class="status-badge ${statusClass}"
                >
                    ${escapeHtml(status)}
                </span>

            </div>

            <div class="order-date">

                ${formatOrderDate(
                    order.created_at
                )}

            </div>

            <div class="farmer-order-items">

                ${itemsHTML}

            </div>

            <div class="farmer-order-summary">

                <div>

                    <span>
                        Order Total
                    </span>

                    <strong>
                        ₹${Number(
                            order.total_amount || 0
                        ).toFixed(2)}
                    </strong>

                </div>

                <div>

                    <span>
                        Delivery Address
                    </span>

                    <p>
                        ${escapeHtml(
                            order.shipping_address ||
                            "Not provided"
                        )}
                    </p>

                </div>

            </div>

            ${actionHTML}

        </div>
    `;
}


// ============================================================
// UPDATE ORDER STATUS
// ============================================================

async function updateFarmerOrderStatus(
    orderId,
    newStatus
) {

    const action =
        newStatus === "Accepted"
            ? "accept"
            : "reject";

    const confirmed =
        confirm(
            `Are you sure you want to ${action} this order?`
        );

    if (!confirmed) {
        return;
    }

    try {

        await apiRequest(
            `/orders/${orderId}/status/`,
            {
                method: "PATCH",

                body: JSON.stringify({
                    status: newStatus
                })
            }
        );

        alert(
            `Order ${newStatus.toLowerCase()} successfully.`
        );

        await loadFarmerOrders();
        await loadNotifications();

    } catch (error) {

        console.error(
            "Order status error:",
            error
        );

        alert(
            error.message ||
            "Unable to update order status."
        );
    }
}


// ============================================================
// LOAD NOTIFICATIONS
// ============================================================

async function loadNotifications() {

    try {

        const data =
            await getNotificationsCount();

        let count = 0;

        if (typeof data === "number") {

            count = data;

        } else if (
            data &&
            typeof data.unread_count !== "undefined"
        ) {

            count = data.unread_count;

        } else if (
            data &&
            typeof data.count !== "undefined"
        ) {

            count = data.count;
        }

        const notificationCount =
            document.getElementById(
                "unreadNotifications"
            );

        if (notificationCount) {

            notificationCount.textContent =
                count;
        }

        const notificationBadge =
            document.getElementById(
                "notificationBadge"
            );

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
            "Notification error:",
            error
        );
    }
}


// ============================================================
// ORDER STATUS CSS CLASS
// ============================================================

function getOrderStatusClass(status) {

    switch (status) {

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

        case "Pending":
        default:
            return "status-pending";
    }
}


// ============================================================
// DATE FORMATTER
// ============================================================

function formatOrderDate(dateString) {

    if (!dateString) {
        return "Date unavailable";
    }

    const date =
        new Date(dateString);

    if (isNaN(date.getTime())) {
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


// ============================================================
// ESCAPE HTML
// ============================================================

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

