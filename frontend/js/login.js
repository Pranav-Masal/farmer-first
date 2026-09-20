document.addEventListener("DOMContentLoaded", () => {

    checkExistingLogin();

    const loginForm =
        document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener(
            "submit",
            handleLogin
        );
    }

});


/* =========================================
   CHECK EXISTING LOGIN
========================================= */

function checkExistingLogin() {

    const accessToken =
        getAccessToken();

    const refreshToken =
        getRefreshToken();

    const role =
        getUserRole();


    /*
     * Already logged in
     */

    if (
        (accessToken || refreshToken) &&
        role
    ) {

        redirectByRole();

        return;
    }
}


/* =========================================
   LOGIN
========================================= */

async function handleLogin(event) {

    event.preventDefault();


    const username =
        document.getElementById(
            "username"
        ).value.trim();


    const password =
        document.getElementById(
            "password"
        ).value;


    const message =
        document.getElementById(
            "loginMessage"
        );


    const loginButton =
        document.getElementById(
            "loginButton"
        );


    /* =================================
       VALIDATION
    ================================= */

    if (!username || !password) {

        showMessage(
            message,
            "Please enter username and password.",
            "error"
        );

        return;
    }


    /* =================================
       LOADING
    ================================= */

    if (loginButton) {

        loginButton.disabled = true;

        loginButton.textContent =
            "Logging in...";
    }


    try {

        /* =============================
           JWT LOGIN
        ============================= */

        const response = await fetch(
            `${API_BASE_URL}/auth/login/`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }
        );


        const data =
            await response.json();


        /* =============================
           LOGIN ERROR
        ============================= */

        if (!response.ok) {

            const errorMessage =
                data?.detail ||
                "Invalid username or password.";

            showMessage(
                message,
                errorMessage,
                "error"
            );

            return;
        }


        /* =============================
           SAVE JWT
        ============================= */

        saveAuthData(data);


        /* =============================
           GET PROFILE
        ============================= */

        try {

            const profile =
                await getProfile();


            if (profile) {

                if (profile.username) {

                    localStorage.setItem(
                        "username",
                        profile.username
                    );
                }

                if (profile.role) {

                    localStorage.setItem(
                        "user_role",
                        profile.role
                    );
                }
            }

        } catch (profileError) {

            console.error(
                "Profile loading error:",
                profileError
            );
        }


        /* =============================
           ROLE CHECK
        ============================= */

        const role =
            getUserRole();


        if (!role) {

            showMessage(
                message,
                "Login successful, but user role could not be detected.",
                "error"
            );

            return;
        }


        /* =============================
           SUCCESS
        ============================= */

        showMessage(
            message,
            "Login successful! Redirecting...",
            "success"
        );


        setTimeout(() => {

            redirectByRole();

        }, 500);


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        showMessage(
            message,
            "Unable to connect to server. Please try again.",
            "error"
        );

    } finally {

        if (loginButton) {

            loginButton.disabled = false;

            loginButton.textContent =
                "Login";
        }
    }
}


/* =========================================
   MESSAGE
========================================= */

function showMessage(
    element,
    message,
    type
) {

    if (!element) {
        return;
    }

    element.textContent =
        message;

    element.className =
        `auth-message ${type}`;

    element.style.display =
        "block";
}