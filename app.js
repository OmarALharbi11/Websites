document.addEventListener("DOMContentLoaded", () => {
    // MOBILE MENU TOGGLE
    const mobMenu = document.getElementById("mobile-menu");
    const navMenu = document.querySelector(".navbar__menu");

    if (mobMenu) {
        mobMenu.addEventListener("click", () => {
            navMenu.classList.toggle("active");
        });
    }

    // DUMMY USERS DATASET
    const users = [
        {
            username: "john",
            password: "1234",
            name: "John Doe",
            roast: "Medium Roast",
            subscription: "Monthly 250g"
        },
        {
            username: "sarah",
            password: "pass",
            name: "Sarah Connor",
            roast: "Dark Roast",
            subscription: "Weekly 500g"
        },
        {
            username: "mike",
            password: "abcd",
            name: "Mike Ross",
            roast: "Light Roast",
            subscription: "Monthly 1kg"
        }
    ];

    // ELEMENTS
    const loginForm = document.getElementById("login-form");
    const loginError = document.getElementById("login-error");
    const welcomeText = document.getElementById("welcome-text");
    const logoutBtn = document.getElementById("logout-btn");
    const loginNavLink = document.getElementById("login-nav-link");
    const dashboardSection = document.getElementById("dashboard");
    const loginSection = document.getElementById("login");

    const dashName = document.getElementById("dash-name");
    const dashUsername = document.getElementById("dash-username");
    const dashRoast = document.getElementById("dash-roast");
    const dashSubscription = document.getElementById("dash-subscription");

    // FOOTER YEAR
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // UPDATE UI BASED ON LOGIN STATE
    function updateUI() {
        const userJSON = localStorage.getItem("loggedUser");
        let user = null;

        try {
            user = userJSON ? JSON.parse(userJSON) : null;
        } catch (e) {
            user = null;
        }

        if (user) {
            // Navbar
            if (welcomeText) welcomeText.textContent = `Welcome, ${user.name}`;
            if (logoutBtn) logoutBtn.style.display = "inline-block";
            if (loginNavLink) loginNavLink.textContent = "Dashboard";

            // Sections
            if (dashboardSection) dashboardSection.classList.remove("hidden");
            if (loginSection) loginSection.classList.add("hidden");

            // Dashboard data
            if (dashName) dashName.textContent = user.name;
            if (dashUsername) dashUsername.textContent = user.username;
            if (dashRoast) dashRoast.textContent = user.roast;
            if (dashSubscription) dashSubscription.textContent = user.subscription;
        } else {
            if (welcomeText) welcomeText.textContent = "";
            if (logoutBtn) logoutBtn.style.display = "none";
            if (loginNavLink) loginNavLink.textContent = "تسجيل دخول";

            if (dashboardSection) dashboardSection.classList.add("hidden");
            if (loginSection) loginSection.classList.remove("hidden");
        }
    }

    // LOGIN SUBMIT
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const usernameInput = document.getElementById("username");
            const passwordInput = document.getElementById("password");

            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            const foundUser = users.find(
                (u) => u.username === username && u.password === password
            );

            if (!foundUser) {
                if (loginError) {
                    loginError.textContent = "اسم المستخدم أو كلمة المرور غير صحيحة";
                }
                return;
            }

            // Save session
            localStorage.setItem("loggedUser", JSON.stringify(foundUser));

            if (loginError) loginError.textContent = "";
            updateUI();

            // Scroll to dashboard
            if (dashboardSection) {
                dashboardSection.scrollIntoView({ behavior: "smooth" });
            }
        });
    }

    // LOGOUT
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("loggedUser");
            updateUI();

            const home = document.getElementById("home");
            if (home) {
                home.scrollIntoView({ behavior: "smooth" });
            }
        });
    }

    // LOGIN / DASHBOARD NAV LINK BEHAVIOR
    if (loginNavLink) {
        loginNavLink.addEventListener("click", (e) => {
            e.preventDefault();

            const userJSON = localStorage.getItem("loggedUser");
            const user = userJSON ? JSON.parse(userJSON) : null;

            if (user && dashboardSection) {
                dashboardSection.scrollIntoView({ behavior: "smooth" });
            } else if (loginSection) {
                loginSection.scrollIntoView({ behavior: "smooth" });
            }
        });
    }

    // INITIAL UI STATE
    updateUI();
});


// Run on page load
updateUI();
