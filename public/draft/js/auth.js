function setupPasswordVisibility() {
  document.querySelectorAll(".input-wrapper").forEach((wrapper) => {
    const input = wrapper.querySelector("input[type='password']");
    const toggle = wrapper.querySelector(".toggle-password");
    if (!input || !toggle) return;

    toggle.textContent = "Show";

    const updateToggleVisibility = () => {
      if (document.activeElement === input || input.value.length > 0) {
        wrapper.classList.add("show-toggle");
      } else {
        wrapper.classList.remove("show-toggle");
      }
    };

    input.addEventListener("focus", updateToggleVisibility);
    input.addEventListener("blur", updateToggleVisibility);
    input.addEventListener("input", updateToggleVisibility);

    toggle.addEventListener("click", () => {
      if (input.type === "password") {
        input.type = "text";
        toggle.textContent = "Hide";
      } else {
        input.type = "password";
        toggle.textContent = "Show";
      }
      input.focus();
    });

    updateToggleVisibility();
  });
}

function setupRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  const usernameInput = document.getElementById("regUsername");
  const emailInput = document.getElementById("regEmail");
  const passwordInput = document.getElementById("regPassword");
  const confirmInput = document.getElementById("regConfirmPassword");
  const termsCheckbox = document.getElementById("regTerms");

  const usernameError = document.getElementById("regUsernameError");
  const emailError = document.getElementById("regEmailError");
  const passwordError = document.getElementById("regPasswordError");
  const confirmError = document.getElementById("regConfirmPasswordError");
  const termsError = document.getElementById("regTermsError");
  const successBox = document.getElementById("registerSuccess");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    usernameError.textContent = "";
    emailError.textContent = "";
    passwordError.textContent = "";
    confirmError.textContent = "";
    termsError.textContent = "";
    successBox.style.display = "none";

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirm = confirmInput.value;

    let valid = true;

    if (!username) {
      usernameError.textContent = "Username is required.";
      valid = false;
    } else if (username.length < 3) {
      usernameError.textContent = "Username must be at least 3 characters.";
      valid = false;
    }

    if (!email) {
      emailError.textContent = "Email is required.";
      valid = false;
    }

    if (!password) {
      passwordError.textContent = "Password is required.";
      valid = false;
    } else if (password.length < 8) {
      passwordError.textContent = "Password must be at least 8 characters.";
      valid = false;
    }

    if (!confirm) {
      confirmError.textContent = "Please re-enter your password.";
      valid = false;
    } else if (password !== confirm) {
      confirmError.textContent = "Passwords do not match.";
      valid = false;
    }

    if (!termsCheckbox.checked) {
      termsError.textContent = "You must accept the Terms and Conditions.";
      valid = false;
    }

    if (!valid) return;

    try {
      await AuthClient.register(username, email, password);

      successBox.style.display = "block";
      successBox.textContent = "Registration successful! Redirecting...";

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } catch (error) {
      if (error.message && error.message.toLowerCase().includes("exists")) {
        emailError.textContent = "This email or username is already taken.";
      } else {
        emailError.textContent =
          error.message || "Registration failed. Please try again.";
      }
    }
  });

  const googleBtn = document.getElementById("regGoogleBtn");
  if (googleBtn) {
    googleBtn.addEventListener("click", () => {
      alert("Google sign-up coming soon!");
    });
  }
}

function setupLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const identifierInput = document.getElementById("loginIdentifier");
  const passwordInput = document.getElementById("loginPassword");

  const identifierError = document.getElementById("loginIdentifierError");
  const passwordError = document.getElementById("loginPasswordError");
  const globalError = document.getElementById("loginErrorGlobal");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    identifierError.textContent = "";
    passwordError.textContent = "";
    globalError.style.display = "none";
    globalError.textContent = "";

    const identifier = identifierInput.value.trim();
    const password = passwordInput.value;

    let valid = true;

    if (!identifier) {
      identifierError.textContent = "Please enter your email or username.";
      valid = false;
    }

    if (!password) {
      passwordError.textContent = "Password is required.";
      valid = false;
    }

    if (!valid) return;

    try {
      await AuthClient.login(identifier, password);

      window.location.href = "index.html";
    } catch (error) {
      globalError.textContent =
        error.message || "Invalid email/username or password.";
      globalError.style.display = "block";
    }
  });

  const googleBtn = document.getElementById("loginGoogleBtn");
  if (googleBtn) {
    googleBtn.addEventListener("click", () => {
      alert("Google login coming soon!");
    });
  }
}

function setupHeaderNav() {
  const logo = document.querySelector(".logo");
  if (logo) {
    logo.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupPasswordVisibility();
  setupRegisterForm();
  setupLoginForm();
  setupHeaderNav();
});
