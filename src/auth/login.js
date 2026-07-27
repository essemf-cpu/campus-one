import { findUserByMatricule, login } from "./authService.js";
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
    message.style.color = "red";

    const matricule = identifiant.value.trim();
    const mdp = password.value.trim();

    if (!matricule || !mdp) {
        message.textContent = t.ERRORS.EMPTY_FIELDS;
        return;
    }

    button.disabled = true;
    button.textContent = "Connexion...";

    try {

        console.log("Étape 1 : Recherche de l'utilisateur");

        const agent = await findUserByMatricule(matricule);

        console.log("Étape 2 : Utilisateur trouvé", agent);

        await login(agent.email, mdp);

        sessionStorage.setItem(
    "agent",
    JSON.stringify(agent)
);

        console.log("Étape 3 : Authentification réussie");

        message.style.color = "green";
        message.textContent = t.SUCCESS.LOGIN;

        window.location.href = "../dashboards/agent/dashboard.html";

    } catch (error) {

        console.error(error);

        message.style.color = "red";

        switch (error.message) {

            case "USER_NOT_FOUND":
                message.textContent = t.ERRORS.USER_NOT_FOUND;
                break;

            default:

                switch (error.code) {

                    case "auth/invalid-credential":
                        message.textContent = t.ERRORS.INVALID_CREDENTIALS;
                        break;

                    case "auth/network-request-failed":
                        message.textContent = t.ERRORS.NETWORK;
                        break;

                    default:
                        message.textContent = t.ERRORS.UNKNOWN;
                }

        }

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