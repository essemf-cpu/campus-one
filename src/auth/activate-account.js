import { checkMatricule } from "./authService.js";

const form = document.getElementById("activationForm");
const matricule = document.getElementById("matricule");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    message.textContent = "";

    const numero = matricule.value.trim();

    console.log("Matricule saisi :", numero);

    const existe = await checkMatricule(numero);

    if (!existe) {

        message.style.color = "red";
        message.textContent =
        "Numéro de carte introuvable.";

        return;

    }

    window.location.href =
    `activation-method.html?matricule=${numero}`;

});