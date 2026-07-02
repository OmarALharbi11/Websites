document.addEventListener("DOMContentLoaded", () => {
    const dashboardSection = document.getElementById("dashboard");
    const loginSection = document.getElementById("login");
    const isIndexPage = !!(dashboardSection && loginSection);
    const pagePrefix = isIndexPage ? "" : "index.html";

    // THEME TOGGLE
    const themeToggle = document.getElementById("theme-toggle");
    const themeIcon = themeToggle ? themeToggle.querySelector("i") : null;
    const root = document.documentElement;

    function applyTheme(theme) {
        root.setAttribute("data-theme", theme);
        if (themeIcon) {
            themeIcon.classList.toggle("fa-moon", theme === "light");
            themeIcon.classList.toggle("fa-sun", theme === "dark");
        }
    }

    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(storedTheme || (prefersDark ? "dark" : "light"));

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
            applyTheme(nextTheme);
            localStorage.setItem("theme", nextTheme);
        });
    }

    // MOBILE MENU TOGGLE
    const mobMenu = document.getElementById("mobile-menu");
    const navMenu = document.querySelector(".navbar__menu");

    function closeMobileMenu() {
        if (navMenu) navMenu.classList.remove("active");
        if (mobMenu) mobMenu.setAttribute("aria-expanded", "false");
    }

    if (mobMenu) {
        mobMenu.addEventListener("click", () => {
            const isOpen = navMenu.classList.toggle("active");
            mobMenu.setAttribute("aria-expanded", String(isOpen));
        });
    }

    document.querySelectorAll(".navbar__link").forEach((link) => {
        link.addEventListener("click", closeMobileMenu);
    });

    // TOAST NOTIFICATIONS
    let toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.id = "toast-container";
        toastContainer.className = "toast-container";
        toastContainer.setAttribute("aria-live", "polite");
        document.body.appendChild(toastContainer);
    }

    function showToast(message) {
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.textContent = message;
        toastContainer.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add("is-visible"));
        setTimeout(() => {
            toast.classList.remove("is-visible");
            setTimeout(() => toast.remove(), 300);
        }, 2200);
    }

    // CART
    const cartBadge = document.getElementById("cart-count");
    const cartToggle = document.getElementById("cart-toggle");
    const cartDropdown = document.getElementById("cart-dropdown");
    const cartItemsList = document.getElementById("cart-items");
    const cartEmpty = document.getElementById("cart-empty");
    const cartFooter = document.getElementById("cart-footer");
    const cartSubtotal = document.getElementById("cart-subtotal");
    const cartClearBtn = document.getElementById("cart-clear");
    const cartWrapper = document.querySelector(".cart-wrapper");

    function getCart() {
        try {
            const raw = localStorage.getItem("cart");
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
    }

    function renderCart() {
        const cart = getCart();
        const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
        const subtotal = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

        if (cartBadge) cartBadge.textContent = String(totalQty);

        if (cartItemsList) {
            cartItemsList.innerHTML = cart
                .map(
                    (item, index) => `
                        <li class="cart-item">
                            <div class="cart-item-info">
                                <span class="cart-item-name">${item.name}</span>
                                <span class="cart-item-meta">${item.qty} × ${item.price} ر.س</span>
                            </div>
                            <button type="button" class="cart-item-remove" data-index="${index}" aria-label="إزالة ${item.name}">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </li>`
                )
                .join("");
        }

        const isEmpty = cart.length === 0;
        if (cartEmpty) cartEmpty.style.display = isEmpty ? "block" : "none";
        if (cartFooter) cartFooter.style.display = isEmpty ? "none" : "block";
        if (cartSubtotal) cartSubtotal.textContent = String(subtotal);
    }

    document.querySelectorAll(".add-to-cart").forEach((button) => {
        button.addEventListener("click", () => {
            const productCard = button.closest(".product-card");
            const name = productCard?.querySelector("h3")?.textContent || "المنتج";
            const price = parseFloat(button.dataset.price || "0");

            const cart = getCart();
            const existing = cart.find((item) => item.name === name);
            if (existing) {
                existing.qty += 1;
            } else {
                cart.push({ name, price, qty: 1 });
            }
            saveCart(cart);
            showToast(`تمت إضافة "${name}" إلى السلة ☕`);
        });
    });

    if (cartItemsList) {
        cartItemsList.addEventListener("click", (e) => {
            const removeBtn = e.target.closest(".cart-item-remove");
            if (!removeBtn) return;
            const index = parseInt(removeBtn.dataset.index, 10);
            const cart = getCart();
            cart.splice(index, 1);
            saveCart(cart);
        });
    }

    if (cartClearBtn) {
        cartClearBtn.addEventListener("click", () => {
            saveCart([]);
        });
    }

    function closeCartDropdown() {
        if (cartDropdown) cartDropdown.classList.remove("open");
        if (cartToggle) cartToggle.setAttribute("aria-expanded", "false");
    }

    if (cartToggle) {
        cartToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = cartDropdown.classList.toggle("open");
            cartToggle.setAttribute("aria-expanded", String(isOpen));
        });
    }

    document.addEventListener("click", (e) => {
        if (cartWrapper && !cartWrapper.contains(e.target)) {
            closeCartDropdown();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeCartDropdown();
    });

    renderCart();

    // FAQ ACCORDION
    document.querySelectorAll(".faq-question").forEach((question) => {
        question.addEventListener("click", () => {
            const item = question.closest(".faq-item");
            const isOpen = item.classList.contains("open");

            document.querySelectorAll(".faq-item.open").forEach((openItem) => {
                if (openItem !== item) {
                    openItem.classList.remove("open");
                    openItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");
                }
            });

            item.classList.toggle("open", !isOpen);
            question.setAttribute("aria-expanded", String(!isOpen));
        });
    });

    // NEWSLETTER FORM
    const newsletterForm = document.getElementById("newsletter-form");
    if (newsletterForm) {
        newsletterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const emailInput = document.getElementById("newsletter-email");
            const email = emailInput.value.trim();
            const newsletterMessage = document.getElementById("newsletter-message");
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email)) {
                if (newsletterMessage) {
                    newsletterMessage.textContent = "رجاءً أدخل بريدًا إلكترونيًا صحيحًا";
                    newsletterMessage.classList.add("error-message");
                }
                return;
            }

            const subs = JSON.parse(localStorage.getItem("newsletterSubs") || "[]");
            if (!subs.includes(email)) {
                subs.push(email);
                localStorage.setItem("newsletterSubs", JSON.stringify(subs));
            }

            if (newsletterMessage) {
                newsletterMessage.classList.remove("error-message");
                newsletterMessage.textContent = "! شكرًا لاشتراكك في نشرتنا البريدية";
            }
            newsletterForm.reset();
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

    const dashName = document.getElementById("dash-name");
    const dashUsername = document.getElementById("dash-username");
    const dashRoast = document.getElementById("dash-roast");
    const dashSubscription = document.getElementById("dash-subscription");

    // FOOTER YEAR
    document.querySelectorAll("#year").forEach((el) => {
        el.textContent = new Date().getFullYear();
    });

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
            if (loginNavLink) {
                loginNavLink.textContent = "Dashboard";
                loginNavLink.setAttribute("href", `${pagePrefix}#dashboard`);
            }

            // Sections (only present on the index page)
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
            if (loginNavLink) {
                loginNavLink.textContent = "تسجيل دخول";
                loginNavLink.setAttribute("href", `${pagePrefix}#login`);
            }

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
                loginForm.classList.remove("shake");
                void loginForm.offsetWidth; // restart the animation on repeated errors
                loginForm.classList.add("shake");
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

    // LOGIN / DASHBOARD NAV LINK BEHAVIOR (same-page smooth scroll only when both sections exist here)
    if (loginNavLink && isIndexPage) {
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

    // ACTIVE NAV LINK ON SCROLL (only meaningful for in-page anchors on this page)
    const navLinks = document.querySelectorAll(".navbar__link[href^='#']");
    const trackedSections = Array.from(navLinks)
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    if (trackedSections.length && "IntersectionObserver" in window) {
        const sectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        navLinks.forEach((link) => link.classList.remove("active"));
                        const activeLink = document.querySelector(`.navbar__link[href='#${entry.target.id}']`);
                        if (activeLink) activeLink.classList.add("active");
                    }
                });
            },
            { rootMargin: "-40% 0px -55% 0px" }
        );
        trackedSections.forEach((section) => sectionObserver.observe(section));
    }

    // REVEAL ON SCROLL
    const revealEls = document.querySelectorAll(".reveal");
    if (revealEls.length && "IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 }
        );
        revealEls.forEach((el) => revealObserver.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add("is-visible"));
    }

    // BACK TO TOP
    const backToTop = document.getElementById("back-to-top");
    if (backToTop) {
        window.addEventListener("scroll", () => {
            backToTop.classList.toggle("visible", window.scrollY > 400);
        });
        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // INITIAL UI STATE
    updateUI();
});
