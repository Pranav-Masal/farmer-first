const API_BASE_URL = "http://127.0.0.1:8000/api";


/* =========================================
   AUTH STORAGE
========================================= */

function getAccessToken() {
    return localStorage.getItem("access_token");
}

function getRefreshToken() {
    return localStorage.getItem("refresh_token");
}

function getUserRole() {
    return localStorage.getItem("user_role");
}

function getUsername() {
    return localStorage.getItem("username");
}


/* =========================================
   SAVE LOGIN DATA
========================================= */

function saveAuthData(data) {

    if (data.access) {
        localStorage.setItem("access_token", data.access);
    }

    if (data.refresh) {
        localStorage.setItem("refresh_token", data.refresh);
    }

    if (data.username) {
        localStorage.setItem("username", data.username);
    }

    if (data.role) {
        localStorage.setItem("user_role", data.role);
    }
}


/* =========================================
   LOGOUT
========================================= */

function logout() {

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    localStorage.removeItem("user_role");

    window.location.href = "login.html";
}


/* =========================================
   REFRESH ACCESS TOKEN
========================================= */

async function refreshAccessToken() {

    const refresh = getRefreshToken();

    if (!refresh) {
        return false;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/auth/token/refresh/`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    refresh: refresh
                })
            }
        );

        if (!response.ok) {

            return false;
        }

        const data = await response.json();

        if (!data.access) {

            return false;
        }

        localStorage.setItem(
            "access_token",
            data.access
        );

        return true;

    } catch (error) {

        console.error(
            "Token refresh error:",
            error
        );

        return false;
    }
}


/* =========================================
   API REQUEST
========================================= */

async function apiRequest(
    endpoint,
    options = {},
    retry = true
) {

    const token = getAccessToken();

    const headers = {
        ...(options.headers || {})
    };


    /* JSON CONTENT TYPE */

    if (!(options.body instanceof FormData)) {

        headers["Content-Type"] =
            "application/json";
    }


    /* AUTHORIZATION */

    if (token) {

        headers["Authorization"] =
            `Bearer ${token}`;
    }


    try {

        const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...options,
                headers: headers
            }
        );


        /* =================================
           ACCESS TOKEN EXPIRED
        ================================= */

        if (
            response.status === 401 &&
            retry
        ) {

            const refreshed =
                await refreshAccessToken();


            /* =============================
               TOKEN REFRESH SUCCESS
            ============================= */

            if (refreshed) {

                return apiRequest(
                    endpoint,
                    options,
                    false
                );
            }


            /* =============================
               REFRESH TOKEN ALSO INVALID
            ============================= */

            logout();

            return null;
        }


        /* =================================
           RESPONSE DATA
        ================================= */

        let data = null;

        const contentType =
            response.headers.get(
                "content-type"
            );


        if (
            contentType &&
            contentType.includes(
                "application/json"
            )
        ) {

            data = await response.json();
        }


        /* =================================
           API ERROR
        ================================= */

        if (!response.ok) {

            const error = new Error(

                data?.detail ||
                data?.message ||
                "Something went wrong."
            );

            error.status =
                response.status;

            error.data = data;

            throw error;
        }


        return data;


    } catch (error) {

        /*
         * Network errors should not
         * automatically logout the user.
         */

        console.error(
            "API request error:",
            error
        );

        throw error;
    }
}


/* =========================================
   GET PROFILE
========================================= */

async function getProfile() {

    return apiRequest(
        "/auth/profile/"
    );
}


/* =========================================
   NOTIFICATION COUNT
========================================= */

async function getNotificationsCount() {

    return apiRequest(
        "/notifications/unread-count/"
    );
}


/* =========================================
   REQUIRE LOGIN
========================================= */

async function requireLogin() {

    const accessToken =
        getAccessToken();

    const refreshToken =
        getRefreshToken();


    /* =============================
       NO TOKENS
    ============================= */

    if (!accessToken && !refreshToken) {

        window.location.href =
            "login.html";

        return false;
    }


    /* =============================
       ACCESS TOKEN AVAILABLE
    ============================= */

    if (accessToken) {

        return true;
    }


    /* =============================
       ONLY REFRESH TOKEN AVAILABLE
    ============================= */

    if (refreshToken) {

        const refreshed =
            await refreshAccessToken();

        if (refreshed) {

            return true;
        }
    }


    /* =============================
       SESSION INVALID
    ============================= */

    logout();

    return false;
}


/* =========================================
   REDIRECT BY ROLE
========================================= */

function redirectByRole() {

    const role = getUserRole();


    if (role === "Farmer") {

        window.location.href =
            "farmer-dashboard.html";

    } else if (role === "Buyer") {

        window.location.href =
            "buyer-dashboard.html";

    } else {

        window.location.href =
            "index.html";
    }
}


/* =========================================
   IMAGE URL
========================================= */

function getImageUrl(imagePath) {

    if (!imagePath) {
        return "";
    }

    if (imagePath.startsWith("http")) {

        return imagePath;
    }

    return `http://127.0.0.1:8000${imagePath}`;
}