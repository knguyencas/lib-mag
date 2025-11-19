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

function loadUsers() {
  const raw = localStorage.getItem("demoUsers");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem("demoUsers", JSON.stringify(users));
}

function setupRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  const usernameInput = document.getElementById("regUsername");
  const passwordInput = document.getElementById("regPassword");
  const confirmInput = document.getElementById("regConfirmPassword");
  const termsCheckbox = document.getElementById("regTerms");

  const usernameError = document.getElementById("regUsernameError");
  const passwordError = document.getElementById("regPasswordError");
  const confirmError = document.getElementById("regConfirmPasswordError");
  const termsError = document.getElementById("regTermsError");
  const successBox = document.getElementById("registerSuccess");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    usernameError.textContent = "";
    passwordError.textContent = "";
    confirmError.textContent = "";
    termsError.textContent = "";
    successBox.style.display = "none";

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirm = confirmInput.value;

    let valid = true;

    if (!username) {
      usernameError.textContent = "Username is required.";
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

    const users = loadUsers();
    if (users[username]) {
      usernameError.textContent = "This username is already taken.";
      return;
    }

    users[username] = { password, createdAt: new Date().toISOString() };
    saveUsers(users);

    successBox.style.display = "block";
    form.reset();
  });

  const googleBtn = document.getElementById("regGoogleBtn");
  if (googleBtn) {
    googleBtn.addEventListener("click", () => {
      alert(
        "Google sign-up demo.\nKhi có backend cậu sẽ gọi OAuth 2.0 / Google Identity ở đây."
      );
    });
  }
}

function setupLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const usernameInput = document.getElementById("loginUsername");
  const passwordInput = document.getElementById("loginPassword");

  const usernameError = document.getElementById("loginUsernameError");
  const passwordError = document.getElementById("loginPasswordError");
  const globalError = document.getElementById("loginErrorGlobal");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    usernameError.textContent = "";
    passwordError.textContent = "";
    globalError.style.display = "none";
    globalError.textContent = "";

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    let valid = true;

    if (!username) {
      usernameError.textContent = "Username is required.";
      valid = false;
    }
    if (!password) {
      passwordError.textContent = "Password is required.";
      valid = false;
    }

    if (!valid) return;

    const users = loadUsers();
    const user = users[username];

    if (!user || user.password !== password) {
      globalError.textContent = "Invalid username or password.";
      globalError.style.display = "block";
      return;
    }

    alert(`Welcome, ${username}! (demo login)`);
  });

  const googleBtn = document.getElementById("loginGoogleBtn");
  if (googleBtn) {
    googleBtn.addEventListener("click", () => {
      alert(
        "Google demo."
      );
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
