
document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const logoutButtons = document.querySelectorAll(".logout-btn");

    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener("submit", handleRegister);
    }

    logoutButtons.forEach(button => {
        button.addEventListener("click", logout);
    });

    updateNavbar();

});


/* =========================
   LOGIN
========================= */

async function handleLogin(event) {

    event.preventDefault();

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("loginMessage");

    message.textContent = "Logging in...";

    try {

        const response = await fetch(
            `${API_BASE_URL}/auth/login/`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data?.detail ||
                "Invalid username or password."
            );
        }

        localStorage.setItem(
            "access_token",
            data.access
        );

        localStorage.setItem(
            "refresh_token",
            data.refresh
        );


        /* =========================
           GET USER PROFILE
        ========================= */

        const profile = await getProfile();

        localStorage.setItem(
            "username",
            profile.username
        );

        localStorage.setItem(
            "user_role",
            profile.role
        );


        message.textContent = "Login successful!";


        setTimeout(() => {

            redirectByRole();

        }, 500);


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        message.textContent =
            error.message ||
            "Login failed.";
    }
}


/* =========================
   REGISTER
========================= */

async function handleRegister(event) {

    event.preventDefault();

    const form = event.target;

    const payload = {

        username:
            form.username.value.trim(),

        email:
            form.email.value.trim(),

        password:
            form.password.value,

        first_name:
            form.first_name.value.trim(),

        last_name:
            form.last_name.value.trim(),

        role:
            form.role.value,

        phone:
            form.phone.value.trim(),

        address:
            form.address.value.trim(),

        city:
            form.city.value.trim()
    };


    const message =
        document.getElementById("registerMessage");

    message.textContent =
        "Creating account...";


    try {

        const response = await fetch(
            `${API_BASE_URL}/auth/register/`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(payload)
            }
        );


        const data = await response.json();


        if (!response.ok) {

            let errorMessage =
                "Registration failed.";


            if (data.username) {

                errorMessage =
                    data.username[0];

            } else if (data.email) {

                errorMessage =
                    data.email[0];

            } else if (data.password) {

                errorMessage =
                    data.password[0];

            } else if (data.role) {

                errorMessage =
                    data.role[0];
            }


            throw new Error(errorMessage);
        }


        message.textContent =
            "Registration successful! Redirecting to login...";


        setTimeout(() => {

            window.location.href =
                "login.html";

        }, 1000);


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        message.textContent =
            error.message ||
            "Registration failed.";
    }
}


/* =========================
   NAVBAR
========================= */

function updateNavbar() {

    const username =
        getUsername();

    const role =
        getUserRole();


    const userElements =
        document.querySelectorAll(
            ".nav-username"
        );


    userElements.forEach(element => {

        element.textContent =
            username || "Guest";

    });


    const roleElements =
        document.querySelectorAll(
            ".nav-role"
        );


    roleElements.forEach(element => {

        element.textContent =
            role || "";

    });
}

