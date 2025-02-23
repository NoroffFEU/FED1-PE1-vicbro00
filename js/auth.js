document.addEventListener("DOMContentLoaded", () => {
    const message = document.getElementById("message");

    //Check if this is the register page
    if (window.location.pathname.includes("/account/register.html")) {
        document.getElementById("signUpBtn").addEventListener("click", (event) => {
            event.preventDefault();
            registerUser();
        });
    }

    //Check if this is the login page
    if (window.location.pathname.includes("/account/login.html")) {
        document.getElementById("loginForm").addEventListener("submit", (event) => {
            event.preventDefault();
            login();
        });
    }
});

//Function to check if user is logged in
function isLoggedIn() {
    return localStorage.getItem("jwt") !== null;
}

//Redirect if not logged in
function redirectIfNotLoggedIn() {
    if (!isLoggedIn()) {
        alert("You must be logged in to access this page.");
        window.location.href = "/account/login.html";
    }
}

//Handles user registration
function registerUser() {
    const userData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        bio: document.getElementById("bio").value,
        bannerUrl: document.getElementById("bannerUrl").value,
        bannerAlt: document.getElementById("bannerAlt").value
    };

    if (!userData.name || !userData.email || !userData.password) {
        message.textContent = "Please fill in all required fields.";
        return;
    }

    fetch("https://v2.api.noroff.dev/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
    })
    .then(response => response.json().then(data => {
        if (!response.ok) throw new Error(data.errors?.[0]?.message || "Registration failed");
        return data;
    }))
    .then(() => {
        alert("Registration successful! You can now log in.");
        window.location.href = "/account/login.html";
    })
    .catch(error => {
        console.error("Error during registration:", error);
        message.textContent = error.message || "An error occurred. Please try again.";
    });
}

//Handles user login
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please fill in both email and password fields.");
        return;
    }

    fetch("https://v2.api.noroff.dev/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json().then(data => {
        if (!response.ok) throw new Error(data.message || "Login failed");
        return data;
    }))
    .then(data => {
        const accessToken = data.data.accessToken;
        localStorage.setItem("jwt", accessToken);
        localStorage.setItem("email", email.toLowerCase());

        // Log the token and other information to the console
        console.log("Access Token:", accessToken);
        console.log("User Email:", email);
        console.log("Login Response Data:", data);

        alert("You are now signed in!");
        window.location.href = "/index.html";
    })
    .catch(error => {
        console.error("Error during login:", error);
        alert(error.message || "An error occurred. Please try again.");
    });
}