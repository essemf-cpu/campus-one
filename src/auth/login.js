import { findUser, login } from "./authService.js";
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

        const user = await findUser(matricule);

        await login(user.email, mdp);

        sessionStorage.setItem(
            "user",
            JSON.stringify(user)
        );

        message.style.color = "green";
        message.textContent = t.SUCCESS.LOGIN;

        switch (user.collection) {

            case "agents":

                window.location.href =
                    "../dashboards/agent/dashboard.html";
                break;

            case "etudiants":

                window.location.href =
                    "../dashboards/etudiant/dashboard.html";
                break;

            default:

                throw new Error("UNKNOWN_ROLE");

        }

    } catch (error) {

        console.error(error);

        message.style.color = "red";

        switch (error.message) {

            case "USER_NOT_FOUND":
                message.textContent = t.ERRORS.USER_NOT_FOUND;
                break;

            case "UNKNOWN_ROLE":
                message.textContent = "Rôle inconnu.";
                break;

            default:

                switch (error.code) {

                    case "auth/invalid-credential":
                        message.textContent =
                            t.ERRORS.INVALID_CREDENTIALS;
                        break;

                    case "auth/network-request-failed":
                        message.textContent =
                            t.ERRORS.NETWORK;
                        break;

                    default:
                        message.textContent =
                            t.ERRORS.UNKNOWN;

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
        toggle.classList.replace(
            "fa-eye",
            "fa-eye-slash"
        );

    } else {

        password.type = "password";
        toggle.classList.replace(
            "fa-eye-slash",
            "fa-eye"
        );

    }

});