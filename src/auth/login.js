import t from "../i18n/index.js";

const form = document.getElementById("loginForm");
const identifiant = document.getElementById("identifiant");
const password = document.getElementById("password");
const button = document.getElementById("btnLogin");
const message = document.getElementById("message");
const toggle = document.getElementById("togglePassword");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    message.textContent = "";

    const matricule = identifiant.value.trim();
    const mdp = password.value.trim();

    if (!matricule || !mdp) {

        message.textContent = t.ERRORS.EMPTY_FIELDS;

        return;
    }

    button.disabled = true;
    button.textContent = "Connexion...";

    try {

        // Firebase arrivera ici

    } finally {

        button.disabled = false;
        button.textContent = "Se connecter";

    }

});


toggle.addEventListener("click", () => {

    if (password.type === "password") {

        password.type = "text";
        toggle.classList.replace("fa-eye", "fa-eye-slash");

    } else {

        password.type = "password";
        toggle.classList.replace("fa-eye-slash", "fa-eye");
    }

});