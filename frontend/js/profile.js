document.addEventListener("DOMContentLoaded", async () => {
    const loggedIn = await requireLogin();

    if (!loggedIn) {
        return;
    }

    loadProfile();
    loadNotificationCount();

    const logoutBtn = document.getElementById("logoutBtn");
    const profileLogoutBtn = document.getElementById("profileLogoutBtn");
    const editProfileBtn = document.getElementById("editProfileBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    if (profileLogoutBtn) {
        profileLogoutBtn.addEventListener("click", logout);
    }

    if (editProfileBtn) {
        editProfileBtn.addEventListener("click", toggleEditMode);
    }
});


let currentProfile = null;
let editMode = false;


async function loadProfile() {
    try {
        const profile = await getProfile();

        if (!profile) {
            showProfileMessage(
                "Unable to load profile.",
                "error"
            );
            return;
        }

        currentProfile = profile;

        displayProfile(profile);

    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

        showProfileMessage(
            "Unable to load profile. Please try again.",
            "error"
        );
    }
}


function displayProfile(profile) {

    const username = profile.username || "User";

    const firstName =
        profile.first_name || "";

    const lastName =
        profile.last_name || "";

    const fullName =
        `${firstName} ${lastName}`.trim() ||
        username;


    const profileName =
        document.getElementById("profileName");

    const profileUsername =
        document.getElementById("profileUsername");

    const profileRole =
        document.getElementById("profileRole");

    const profileAvatar =
        document.getElementById("profileAvatar");


    if (profileName) {
        profileName.textContent =
            fullName;
    }

    if (profileUsername) {
        profileUsername.textContent =
            `@${username}`;
    }

    if (profileRole) {
        profileRole.textContent =
            profile.role || "User";
    }

    if (profileAvatar) {
        profileAvatar.textContent =
            username.charAt(0).toUpperCase();
    }


    setProfileValue(
        "username",
        profile.username
    );

    setProfileValue(
        "email",
        profile.email
    );

    setProfileValue(
        "firstName",
        profile.first_name
    );

    setProfileValue(
        "lastName",
        profile.last_name
    );

    setProfileValue(
        "phone",
        profile.phone
    );

    setProfileValue(
        "role",
        profile.role
    );

    setProfileValue(
        "address",
        profile.address
    );

    setProfileValue(
        "city",
        profile.city
    );
}


function setProfileValue(
    elementId,
    value
) {

    const element =
        document.getElementById(elementId);

    if (!element) {
        return;
    }

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        element.textContent =
            "Not provided";

        return;
    }

    element.textContent = value;
}


function toggleEditMode() {

    if (editMode) {
        cancelEditMode();
        return;
    }

    startEditMode();
}


function startEditMode() {

    if (!currentProfile) {
        return;
    }

    editMode = true;

    createInput(
        "email",
        currentProfile.email || "",
        "email"
    );

    createInput(
        "firstName",
        currentProfile.first_name || "",
        "text"
    );

    createInput(
        "lastName",
        currentProfile.last_name || "",
        "text"
    );

    createInput(
        "phone",
        currentProfile.phone || "",
        "tel"
    );

    createInput(
        "address",
        currentProfile.address || "",
        "text"
    );

    createInput(
        "city",
        currentProfile.city || "",
        "text"
    );


    const editButton =
    document.getElementById("editProfileBtn");

if (editButton) {
    editButton.textContent = "Save Changes";
    editButton.classList.add("save-mode");

    editButton.onclick = saveProfile;
}


    const username =
        document.getElementById("username");

    const role =
        document.getElementById("role");

    if (username) {
        username.classList.add(
            "profile-readonly"
        );
    }

    if (role) {
        role.classList.add(
            "profile-readonly"
        );
    }


    showCancelButton();
}


function createInput(
    elementId,
    value,
    type
) {

    const element =
        document.getElementById(elementId);

    if (!element) {
        return;
    }

    const input =
        document.createElement("input");

    input.type = type;

    input.value = value;

    input.id = elementId;

    input.className =
        "profile-input";


    element.replaceWith(input);
}


function showCancelButton() {

    const actions =
        document.querySelector(
            ".profile-actions"
        );

    if (!actions) {
        return;
    }

    if (
        document.getElementById(
            "cancelProfileBtn"
        )
    ) {
        return;
    }

    const cancelButton =
        document.createElement("button");

    cancelButton.type = "button";

    cancelButton.id =
        "cancelProfileBtn";

    cancelButton.className =
        "profile-btn secondary";

    cancelButton.textContent =
        "Cancel";

    cancelButton.addEventListener(
        "click",
        cancelEditMode
    );

    actions.insertBefore(
        cancelButton,
        actions.children[1]
    );
}


async function saveProfile() {
    console.log("SAVE PROFILE CLICKED");

    const data = {

        email:
            document.getElementById(
                "email"
            ).value.trim(),

        first_name:
            document.getElementById(
                "firstName"
            ).value.trim(),

        last_name:
            document.getElementById(
                "lastName"
            ).value.trim(),

        phone:
            document.getElementById(
                "phone"
            ).value.trim(),

        address:
            document.getElementById(
                "address"
            ).value.trim(),

        city:
            document.getElementById(
                "city"
            ).value.trim()
    };


    try {

        const response =
            await apiRequest(
                "/auth/profile/",
                {
                    method: "PATCH",
                    body: JSON.stringify(data)
                }
            );


        currentProfile =
            response.profile ||
            response;


        editMode = false;

        displayProfile(
            currentProfile
        );

        removeCancelButton();


        const editButton =
            document.getElementById(
                "editProfileBtn"
            );

        if (editButton) {

            editButton.textContent =
                "Edit Profile";

            editButton.classList.remove(
                "save-mode"
            );
        }


        showProfileMessage(
            "Profile updated successfully!",
            "success"
        );

    } catch (error) {

        console.error(
            "Profile update error:",
            error
        );

        showProfileMessage(
            "Unable to update profile. Please try again.",
            "error"
        );
    }
}


function cancelEditMode() {

    editMode = false;

    if (currentProfile) {
        displayProfile(
            currentProfile
        );
    }

    removeCancelButton();


    const editButton =
        document.getElementById(
            "editProfileBtn"
        );

    if (editButton) {

        editButton.textContent =
            "Edit Profile";

        editButton.classList.remove(
            "save-mode"
        );
    }
}


function removeCancelButton() {

    const button =
        document.getElementById(
            "cancelProfileBtn"
        );

    if (button) {
        button.remove();
    }
}


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
            data?.unread_count ??
            data?.count ??
            0;

        badge.textContent = count;

        if (count > 0) {
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


function showProfileMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "profileMessage"
        );

    if (!element) {
        return;
    }

    element.textContent =
        message;

    element.className =
        `profile-message ${type}`;
}