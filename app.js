document.addEventListener("DOMContentLoaded", () => {
    // ACCOUNT PAGE GUARD — redirect immediately if not logged in
    const dashName = document.getElementById("dash-name");
    if (dashName && !localStorage.getItem("loggedUser")) {
        window.location.href = "login.html";
        return;
    }

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
        if (typeof renderCheckout === "function") renderCheckout();
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

    // CHECKOUT PAGE
    const checkoutItemsList = document.getElementById("checkout-items");
    let renderCheckout;

    if (checkoutItemsList) {
        const checkoutEmptyState = document.getElementById("checkout-empty-state");
        const checkoutFormSection = document.getElementById("checkout-form-section");
        const checkoutConfirmation = document.getElementById("checkout-confirmation");
        const checkoutForm = document.getElementById("checkout-form");
        const shippingFee = 15;

        renderCheckout = function () {
            const cart = getCart();
            const hasConfirmed = checkoutConfirmation && !checkoutConfirmation.classList.contains("hidden");
            if (hasConfirmed) return; // don't fight the confirmation view after a successful order

            if (cart.length === 0) {
                if (checkoutEmptyState) checkoutEmptyState.classList.remove("hidden");
                if (checkoutFormSection) checkoutFormSection.classList.add("hidden");
                return;
            }

            if (checkoutEmptyState) checkoutEmptyState.classList.add("hidden");
            if (checkoutFormSection) checkoutFormSection.classList.remove("hidden");

            checkoutItemsList.innerHTML = cart
                .map(
                    (item) => `
                        <li class="cart-item">
                            <div class="cart-item-info">
                                <span class="cart-item-name">${item.name}</span>
                                <span class="cart-item-meta">${item.qty} × ${item.price} ر.س</span>
                            </div>
                            <span>${item.qty * item.price} ر.س</span>
                        </li>`
                )
                .join("");

            const subtotal = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
            const subtotalEl = document.getElementById("checkout-subtotal");
            const shippingEl = document.getElementById("checkout-shipping");
            const totalEl = document.getElementById("checkout-total");
            if (subtotalEl) subtotalEl.textContent = `${subtotal} ر.س`;
            if (shippingEl) shippingEl.textContent = `${shippingFee} ر.س`;
            if (totalEl) totalEl.textContent = `${subtotal + shippingFee} ر.س`;
        };

        renderCheckout();

        if (checkoutForm) {
            checkoutForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const cart = getCart();
                if (cart.length === 0) return;

                const orderNumberEl = document.getElementById("order-number");
                if (orderNumberEl) {
                    orderNumberEl.textContent = "TQ-" + Math.floor(100000 + Math.random() * 900000);
                }

                if (checkoutConfirmation) checkoutConfirmation.classList.remove("hidden");
                if (checkoutFormSection) checkoutFormSection.classList.add("hidden");
                if (checkoutEmptyState) checkoutEmptyState.classList.add("hidden");

                saveCart([]);

                if (checkoutConfirmation) checkoutConfirmation.scrollIntoView({ behavior: "smooth" });
            });
        }
    }

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

    // CONTACT FORM
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("contact-name").value.trim();
            const email = document.getElementById("contact-email").value.trim();
            const message = document.getElementById("contact-message").value.trim();
            const contactMessage = document.getElementById("contact-form-message");
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!name || !emailPattern.test(email) || !message) {
                if (contactMessage) {
                    contactMessage.textContent = "رجاءً تأكد من تعبئة جميع الحقول ببريد إلكتروني صحيح";
                    contactMessage.classList.add("error-message");
                }
                return;
            }

            if (contactMessage) {
                contactMessage.classList.remove("error-message");
                contactMessage.textContent = "! شكرًا لتواصلك معنا، سنرد عليك قريبًا";
            }
            contactForm.reset();
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

    const dashUsername = document.getElementById("dash-username");
    const dashRoast = document.getElementById("dash-roast");
    const dashSubscription = document.getElementById("dash-subscription");

    // FOOTER YEAR
    document.querySelectorAll("#year").forEach((el) => {
        el.textContent = new Date().getFullYear();
    });

    // UPDATE NAV/UI BASED ON LOGIN STATE
    function updateUI() {
        const userJSON = localStorage.getItem("loggedUser");
        let user = null;

        try {
            user = userJSON ? JSON.parse(userJSON) : null;
        } catch (e) {
            user = null;
        }

        if (user) {
            if (welcomeText) welcomeText.textContent = `Welcome, ${user.name}`;
            if (logoutBtn) logoutBtn.style.display = "inline-block";
            if (loginNavLink) {
                loginNavLink.textContent = "حسابي";
                loginNavLink.setAttribute("href", "account.html");
            }

            if (dashName) dashName.textContent = user.name;
            if (dashUsername) dashUsername.textContent = user.username;
            if (dashRoast) dashRoast.textContent = user.roast;
            if (dashSubscription) dashSubscription.textContent = user.subscription;
        } else {
            if (welcomeText) welcomeText.textContent = "";
            if (logoutBtn) logoutBtn.style.display = "none";
            if (loginNavLink) {
                loginNavLink.textContent = "تسجيل دخول";
                loginNavLink.setAttribute("href", "login.html");
            }
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

            localStorage.setItem("loggedUser", JSON.stringify(foundUser));
            window.location.href = "account.html";
        });
    }

    // LOGOUT
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("loggedUser");
            window.location.href = "index.html";
        });
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
