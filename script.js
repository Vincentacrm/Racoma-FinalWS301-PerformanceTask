
const form = document.getElementById("registrationForm");
const successMessage = document.getElementById("successMessage");

const passwordFields = [
  document.getElementById("password"),
  document.getElementById("confirmPassword")
];

const visibilityButtons = [
  ...document.querySelectorAll(".toggle-visibility")
];

// Read custom data-* attributes through dataset.
const requiredFields = [
  ...form.querySelectorAll("[data-required='true']")
];

const phonePattern = /^09\d{9}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function showError(field, message) {
  field.classList.add("error");

  const errorElement = document.getElementById(`${field.id}Error`);

  if (errorElement) {
    errorElement.textContent = message;
  }
}

function clearError(field) {
  field.classList.remove("error");

  const errorElement = document.getElementById(`${field.id}Error`);

  if (errorElement) {
    errorElement.textContent = "";
  }
}

function getFieldValue(field) {
  return field.type === "checkbox"
    ? field.checked
    : field.value.trim();
}

function validateField(field) {
  const value = getFieldValue(field);
  const label = field.dataset.label || field.name;

  clearError(field);

  if (field.type === "checkbox") {
    if (!value) {
      showError(field, "Please agree before submitting the form.");
      return false;
    }

    return true;
  }

  if (field.tagName === "SELECT" && !value) {
    showError(field, `Please select your ${label.toLowerCase()}.`);
    return false;
  }

  if (!value) {
    showError(field, `${label} is required.`);
    return false;
  }

  if (field.id === "email" && !emailPattern.test(value)) {
    showError(
      field,
      "Enter a valid email address, such as name@example.com."
    );
    return false;
  }

  if (field.id === "phone" && !phonePattern.test(value)) {
    showError(
      field,
      "Enter an 11-digit Philippine mobile number starting with 09."
    );
    return false;
  }

  if (field.id === "dob") {
    const selectedDate = new Date(`${value}T00:00:00`);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate > today
    ) {
      showError(field, "Date of birth cannot be in the future.");
      return false;
    }
  }

  if (field.id === "password" && value.length < 8) {
    showError(field, "Password must contain at least 8 characters.");
    return false;
  }

  if (
    field.id === "confirmPassword" &&
    value !== passwordFields[0].value
  ) {
    showError(field, "Passwords do not match.");
    return false;
  }

  return true;
}

function validateGender() {
  const selectedGender = form.querySelector(
    "input[name='gender']:checked"
  );

  const genderError = document.getElementById("genderError");
  const genderGroup = form.querySelector("fieldset");

  genderError.textContent = "";
  genderGroup.classList.remove("error");

  if (!selectedGender) {
    genderError.textContent = "Please select a gender option.";
    genderGroup.classList.add("error");
    return false;
  }

  return true;
}

// Validate the form before showing the success message.
form.addEventListener("submit", function(event) {
  event.preventDefault();

  let formIsValid = true;

  requiredFields.forEach(function(field) {
    if (!validateField(field)) {
      formIsValid = false;
    }
  });

  if (!validateGender()) {
    formIsValid = false;
  }

  if (formIsValid) {
    successMessage.hidden = false;

    form.querySelectorAll(".error").forEach(function(field) {
      field.classList.remove("error");
    });

    successMessage.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  } else {
    successMessage.hidden = true;

    const firstInvalidField = form.querySelector(".error");

    if (firstInvalidField) {
      firstInvalidField.focus();
    }
  }
});

// Clear field errors when the user corrects the information.
requiredFields.forEach(function(field) {
  const eventName =
    field.type === "checkbox" || field.tagName === "SELECT"
      ? "change"
      : "input";

  field.addEventListener(eventName, function() {
    validateField(field);

    if (field.id === "password" && passwordFields[1].value) {
      validateField(passwordFields[1]);
    }

    if (field.id === "confirmPassword" && passwordFields[0].value) {
      validateField(passwordFields[0]);
    }
  });
});

// Validate gender selection.
form.querySelectorAll("input[name='gender']").forEach(function(radio) {
  radio.addEventListener("change", validateGender);
});

// Show or hide each password independently.
visibilityButtons.forEach(function(button) {
  button.addEventListener("click", function() {
    const field = document.getElementById(button.dataset.target);

    // Required classList.toggle() and attribute manipulation.
    const isShowing = button.classList.toggle("showing");

    field.setAttribute("type", isShowing ? "text" : "password");

    const action = isShowing ? "Hide" : "Show";
    const label =
      field.id === "password" ? "password" : "confirm password";

    button.setAttribute("aria-pressed", String(isShowing));
    button.setAttribute("aria-label", `${action} ${label}`);
    button.setAttribute("title", `${action} ${label}`);

    if (isShowing) {
      button.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/>
          <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a15 15 0 0 1-3.2 3.9M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10 10 0 0 0 4-.8"/>
        </svg>`;
    } else {
      button.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>`;
    }
  });
});

// Reset the form and restore the original state.
form.addEventListener("reset", function() {
  window.setTimeout(function() {
    requiredFields.forEach(clearError);

    document.getElementById("genderError").textContent = "";
    form.querySelector("fieldset").classList.remove("error");

    successMessage.hidden = true;

    visibilityButtons.forEach(function(button) {
      button.classList.remove("showing");
      button.setAttribute("aria-pressed", "false");

      const label =
        button.dataset.target === "password"
          ? "password"
          : "confirm password";

      button.setAttribute("aria-label", `Show ${label}`);
      button.setAttribute("title", `Show ${label}`);

      button.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>`;
    });

    passwordFields.forEach(function(field) {
      field.setAttribute("type", "password");
    });
  }, 0);
});
