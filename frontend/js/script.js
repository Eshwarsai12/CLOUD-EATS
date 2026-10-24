// ======================================================
// CLOUD EATS FRONTEND
// AUTHENTICATION + SUBSCRIPTION FUNCTIONS
// ======================================================


// ======================================================
// API CONFIGURATION
// ======================================================

const cexApiBaseUrl = "http://localhost:5000/api";


// ======================================================
// SCROLL TO PLANS
// ======================================================

function cexScrollPlans() {

    const plansSection =
        document.getElementById("plans");

    if (plansSection) {

        plansSection.scrollIntoView({
            behavior: "smooth"
        });

    }

}


// ======================================================
// SCROLL TO PROCESS
// ======================================================

function cexScrollProcess() {

    const processSection =
        document.getElementById("process");

    if (processSection) {

        processSection.scrollIntoView({
            behavior: "smooth"
        });

    }

}


// ======================================================
// MOBILE MENU
// ======================================================

function cexToggleMenu() {

    const mobileMenu =
        document.getElementById("cexMobileMenu");

    if (mobileMenu) {

        mobileMenu.classList.toggle(
            "cex-mobile-open"
        );

    }

}


// ======================================================
// OPEN LOGIN
// ======================================================

function cexOpenLogin() {

    const loginModal =
        document.getElementById("cexLoginModal");

    if (loginModal) {

        loginModal.classList.add(
            "cex-modal-open"
        );

    }

}


// ======================================================
// CLOSE LOGIN
// ======================================================

function cexCloseLogin() {

    const loginModal =
        document.getElementById("cexLoginModal");

    if (loginModal) {

        loginModal.classList.remove(
            "cex-modal-open"
        );

    }

}


// ======================================================
// CHOOSE SUBSCRIPTION PLAN
// ======================================================

async function cexChoosePlan(planName) {

    const token = localStorage.getItem("cexAuthToken");

    // Remember the plan so it can continue after login.
    localStorage.setItem("cexPendingPlan", planName);

    if (!token) {
        cexMessage("Please login before choosing a plan.");
        setTimeout(function () { cexOpenLogin(); }, 400);
        return;
    }

    await cexCreateSubscription(planName);
}


// ======================================================
// CREATE SUBSCRIPTION
// ======================================================

async function cexCreateSubscription(planName) {

    const token = localStorage.getItem("cexAuthToken");

    if (!token) {
        cexMessage("Please login before choosing a plan.");
        return false;
    }

    let mealsPerDay;

    if (planName === "2 Meals / Day") {
        mealsPerDay = 2;
    } else if (planName === "3 Meals / Day") {
        mealsPerDay = 3;
    } else {
        cexMessage("Invalid subscription plan.");
        return false;
    }

    try {
        cexMessage("Creating your subscription...");

        const response = await fetch(`${cexApiBaseUrl}/subscriptions/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                plan: planName,
                mealsPerDay: mealsPerDay
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to create subscription.");
        }

        if (data.subscription) {
            localStorage.setItem("cexSubscription", JSON.stringify(data.subscription));
        }

        localStorage.removeItem("cexPendingPlan");
        cexMessage("Subscription created successfully!");

        setTimeout(function () {
            window.location.href = "dashboard.html";
        }, 700);

        return true;
    } catch (error) {
        console.error("Subscription error:", error);
        cexMessage(error.message || "Unable to create subscription.");
        return false;
    }
}


// ======================================================
// TOAST MESSAGE
// ======================================================

function cexMessage(messageText) {

    const toastBox =
        document.getElementById(
            "cexToast"
        );


    if (!toastBox) {

        return;

    }


    toastBox.textContent =
        messageText;


    toastBox.classList.add(
        "cex-toast-visible"
    );


    clearTimeout(
        window.cexToastTimer
    );


    window.cexToastTimer =
        setTimeout(function () {

            toastBox.classList.remove(
                "cex-toast-visible"
            );

        }, 3000);

}


// ======================================================
// LOGIN USER
// ======================================================

async function cexLoginUser() {

    const emailInput =
        document.getElementById(
            "cexLoginEmail"
        );


    const passwordInput =
        document.getElementById(
            "cexLoginPassword"
        );


    const loginButton =
        document.getElementById(
            "cexLoginSubmit"
        );


    if (
        !emailInput ||
        !passwordInput ||
        !loginButton
    ) {

        console.error(
            "Login elements not found."
        );

        return;

    }


    const email =
        emailInput.value.trim();


    const password =
        passwordInput.value;


    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (
        !email ||
        !password
    ) {

        cexMessage(
            "Please enter your email and password."
        );

        return;

    }


    try {

        loginButton.disabled =
            true;


        loginButton.textContent =
            "Logging in...";


        // --------------------------------------------------
        // LOGIN REQUEST
        // --------------------------------------------------

        const response =
            await fetch(
                `${cexApiBaseUrl}/auth/login`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        email:
                            email,

                        password:
                            password

                    })

                }
            );


        const data =
            await response.json();


        // --------------------------------------------------
        // CHECK RESPONSE
        // --------------------------------------------------

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Login failed."
            );

        }


        // --------------------------------------------------
        // SAVE JWT
        // --------------------------------------------------

        localStorage.setItem(
            "cexAuthToken",
            data.token
        );


        // --------------------------------------------------
        // SAVE CUSTOMER
        // --------------------------------------------------

        if (
            data.user
        ) {

            localStorage.setItem(
                "cexCustomer",
                JSON.stringify(
                    data.user
                )
            );

        }


        // --------------------------------------------------
        // SUCCESS MESSAGE
        // --------------------------------------------------

        const customerName =
            data.user &&
            data.user.name
                ? data.user.name
                : "Customer";


        cexMessage(
            "Welcome back, " +
            customerName +
            "!"
        );


        console.log(
            "Cloud Eats login successful:",
            data.user
        );

        // --------------------------------------------------
        // CONTINUE SELECTED SUBSCRIPTION AFTER LOGIN
        // --------------------------------------------------

        const pendingPlan =
            localStorage.getItem(
                "cexPendingPlan"
            );

        if (pendingPlan) {

            const subscriptionCreated =
                await cexCreateSubscription(
                    pendingPlan
                );

            if (subscriptionCreated) {
                return;
            }
        }


        // --------------------------------------------------
        // OPEN DASHBOARD
        // --------------------------------------------------

        setTimeout(function () {

            window.location.href =
                "dashboard.html";

        }, 1000);


    }

    catch (error) {

        console.error(
            "Login error:",
            error
        );


        cexMessage(
            error.message ||
            "Unable to login. Please try again."
        );

    }

    finally {

        loginButton.disabled =
            false;


        loginButton.textContent =
            "Login";

    }

}


// ======================================================
// SIGNUP USER
// ======================================================

async function cexSignupUser() {

    const nameInput =
        document.getElementById(
            "cexSignupName"
        );


    const emailInput =
        document.getElementById(
            "cexSignupEmail"
        );


    const phoneInput =
        document.getElementById(
            "cexSignupPhone"
        );


    const passwordInput =
        document.getElementById(
            "cexSignupPassword"
        );


    const signupButton =
        document.getElementById(
            "cexSignupSubmit"
        );


    if (
        !nameInput ||
        !emailInput ||
        !phoneInput ||
        !passwordInput ||
        !signupButton
    ) {

        console.error(
            "Signup elements not found."
        );

        return;

    }


    const name =
        nameInput.value.trim();


    const email =
        emailInput.value.trim();


    const phone =
        phoneInput.value.trim();


    const password =
        passwordInput.value;


    // --------------------------------------------------
    // REQUIRED FIELD VALIDATION
    // --------------------------------------------------

    if (
        !name ||
        !email ||
        !phone ||
        !password
    ) {

        cexMessage(
            "Please complete all fields."
        );

        return;

    }


    // --------------------------------------------------
    // EMAIL VALIDATION
    // --------------------------------------------------

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
        !emailPattern.test(
            email
        )
    ) {

        cexMessage(
            "Please enter a valid email address."
        );

        return;

    }


    // --------------------------------------------------
    // PHONE VALIDATION
    // --------------------------------------------------

    const phonePattern =
        /^[0-9]{10}$/;


    if (
        !phonePattern.test(
            phone
        )
    ) {

        cexMessage(
            "Please enter a valid 10-digit phone number."
        );

        return;

    }


    // --------------------------------------------------
    // PASSWORD VALIDATION
    // --------------------------------------------------

    if (
        password.length < 6
    ) {

        cexMessage(
            "Password must contain at least 6 characters."
        );

        return;

    }


    try {

        signupButton.disabled =
            true;


        signupButton.textContent =
            "Creating account...";


        // --------------------------------------------------
        // SIGNUP REQUEST
        // --------------------------------------------------

        const response =
            await fetch(
                `${cexApiBaseUrl}/auth/signup`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        name:
                            name,

                        email:
                            email,

                        phone:
                            phone,

                        password:
                            password

                    })

                }
            );


        const data =
            await response.json();


        // --------------------------------------------------
        // HANDLE ERROR
        // --------------------------------------------------

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Signup failed."
            );

        }


        // --------------------------------------------------
        // SAVE TOKEN
        // --------------------------------------------------

        localStorage.setItem(
            "cexAuthToken",
            data.token
        );


        // --------------------------------------------------
        // SAVE CUSTOMER
        // --------------------------------------------------

        if (
            data.user
        ) {

            localStorage.setItem(
                "cexCustomer",
                JSON.stringify(
                    data.user
                )
            );

        }


        // --------------------------------------------------
        // SUCCESS
        // --------------------------------------------------

        cexMessage(
            "Account created successfully!"
        );


        console.log(
            "Cloud Eats signup successful:",
            data.user
        );


        // Clear password

        passwordInput.value =
            "";


        // --------------------------------------------------
        // OPEN DASHBOARD
        // --------------------------------------------------

        setTimeout(function () {

            window.location.href =
                "dashboard.html";

        }, 1000);


    }

    catch (error) {

        console.error(
            "Signup error:",
            error
        );


        cexMessage(
            error.message ||
            "Unable to create account."
        );

    }

    finally {

        signupButton.disabled =
            false;


        signupButton.textContent =
            "Create Account";

    }

}


// ======================================================
// SHOW LOGIN FORM
// ======================================================

function cexShowLoginForm() {

    const loginForm =
        document.getElementById(
            "cexLoginForm"
        );


    const signupForm =
        document.getElementById(
            "cexSignupForm"
        );


    if (
        !loginForm ||
        !signupForm
    ) {

        return;

    }


    loginForm.style.display =
        "block";


    signupForm.style.display =
        "none";

}


// ======================================================
// SHOW SIGNUP FORM
// ======================================================

function cexShowSignupForm() {

    const loginForm =
        document.getElementById(
            "cexLoginForm"
        );


    const signupForm =
        document.getElementById(
            "cexSignupForm"
        );


    if (
        !loginForm ||
        !signupForm
    ) {

        return;

    }


    loginForm.style.display =
        "none";


    signupForm.style.display =
        "block";

}


// ======================================================
// LOGOUT
// ======================================================

function cexLogoutUser() {

    localStorage.removeItem(
        "cexAuthToken"
    );


    localStorage.removeItem(
        "cexCustomer"
    );


    localStorage.removeItem(
        "cexSubscription"
    );

    localStorage.removeItem(
        "cexPendingPlan"
    );


    window.location.href =
        "index.html";

}


// ======================================================
// CHECK LOGIN STATUS
// ======================================================

function cexCheckLoginStatus() {

    const token =
        localStorage.getItem(
            "cexAuthToken"
        );


    const customer =
        localStorage.getItem(
            "cexCustomer"
        );


    if (
        token &&
        customer
    ) {

        try {

            const customerData =
                JSON.parse(
                    customer
                );


            console.log(
                "Cloud Eats customer logged in:",
                customerData.name
            );

        }

        catch (error) {

            console.error(
                "Customer data error:",
                error
            );

        }

    }

}


// ======================================================
// MODAL CLICK OUTSIDE
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const loginModal =
            document.getElementById(
                "cexLoginModal"
            );


        if (loginModal) {

            loginModal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target ===
                        this
                    ) {

                        cexCloseLogin();

                    }

                }
            );

        }


        cexCheckLoginStatus();


        console.log(
            "Cloud Eats website loaded successfully."
        );

    }
);


// ======================================================
// ESC KEY
// ======================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            cexCloseLogin();

        }

    }
);