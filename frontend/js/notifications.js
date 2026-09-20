document.addEventListener("DOMContentLoaded", () => {

requireLogin();

loadNotifications();

const markAllButton =
    document.getElementById("markAllReadBtn");

if (markAllButton) {

    markAllButton.addEventListener(
        "click",
        markAllNotificationsRead
    );

}

});

/* =========================================================
LOAD NOTIFICATIONS
========================================================= */

async function loadNotifications() {

const container =
    document.getElementById(
        "notificationsContainer"
    );

if (!container) return;

showNotificationsLoading();

try {

    const notifications =
        await apiRequest("/notifications/");

    const notificationList =
        Array.isArray(notifications)
            ? notifications
            : notifications?.results || [];

    updateNotificationBadge(
        notificationList
    );

    updateMarkAllButton(
        notificationList
    );

    if (!notificationList.length) {

        showEmptyNotifications();

        return;
    }

    renderNotifications(
        notificationList
    );

} catch (error) {

    console.error(
        "Load notifications error:",
        error
    );

    showNotificationsError(
        error.message ||
        "Unable to load notifications."
    );

}

}

/* =========================================================
RENDER NOTIFICATIONS
========================================================= */

function renderNotifications(
notifications
) {

const container =
    document.getElementById(
        "notificationsContainer"
    );

if (!container) return;

container.innerHTML =
    notifications
        .map(notification =>
            createNotificationCard(
                notification
            )
        )
        .join("");

}

/* =========================================================
CREATE NOTIFICATION CARD
========================================================= */

function createNotificationCard(
notification
) {

const id =
    Number(notification.id);

const type =
    notification.notification_type ||
    "SYSTEM";

const isRead =
    Boolean(notification.is_read);

const message =
    escapeHtml(
        notification.message ||
        "You have a new notification."
    );

const productName =
    notification.product_name
        ? escapeHtml(
            notification.product_name
        )
        : "";

const orderId =
    notification.order_id
        ? Number(
            notification.order_id
        )
        : null;

const createdAt =
    formatNotificationDate(
        notification.created_at
    );

const title =
    getNotificationTitle(type);

const icon =
    getNotificationIcon(type);

const readClass =
    isRead ? "read" : "unread";


return `

    <article
        class="notification-card ${readClass}"
        onclick="handleNotificationClick(${id}, ${isRead})"
    >

        <div class="notification-icon">
            ${icon}
        </div>


        <div class="notification-content">

            <div class="notification-title-row">

                <h3 class="notification-title">
                    ${title}
                </h3>

                <span class="notification-time">
                    ${createdAt}
                </span>

            </div>


            <p class="notification-message">
                ${message}
            </p>


            ${
                productName
                    ? `
                        <span class="notification-type">
                            Product:
                            ${productName}
                        </span>
                    `
                    : `
                        <span class="notification-type">
                            ${escapeHtml(type)}
                        </span>
                    `
            }

        </div>


        ${
            !isRead
                ? `
                    <span
                        class="notification-unread-dot"
                        aria-label="Unread notification"
                    ></span>
                `
                : ""
        }

    </article>

`;

}

/* =========================================================
HANDLE NOTIFICATION CLICK
========================================================= */

async function handleNotificationClick(
notificationId,
isRead
) {

if (isRead) {

    openNotificationDestination(
        notificationId
    );

    return;
}


try {

    await apiRequest(
        `/notifications/${notificationId}/read/`,
        {
            method: "PATCH"
        }
    );


    await loadNotifications();


    openNotificationDestination(
        notificationId
    );


} catch (error) {

    console.error(
        "Mark notification read error:",
        error
    );

    showNotificationMessage(
        error.message ||
        "Unable to update notification.",
        "error"
    );

}

}

/* =========================================================
OPEN NOTIFICATION DESTINATION
========================================================= */

function openNotificationDestination(
notificationId
) {

/*
   We intentionally keep the user on the
   notification page.

   The notification itself may contain an
   order_id, but the current card handler
   only receives the notification ID.

   Order navigation is handled through the
   message/order links when required.
*/

}

/* =========================================================
MARK ALL AS READ
========================================================= */

async function markAllNotificationsRead() {

const button =
    document.getElementById(
        "markAllReadBtn"
    );

if (button) {

    button.disabled = true;

    button.textContent =
        "Marking as Read...";

}


try {

    const response =
        await apiRequest(
            "/notifications/mark-all-read/",
            {
                method: "PATCH"
            }
        );


    showNotificationMessage(
        response?.message ||
        "All notifications marked as read.",
        "success"
    );


    await loadNotifications();


} catch (error) {

    console.error(
        "Mark all notifications read error:",
        error
    );

    showNotificationMessage(
        error.message ||
        "Unable to mark notifications as read.",
        "error"
    );

} finally {

    updateMarkAllButtonAfterAction();

}

}

/* =========================================================
UPDATE NOTIFICATION BADGE
========================================================= */

function updateNotificationBadge(
notifications
) {

const badge =
    document.getElementById(
        "notificationBadge"
    );

if (!badge) return;

const unreadCount =
    notifications.filter(
        notification =>
            !notification.is_read
    ).length;


if (unreadCount > 0) {

    badge.textContent =
        unreadCount > 99
            ? "99+"
            : unreadCount;

    badge.style.display =
        "inline-flex";

    badge.setAttribute(
        "data-count",
        unreadCount
    );

} else {

    badge.textContent = "";

    badge.style.display = "none";

    badge.setAttribute(
        "data-count",
        "0"
    );

}

}

/* =========================================================
UPDATE MARK ALL BUTTON
========================================================= */

function updateMarkAllButton(
notifications
) {

const button =
    document.getElementById(
        "markAllReadBtn"
    );

if (!button) return;

const unreadCount =
    notifications.filter(
        notification =>
            !notification.is_read
    ).length;


button.disabled =
    unreadCount === 0;

button.textContent =
    unreadCount === 0
        ? "✓ All Read"
        : "✓ Mark All as Read";

}

/* =========================================================
UPDATE BUTTON AFTER ACTION
========================================================= */

function updateMarkAllButtonAfterAction() {

const button =
    document.getElementById(
        "markAllReadBtn"
    );

if (!button) return;

button.disabled = true;

button.textContent =
    "✓ All Read";

}

/* =========================================================
NOTIFICATION ICON
========================================================= */

function getNotificationIcon(
type
) {

switch (type) {

    case "ORDER":
        return "🛒";

    case "STATUS":
        return "📦";

    case "SYSTEM":
    default:
        return "🔔";

}

}

/* =========================================================
NOTIFICATION TITLE
========================================================= */

function getNotificationTitle(
type
) {

switch (type) {

    case "ORDER":
        return "New Order";

    case "STATUS":
        return "Order Status Update";

    case "SYSTEM":
    default:
        return "System Notification";

}

}

/* =========================================================
DATE FORMAT
========================================================= */

function formatNotificationDate(
dateValue
) {

if (!dateValue) {

    return "Date unavailable";

}


const date =
    new Date(dateValue);


if (
    Number.isNaN(
        date.getTime()
    )
) {

    return "Date unavailable";

}


const now =
    new Date();

const difference =
    now.getTime() -
    date.getTime();


const minute =
    60 * 1000;

const hour =
    60 * minute;

const day =
    24 * hour;


if (
    difference >= 0 &&
    difference < minute
) {

    return "Just now";

}


if (
    difference >= minute &&
    difference < hour
) {

    const minutes =
        Math.floor(
            difference / minute
        );

    return `${minutes} min ago`;

}


if (
    difference >= hour &&
    difference < day
) {

    const hours =
        Math.floor(
            difference / hour
        );

    return `${hours} hr ago`;

}


if (
    difference >= day &&
    difference < 7 * day
) {

    const days =
        Math.floor(
            difference / day
        );

    return `${days} day${days !== 1 ? "s" : ""} ago`;

}


return date.toLocaleString(
    "en-IN",
    {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }
);

}

/* =========================================================
SHOW LOADING
========================================================= */

function showNotificationsLoading() {

const container =
    document.getElementById(
        "notificationsContainer"
    );

if (!container) return;

container.innerHTML = `

    <div class="notifications-loading">

        <div class="loading-spinner"></div>

        <p>
            Loading notifications...
        </p>

    </div>

`;

}

/* =========================================================
EMPTY STATE
========================================================= */

function showEmptyNotifications() {

const container =
    document.getElementById(
        "notificationsContainer"
    );

if (!container) return;

container.innerHTML = `

    <div class="notifications-empty">

        <div class="notifications-empty-icon">
            🔔
        </div>

        <h2>
            You're All Caught Up
        </h2>

        <p>
            You don't have any notifications right now.
            We'll let you know when there is an update
            about your orders or account.
        </p>

    </div>

`;

}

/* =========================================================
ERROR STATE
========================================================= */

function showNotificationsError(
message
) {

const container =
    document.getElementById(
        "notificationsContainer"
    );

if (!container) return;

container.innerHTML = `

    <div class="notifications-error">

        <div class="notifications-error-icon">
            ⚠️
        </div>

        <h2>
            Unable To Load Notifications
        </h2>

        <p>
            ${escapeHtml(message)}
        </p>

        <button
            type="button"
            class="btn btn-primary"
            onclick="loadNotifications()"
        >
            Try Again
        </button>

    </div>

`;

}

/* =========================================================
SHOW MESSAGE
========================================================= */

function showNotificationMessage(
message,
type
) {

const element =
    document.getElementById(
        "notificationMessage"
    );

if (!element) return;

element.textContent =
    message;

element.className =
    type
        ? `form-message ${type}`
        : "form-message";


if (type === "success") {

    setTimeout(() => {

        element.textContent = "";

        element.className =
            "form-message";

    }, 2500);

}

}

/* =========================================================
ESCAPE HTML
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