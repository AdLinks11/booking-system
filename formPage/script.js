/* DOM ELEMENT SELECTORS */
const openBtn = document.querySelector(".menu-icon-form");
const sidebarForm = document.querySelector(".sidebarForm");
const schoolLogo = document.querySelector(".school-logo");


// Sidebar Functionality
function showsidebarForm() {
    sidebarForm.classList.add("active");
    document.querySelector("main").setAttribute("aria-hidden", "true");
}

function hidesidebarForm() {
    sidebarForm.classList.remove("active");
    document.querySelector("main").removeAttribute("aria-hidden");
}

if (openBtn) openBtn.addEventListener("click", showsidebarForm);
if (sidebarForm) {
    const closeBtn = sidebarForm.querySelector(".fa-x");
    if (closeBtn) closeBtn.addEventListener("click", hidesidebarForm);
}

// Initialize eye icons when page loads
document.addEventListener('DOMContentLoaded', setupEyeIcons);

let form, emailField, emailInput, passField, createPasswordInput, cPassField, confirmPasswordInput;

// Check if we're on login or signup page
if (document.getElementById('email_login')) {
    // Login page elements
    form = document.querySelector("form");
    emailInput = document.getElementById('email_login');
    createPasswordInput = document.getElementById('password_login');
} else {
    // Signup page elements
    form = document.querySelector("form");
    emailField = form.querySelector(".email-field");
    emailInput = emailField?.querySelector(".userEmail");
    passField = form.querySelector(".create-password");
    createPasswordInput = passField?.querySelector(".password");
    cPassField = form.querySelector(".confirm-password");
    confirmPasswordInput = cPassField?.querySelector(".cPassword");
}

// Email Validation (only for signup, skip for login)
function checkEmail() {
    // Skip email format validation for login form
    if (form.action.includes('/login')) {
        return true; // Let the server validate the email
    }

    if (!emailInput) return true; 
    
    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!emailInput.value.match(emailPattern)) {
        emailField?.classList.add("invalid");
        return false;
    }
    emailField?.classList.remove("invalid");
    return true;
}

// Password Validation (only for signup, skip for login)
function createPass() {
    // Skip password requirements validation for login form
    if (form.action.includes('/login')) {
        return true; // Let the server validate the password
    }

    if (!createPasswordInput) return true; 
    
    const passPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@51%*?&!])[A-Za-z\d@51%*?&!]{8,}$/;
    if (!createPasswordInput.value.match(passPattern)) {
        passField?.classList.add("invalid");
        return false;
    }
    passField?.classList.remove("invalid");
    return true;
}

// Confirm Password Validation (only for signup, skip for login)
function confirmPass() {
    // Skip confirm password validation for login form
    if (form.action.includes('/login')) {
        return true; 
    }

    if (!confirmPasswordInput) return true; 
    
    if (createPasswordInput.value !== confirmPasswordInput.value || confirmPasswordInput.value === "") {
        cPassField?.classList.add("invalid");
        return false;
    }
    cPassField?.classList.remove("invalid");
    return true;
}

// Function to show error message dynamically
function showErrorMessage(message, containerClass) {
    const errorContainer = document.querySelector(`.${containerClass}`);
    if (!errorContainer) return;

    // Clear any existing error messages
    errorContainer.innerHTML = '';

    // Create the error message element
    const errorDiv = document.createElement('span');
    errorDiv.classList.add('error', 'login-error');
    errorDiv.innerHTML = `
        <p class="error-messages">${message}</p>
        <i class='bx bx-x'></i>
    `;

    // Append the error message to the container
    errorContainer.appendChild(errorDiv);

    // Add click event to the "X" icon to remove the error message
    const closeIcon = errorDiv.querySelector('.bx-x');
    closeIcon.addEventListener('click', () => {
        errorDiv.classList.add('fade-out');
        setTimeout(() => {
            errorDiv.remove();
        }, 300); // Match the transition duration in CSS (0.3s)
    });
}

// Password Visibility Toggle (works for both forms)
function setupEyeIcons() {
    const eyeIcons = document.querySelectorAll(".eye-icon");
    eyeIcons.forEach((eyeIcon) => {
        eyeIcon.addEventListener("click", () => {
            const pInput = eyeIcon.parentElement.querySelector("input");
            if (pInput) {
                if (pInput.type === "password") {
                    eyeIcon.classList.replace("bxs-hide", "bxs-show");
                    pInput.type = "text";
                } else {
                    eyeIcon.classList.replace("bxs-show", "bxs-hide");
                    pInput.type = "password";
                }
            }
        });
    });
}

// Form Submission
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Disable the submit button to prevent multiple submissions
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        const isEmailValid = checkEmail();
        const isPasswordValid = createPass();
        const isConfirmValid = confirmPass();
        const termsCheck = document.getElementById("termsCheck");
        const isTermsChecked = termsCheck ? termsCheck.checked : true;

        if (!isEmailValid || !isPasswordValid || !isConfirmValid || !isTermsChecked) {
            if (!isTermsChecked) {
                alert("You must agree to the Privacy Policy and Terms of Service to continue.");
            }
            submitButton.disabled = false; // Re-enable the button
            return;
        }

        try {
            const formData = new URLSearchParams();
            for (const pair of new FormData(form)) {
                formData.append(pair[0], pair[1]);
            }

            console.log('Submitting form to:', form.action);
            console.log('Form data:', formData.toString());

            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers.get('content-type'));

            // Check if the response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Response is not JSON');
            }

            const result = await response.json();
            console.log('Response body:', result);

            if (response.ok) {
                alert(result.message || 'Success!');
                // Handle success based on the form type
                if (form.action.includes('/signup') && result.redirectUrl) {
                    // Redirect to the login page
                    const redirectPath = new URL(result.redirectUrl, window.location.origin).href;
                    window.location.replace(redirectPath);
                } else if (form.action.includes('/login') && result.redirect) {
                    // For login, redirect to the homepage
                    const redirectPath = new URL(result.redirect, window.location.origin).href;
                    window.location.replace(redirectPath);
                } else {
                    console.error('No redirect path provided in response');
                    alert('Success, but no redirect path provided.');
                }
            } else {
                // Customize error message for login
                if (form.action.includes('/login') && result.error === 'Invalid email or password') {
                    showErrorMessage('The email or password is incorrect', 'error-container');
                } else {
                    alert(result.error || 'An error occurred');
                }
            }
        } catch (error) {
            console.error('Fetch error:', error);
            if (error.message === 'Response is not JSON') {
                alert('An error occurred: Server response was not in the expected format. Please check the server logs.');
            } else if (error.message.includes('Failed to fetch')) {
                alert('An error occurred: Unable to connect to the server. Please check your network connection and try again.');
            } else {
                alert('An error occurred while submitting the form: ' + error.message);
            }
        } finally {
            // Re-enable the submit button after the request completes
            submitButton.disabled = false;
        }
    });
}

// Sidebar Functionality
function showsidebarForm() {
    sidebarForm.classList.add("active");
    document.querySelector("main").setAttribute("aria-hidden", "true");
}

function hidesidebarForm() {
    sidebarForm.classList.remove("active");
    document.querySelector("main").removeAttribute("aria-hidden");
}

if (openBtn) openBtn.addEventListener("click", showsidebarForm);
if (sidebarForm) {
    const closeBtn = sidebarForm.querySelector(".fa-x");
    if (closeBtn) closeBtn.addEventListener("click", hidesidebarForm);
}

// Initialize eye icons when page loads
document.addEventListener('DOMContentLoaded', setupEyeIcons);

