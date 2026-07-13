/* 
    Name: Lizeth Aleman Bernal  
    File: patientintakeform4.js
    Date Created: 2026-07-11
    Date Updated: 2023-07-12
    Version: 2.3
    Purpose: Homework 4 javascript to validate form data and display it in a table format. 
            Also fetches text from a file and displays it in the page.
*/

/* miz of modzilla,zippopotamus, ai, and w3schools get cookies and local storage code */
async function getZip(zipCode) {
  var normalizedZip = String(zipCode || "").trim().split("-")[0];

  if (!/^\d{5}$/.test(normalizedZip)) {
    return null;
  }

  const url = "https://api.zippopotam.us/us/" + normalizedZip;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    if (!result.places || !result.places.length) {
      return null;
    }

    return {
      city: result.places[0]["place name"] || "",
      stateAbbreviation: result.places[0]["state abbreviation"] || ""
    };
  } catch (error) {
    return null;
  }
}

async function autofillCityStateFromZip() 
{
  var zipInput = document.getElementById("zip");
  var cityInput = document.getElementById("city");
  var stateSelect = document.getElementById("state");
  var zipFeedback = document.getElementById("zip_text");

  if (!zipInput) {
    return;
  }

  var zipValue = zipInput.value.trim();

  if (!/^\d{5}(-\d{4})?$/.test(zipValue)) {
    return;
  }

  var zipData = await getZip(zipValue);

  if (!zipData) 
    {
    if (zipFeedback)
      {
      zipFeedback.textContent = "ZIP code not found in lookup service.";
      zipFeedback.style.color = "#ff1a1a";
    }
    return;
    }

  if (cityInput && !cityInput.value.trim()) {
    cityInput.value = zipData.city;
  }

  if (stateSelect && !stateSelect.value) {
    stateSelect.value = zipData.stateAbbreviation;
  }

  if (zipFeedback) {
    zipFeedback.textContent = "ZIP verified. City/state updated.";
    zipFeedback.style.color = "#00ff00";
  }
}


var formLocalStorageKey = "patientIntakeForm4Draft";
var firstNameCookieKey = "patientFirstName";

function setFirstNameCookie(firstName) {
  var value = encodeURIComponent(String(firstName || "").trim());
  var maxAge = value ? "max-age=" + (60 * 60 * 24 * 2) + ";" : "max-age=0;";
  document.cookie = firstNameCookieKey + "=" + value + ";" + maxAge + "path=/;SameSite=Lax";
}

function getFirstNameCookie() {
  var name = firstNameCookieKey + "=";
  var parts = document.cookie.split(";");
  var i;

  for (i = 0; i < parts.length; i++) {
    var cookie = parts[i].trim();
    if (cookie.indexOf(name) === 0) {
      return decodeURIComponent(cookie.substring(name.length));
    }
  }

  return "";
}

function saveFormDraft() {
  var form = document.getElementById("medform");
  var firstNameInput = document.getElementById("firstname");

  if (!form) {
    return;
  }

  var draft = {};
  var i;

  for (i = 0; i < form.elements.length; i++) {
    var element = form.elements[i];

    if (!element || !element.id) {
      continue;
    }

    if (element.type === "button" || element.type === "submit" || element.type === "reset") {
      continue;
    }

    if (element.type === "checkbox" || element.type === "radio") {
      draft[element.id] = element.checked;
    } else {
      draft[element.id] = element.value;
    }
  }

  localStorage.setItem(formLocalStorageKey, JSON.stringify(draft));

  if (firstNameInput) {
    setFirstNameCookie(firstNameInput.value);
  }
}

function restoreFormDraft() {
  var form = document.getElementById("medform");
  var feelingSlider = document.getElementById("feeling");
  var rangeDisplay = document.getElementById("rangedisplay");

  if (!form) {
    return false;
  }

  var draftString = localStorage.getItem(formLocalStorageKey);

  if (!draftString) {
    return false;
  }

  var draft;

  try {
    draft = JSON.parse(draftString);
  } catch (error) {
    localStorage.removeItem(formLocalStorageKey);
    return false;
  }

  var hasAnyData = false;
  var i;

  for (i = 0; i < form.elements.length; i++) {
    var element = form.elements[i];

    if (!element || !element.id) {
      continue;
    }

    if (!Object.prototype.hasOwnProperty.call(draft, element.id)) {
      continue;
    }

    hasAnyData = true;

    if (element.type === "checkbox" || element.type === "radio") {
      element.checked = Boolean(draft[element.id]);
    } else {
      element.value = draft[element.id];
    }
  }


  if (feelingSlider && rangeDisplay) {
    rangeDisplay.textContent = feelingSlider.value;
  }

  checkAddressLine1();
  checkAddressLine2();
  checkCity();
  checkZip();
  checkEmail();
  checkPhone();

  return hasAnyData;
}

function checkSavedDraft() {
  var draftString = localStorage.getItem(formLocalStorageKey);
  var cookieFirstName = getFirstNameCookie();

  if (!draftString && !cookieFirstName) {
    return;
  }

  var draft = {};
  var hasDraft = false;

  if (draftString) {
    try {
      draft = JSON.parse(draftString);
      hasDraft = true;
    } catch (error) {
      localStorage.removeItem(formLocalStorageKey);
    }
  }

  var firstName = draft.firstname ? String(draft.firstname) : cookieFirstName;
  var promptName = firstName ? " " + firstName : "";
  var message = "Welcome back" + promptName +  " OK to if its you, or Cancel to clear it.";

  if (confirm(message)) {
    var firstNameInput = document.getElementById("firstname");

    if (hasDraft) {
      restoreFormDraft();
    }

    if (firstNameInput && !firstNameInput.value.trim() && cookieFirstName) {
      firstNameInput.value = cookieFirstName;
    }
  } else {
    localStorage.removeItem(formLocalStorageKey);
    setFirstNameCookie("");
  }
}

function getcurrentdate() 
{
  var today = new Date();
  let current = today.toLocaleDateString();
  document.getElementById("currentdate").textContent = current;
}

window.addEventListener("load", function() 
{
  getcurrentdate();
  checkSavedDraft();

  var modal = document.getElementById("dataModal");
  if (modal) 
    {
      modal.addEventListener("click", function(event) 
    {
      if (event.target === modal) 
        {
          closeModal();
        }
    });
  }

  var feelingSlider = document.getElementById("feeling");
  var rangeDisplay = document.getElementById("rangedisplay");

  if (feelingSlider && rangeDisplay) 
    {
      rangeDisplay.textContent = feelingSlider.value;

      feelingSlider.addEventListener("input", function() 
    {
      rangeDisplay.textContent = feelingSlider.value;

      if (feelingSlider.dataset.touched === "true") 
        {
          checkWellness();
        }
    });

    feelingSlider.addEventListener("blur", function() 
    {
      feelingSlider.dataset.touched = "true";
      checkWellness();
    });
  }

  var form = document.getElementById("medform");
  var output = document.getElementById("outputformdata");
  var passwordInput = document.getElementById("password");
  var confirmPasswordInput = document.getElementById("re-enter");
  var birthdateInput = document.getElementById("birthdate");
  var socialSecurityInput = document.getElementById("socialSecurity");
  var addressLine1Input = document.getElementById("addr1");
  var addressLine2Input = document.getElementById("addr2");
  var cityInput = document.getElementById("city");
  var firstNameInput = document.getElementById("firstname");
  var midInitInput = document.getElementById("midinit");
  var lastNameInput = document.getElementById("lastname");
  var zipInput = document.getElementById("zip");
  var emailInput = document.getElementById("email");
  var phoneInput = document.getElementById("phone");
  var descriptionInput = document.getElementById("description");
  var usernameInput = document.getElementById("username");

  if (passwordInput && confirmPasswordInput) 
    {
      passwordInput.addEventListener("input", validatePasswordMatch);
      passwordInput.addEventListener("blur", validatePasswordMatch);
      confirmPasswordInput.addEventListener("input", validatePasswordMatch);
      confirmPasswordInput.addEventListener("blur", validatePasswordMatch);
    }

  if (birthdateInput) 
    {
      birthdateInput.addEventListener("input", validatebirthdate);
      birthdateInput.addEventListener("change", validatebirthdate);
      birthdateInput.addEventListener("blur", validatebirthdate);
    }

  if (socialSecurityInput) 
    {
      socialSecurityInput.addEventListener("blur", checkSocialSecurity);
    }

  if (addressLine1Input) 
    {
      addressLine1Input.addEventListener("blur", checkAddressLine1);
    }

  if (addressLine2Input) 
    {
      addressLine2Input.addEventListener("blur", checkAddressLine2);
    }

  if (cityInput) 
    {
      cityInput.addEventListener("blur", checkCity);
    }

  if (firstNameInput) 
    {
      firstNameInput.addEventListener("blur", checkfirstname);
    }

  if (midInitInput) 
    {
      midInitInput.addEventListener("blur", checkmidinit);
      midInitInput.addEventListener("input", function() 
        {
          midInitInput.value = midInitInput.value.toUpperCase();
          checkmidinit();
        });
    }

  if (lastNameInput) 
    {
      lastNameInput.addEventListener("blur", checklastname);
    }

  if (zipInput) 
    {
      zipInput.addEventListener("blur", checkZip);
      zipInput.addEventListener("blur", function() {
        autofillCityStateFromZip();
      });
    }

  if (emailInput) 
    {
      emailInput.addEventListener("blur", function() 
        {
          emailInput.dataset.touched = "true";
          checkEmail();
        });

    emailInput.addEventListener("input", function() 
      {
        if (emailInput.dataset.touched === "true") 
          {
            checkEmail();
          }
      });
    }

  if (phoneInput) 
    {
      phoneInput.addEventListener("blur", function() 
        {
          phoneInput.dataset.touched = "true";
          checkPhone();
        });

      phoneInput.addEventListener("input", function() 
        {
          if (phoneInput.dataset.touched === "true") 
            {
              checkPhone();
            }
        });
    }

  if (descriptionInput) 
    {
      descriptionInput.addEventListener("blur", function() 
        {
          descriptionInput.dataset.touched = "true";
          checkDescription();
        });

      descriptionInput.addEventListener("input", function() 
        {
          if (descriptionInput.dataset.touched === "true") 
            {
              checkDescription();
            }
        });
    }

  if (usernameInput)  
    {
      usernameInput.addEventListener("blur", function() 
        {
          usernameInput.dataset.touched = "true";
          checkUsername();
        });

      usernameInput.addEventListener("input", function() 
        {
          if (usernameInput.dataset.touched === "true") 
            {
              checkUsername();
            }
        });
      }

  validatePasswordMatch();
  validatebirthdate();
  checkSocialSecurity();
  checkAddressLine1();
  checkAddressLine2();
  checkCity();
  checkZip();
  checkEmail();
  checkPhone();
  checkDescription();
  checkUsername();
  checkWellness();

  if (form && output) 
  {
    form.addEventListener("input", saveFormDraft);
    form.addEventListener("change", saveFormDraft);

    form.addEventListener("input", function() 
      {
        output.innerHTML = "";
        output.className = "";
      });

    form.addEventListener("click", function() 
      {
        output.innerHTML = "";
        output.className = "";
      });

    form.addEventListener("submit", function(event) 
    {
      if (!checkfirstname() || !checkmidinit() || !checklastname() || !validatePasswordMatch() || !validatebirthdate() || !checkSocialSecurity() || !checkZip() || !checkEmail() || !checkPhone() || !checkDescription() || !checkUsername() || !checkWellness()) 
        {
          event.preventDefault();
        }
    });
  }
});

function erasedata() 
{
  var output = document.getElementById("outputformdata");
    localStorage.removeItem(formLocalStorageKey);
    setFirstNameCookie("");
    if (output) 
      {
        output.innerHTML = "Your form has been cleared";
        output.className = "erase-message";
      }
}

function closeModal() 
{
  var modal = document.getElementById("dataModal");
      if (modal) 
        {
          modal.style.display = "none";
        }
} 
function escapeHtml(value) 
{
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getDisplayValue(element) 
{
  var fieldName = (element.name || "").toLowerCase();

    if (element.type === "password" || fieldName === "password" || fieldName === "re-enter") 
      {
        return "••••••••";
      }

    if (fieldName === "wellness" || fieldName === "feeling") 
      {
        return element.value + " / 10";
      }

        return element.value;
}

function validatePasswordRequirements() 
{
    var passwordInput = document.getElementById("password");
    var requirements = document.getElementById("password_requirements");

      if (!passwordInput || !requirements) 
        {
          return true;
        }

    var password = passwordInput.value;
    var checks = [
      {
        label: "Password must be 8-25 characters",
        passed: password.length >= 8 && password.length <= 25
      },
      {
        label: "Contain at least one uppercase letter",
        passed: /[A-Z]/.test(password)
      },
      {
        label: "Contain at least one number",
        passed: /\d/.test(password)
      },
      {
        label: "Contain at least one special character",
        passed: /[^A-Za-z0-9]/.test(password)
      }
    ];

    var html = "";
      checks.forEach(function(check) 
        {
          var color = check.passed ? "#00ff00" : "#ff1a1a";
          var message = check.passed ? "Requirement matched" : check.label;
          html += "<div style='color:" + color + "; font-weight: bold; margin: 3px 0;'>" + escapeHtml(message) + "</div>";
        });

      requirements.innerHTML = html;
      return checks.every(function(check) 
        {
          return check.passed;
        });
}

function validatePasswordMatch() 
{
  validatePasswordRequirements();

  var passwordInput = document.getElementById("password");
  var confirmPasswordInput= document.getElementById("re-enter");
  var feedback = document.getElementById("password_match_text");

  if (!passwordInput || !confirmPasswordInput) 
    {
      return true;
    }

  var password = passwordInput.value;
  var confirmPassword = confirmPasswordInput.value;

  if (confirmPassword.length === 0) 
    {
      if (feedback) 
        {
          feedback.textContent = "";
          feedback.style.color = "";
        }
      confirmPasswordInput.setCustomValidity("");
      return true;
    }

  if (password === confirmPassword) 
    {
      if (feedback) 
        {
          feedback.textContent = "Passwords match";
          feedback.style.color = "#00ff00";
        }
      confirmPasswordInput.setCustomValidity("");
      return true;
  }

  if (feedback) 
    {
      feedback.textContent = "Passwords do not match";
      feedback.style.color = "red";
    }
  confirmPasswordInput.setCustomValidity("Passwords do not match");
  return false;
}

function validatebirthdate() 
{
  var birthdateInput = document.getElementById("birthdate");
  var feedback = document.getElementById("birthdate_text");

  if (!birthdateInput || !feedback) 
    {
    return true;
    }

  var birthdateValue = birthdateInput.value;

  if (!birthdateValue) 
    {
      feedback.textContent = "";
      feedback.style.color = "";
      birthdateInput.setCustomValidity("");
    return true;
    }

  var birthdate = new Date(birthdateValue + "T00:00:00");
  var today = new Date();
  var age = today.getFullYear() - birthdate.getFullYear();
  var monthDifference = today.getMonth() - birthdate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthdate.getDate())) 
    {
      age--;
    }

  if (isNaN(birthdate.getTime()) || age < 0 || age > 120) 
    {
      feedback.textContent = "Invalid birthdate";
      feedback.style.color = "#ff1a1a";
      birthdateInput.setCustomValidity("Invalid birthdate");
      return false;
    }

  feedback.textContent = "Valid birthdate";
  feedback.style.color = "#00ff00";
  birthdateInput.setCustomValidity("");
  return true;
}

function checkSocialSecurity() 
{
  var socialSecurityInput = document.getElementById("socialSecurity");
  var feedback = document.getElementById("socialSecurity_text");

  if (!socialSecurityInput || !feedback) 
    {
    return true;
    }

  var value = socialSecurityInput.value.trim();

  if (value.length === 0)
    {
      feedback.textContent = "";
      feedback.style.color = "";
      socialSecurityInput.setCustomValidity("");
      return true;
    }

  var isValid = /^\d{3}-?\d{2}-?\d{4}$/.test(value);

  if (isValid) 
    {
      feedback.textContent = "Valid Social Security Number";
      feedback.style.color = "#00ff00";
      socialSecurityInput.setCustomValidity("");
      return true;
    } else 
    {
      feedback.textContent = "Please enter a valid Social Security Number.";
      feedback.style.color = "#ff1a1a";
    socialSecurityInput.setCustomValidity("Revise Social Security Number");
    return false;
    }
}

function checkAddressLine1() 
{
  var addressInput = document.getElementById("addr1");
  var feedback = document.getElementById("address1");

  if (!addressInput || !feedback) 
    {
      return true;
    }

  var value = addressInput.value.trim();

  if (value.length === 0) 
    {
      feedback.textContent = "";
      feedback.style.color = "";
      addressInput.setCustomValidity("");
      return true;
    }

  var isValid = /^[A-Za-z0-9\s]{2,30}$/.test(value);

  if (isValid) 
    {
    feedback.textContent = "";
    feedback.style.color = "";
    addressInput.setCustomValidity("");
    return true;
    } 
      else 
      {
        feedback.textContent = "Please enter a valid address line 1.";
        feedback.style.color = "#ff1a1a";
        addressInput.setCustomValidity("Reformat Address Line 1");
        return false;
      }
} 

function checkAddressLine2() 
{
  var addressInput = document.getElementById("addr2");
  var feedback = document.getElementById("address2");

  if (!addressInput || !feedback) 
    {
      return true;
    }

  var value = addressInput.value.trim();

  if (value.length === 0) 
    {
      feedback.textContent = "";
      feedback.style.color = "";
      addressInput.setCustomValidity("");
      return true;
    }

  var isValid = /^[A-Za-z0-9\s]{2,30}$/.test(value);

  if (isValid) {
    feedback.textContent = "";
    feedback.style.color = "";
    addressInput.setCustomValidity("");
    return true;
  } else {
    feedback.textContent = "Please enter a valid address line 2.";
    feedback.style.color = "#ff1a1a";
    addressInput.setCustomValidity("Reformat Address Line 2");
    return false;
  }
}

function checkCity() {
  var cityInput = document.getElementById("city");
  var feedback = document.getElementById("city_text");

  if (!cityInput || !feedback) {
    return true;
  }

  var value = cityInput.value.trim();

  if (value.length === 0) {
    feedback.textContent = "";
    feedback.style.color = "";
    cityInput.setCustomValidity("");
    return true;
  }

  var isValid = /^[A-Za-z]{2,30}$/.test(value);

  if (isValid) {
    feedback.textContent = "";
    feedback.style.color = "";
    cityInput.setCustomValidity("");
    return true;
  } else {
    feedback.textContent = "Please enter a valid city.";
    feedback.style.color = "#ff1a1a";
    cityInput.setCustomValidity("City required");
    return false;
  }
}

function checkZip() {
  var zipInput = document.getElementById("zip");
  var feedback = document.getElementById("zip_text");

  if (!zipInput) {
    return true;
  }

  var value = zipInput.value.trim();

  if (value.length === 0) {
    if (feedback) {
      feedback.textContent = "";
      feedback.style.color = "";
    }
    zipInput.setCustomValidity("");
    return true;
  }

  var isValid = /^\d{5}(-\d{4})?$/.test(value);

  if (isValid) {
    if (feedback) {
      feedback.textContent = "";
      feedback.style.color = "";
    }
    zipInput.setCustomValidity("");
    return true;
  }

  if (feedback) {
    feedback.textContent = "Please enter a valid zip code.";
    feedback.style.color = "#ff1a1a";
  }
  zipInput.setCustomValidity("Zip/Postal Code Invalid");
  return false;
}

function checkEmail() {
  var emailInput = document.getElementById("email");
  var feedback = document.getElementById("email_text");

  if (!emailInput || !feedback) {
    return true;
  }

  var value = emailInput.value.trim();

  if (value.length === 0) {
    feedback.textContent = "";
    feedback.style.color = "";
    emailInput.setCustomValidity("");
    return true;
  }

  var isValid = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(value);

  if (isValid) {
    feedback.textContent = "";
    feedback.style.color = "";
    emailInput.setCustomValidity("");
    return true;
  }

  feedback.textContent = "Please enter a valid email address.";
  feedback.style.color = "#ff1a1a";
  emailInput.setCustomValidity("Invalid email address");
  return false;
}

function checkPhone() {
  var phoneInput = document.getElementById("phone");
  var feedback = document.getElementById("phone_text");

  if (!phoneInput || !feedback) {
    return true;
  }

  var value = phoneInput.value.trim();

  if (value.length === 0) {
    feedback.textContent = "";
    feedback.style.color = "";
    phoneInput.setCustomValidity("");
    return true;
  }

  var isValid = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/.test(value);

  if (isValid) {
    feedback.textContent = "";
    feedback.style.color = "";
    phoneInput.setCustomValidity("");
    return true;
  }

  feedback.textContent = "Please enter a valid phone number.";
  feedback.style.color = "#ff1a1a";
  phoneInput.setCustomValidity("Invalid phone number");
  return false;
}

function checkDescription() {
  var descriptionInput = document.getElementById("description");
  var feedback = document.getElementById("description_text");

  if (!descriptionInput || !feedback) {
    return true;
  }

  var value = descriptionInput.value.trim();

  if (value.length === 0) {
    feedback.textContent = "";
    feedback.style.color = "";
    descriptionInput.setCustomValidity("");
    return true;
  }

  var isValid = /^[A-Za-z0-9\s.,'"!?():;\/\-#&]{1,500}$/.test(value);

  if (isValid) {
    feedback.textContent = "";
    feedback.style.color = "";
    descriptionInput.setCustomValidity("");
    return true;
  }

  feedback.textContent = "Please use letters, numbers, and basic punctuation only.";
  feedback.style.color = "#ff1a1a";
  descriptionInput.setCustomValidity("Invalid symptoms description");
  return false;
}

function checkUsername() {
  var usernameInput = document.getElementById("username");
  var feedback = document.getElementById("username_text");

  if (!usernameInput || !feedback) {
    return true;
  }

  var value = usernameInput.value.trim();

  if (value.length === 0) {
    feedback.textContent = "";
    feedback.style.color = "";
    usernameInput.setCustomValidity("Username Required");
    return false;
  }

  var isValid = /^[A-Za-z][A-Za-z0-9_-]{4,19}$/.test(value);

  if (isValid) {
    feedback.textContent = "";
    feedback.style.color = "";
    usernameInput.setCustomValidity("");
    return true;
  }

  feedback.textContent = "Username must start with a letter and be 5-20 characters.";
  feedback.style.color = "#ff1a1a";
  usernameInput.setCustomValidity("Username Required");
  return false;
}

function checkWellness() {
  var feelingSlider = document.getElementById("feeling");
  var feedback = document.getElementById("wellness_text");

  if (!feelingSlider) {
    return true;
  }

  var numericValue = Number(feelingSlider.value);
  var isValid = Number.isInteger(numericValue) && numericValue >= 1 && numericValue <= 10;

  if (isValid) {
    if (feedback) {
      feedback.textContent = "";
      feedback.style.color = "";
    }
    feelingSlider.setCustomValidity("");
    return true;
  }

  if (feedback) {
    feedback.textContent = "Please choose a wellness value from 1 to 10.";
    feedback.style.color = "#ff1a1a";
  }
  feelingSlider.setCustomValidity("Wellness must be between 1 and 10");
  return false;
}

function checkfirstname() {
  var firstNameInput = document.getElementById("firstname");
  var feedback = document.getElementById("firstname_text");

  if (!firstNameInput || !feedback) {
    return false;
  }

  var firstName = firstNameInput.value.trim();
  var isValid = /^[A-Za-z'-]{2,30}$/.test(firstName);

  if (isValid) {
    feedback.textContent = "";
    feedback.style.color = "#00ff00";
    firstNameInput.setCustomValidity("");
    return true;
  } else {
    feedback.textContent = "Please enter a valid first name.";
    feedback.style.color = "#ff1a1a";
    firstNameInput.setCustomValidity("First Name Invalid");
    return false;
  }
}

function checkmidinit() {
  var midInitInput = document.getElementById("midinit");
  var feedback = document.getElementById("midinit_text");

  if (!midInitInput || !feedback) {
    return false;
  }

  var midInit = midInitInput.value.trim().toUpperCase();
  midInitInput.value = midInit;
  var isValid = midInit.length === 0 || /^[A-Za-z]{1}$/.test(midInit);

  if (isValid) {
    feedback.textContent = "";
    feedback.style.color = "#00ff00";
    midInitInput.setCustomValidity("");
    return true;
  } else {
    feedback.textContent = "Please enter a valid middle initial.";
    feedback.style.color = "#ff1a1a";
    midInitInput.setCustomValidity("Middle Initial Invalid");
    return false;
  }
}

function checklastname() {
  var lastNameInput = document.getElementById("lastname");
  var feedback = document.getElementById("lastname_text");

  if (!lastNameInput || !feedback) {
    return false;
  }

  var lastName = lastNameInput.value.trim();
  var isValid = /^[A-Za-z'2-5 -]{2,30}$/.test(lastName);

  if (isValid) {
    feedback.textContent = "";
    feedback.style.color = "#00ff00";
    lastNameInput.setCustomValidity("");
    return true;
  } else {
    feedback.textContent = "Please enter a valid last name.";
    feedback.style.color = "#ff1a1a";
    lastNameInput.setCustomValidity("Last Name Invalid");
    return false;
  }
}

function verifydata() 
{
  var formcontents = document.getElementById("medform");
  var modalTableContainer = document.getElementById("modalTableContainer");
  var tableRows = "";
  var datatype;
  var i;

    for (i = 0; i < formcontents.length; i++) 
    {
      console.log("item: " + i + " " + formcontents.elements[i].name + " = " + formcontents.elements[i].value);
      datatype = formcontents.elements[i].type;
    switch (datatype) 
    {
      case "checkbox":
        if (formcontents.elements[i].checked) 
        {
          tableRows += "<tr><td>" + escapeHtml(formcontents.elements[i].name) + "</td><td>" + escapeHtml(formcontents.elements[i].value) + "</td></tr>";
        }
        break;
      case "radio":
        if (formcontents.elements[i].checked) 
        {
          tableRows += "<tr><td>" + escapeHtml(formcontents.elements[i].name) + "</td><td>" + escapeHtml(formcontents.elements[i].value) + "</td></tr>";
        }
        break;
      case "button":
      case "submit":
      case "reset":
        break;
      default:
        if (formcontents.elements[i].name) 
        {
          var displayValue = getDisplayValue(formcontents.elements[i]);
          tableRows += "<tr><td>" + escapeHtml(formcontents.elements[i].name) + "</td><td>" + escapeHtml(displayValue) + "</td></tr>";
        }
    }
    }

    if (modalTableContainer) 
    {
      modalTableContainer.innerHTML = "<table class='modal-table'><thead><tr><th>Question</th><th>Value</th></tr></thead><tbody>" + tableRows + "</tbody></table>";
      document.getElementById("dataModal").style.display = "flex";
    }
  }
