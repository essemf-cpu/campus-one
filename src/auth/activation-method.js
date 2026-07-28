import { getActivationInfos } from "./authService.js";

const params = new URLSearchParams(window.location.search);

const matricule = params.get("matricule");

const infos = await getActivationInfos(matricule);

document.getElementById("email").textContent = infos.email;

document.getElementById("phone").textContent = infos.phone;

document
.getElementById("continueBtn")
.addEventListener("click", () => {

    const mode = document.querySelector(
        'input[name="mode"]:checked'
    ).value;

    const code = Math.floor(
        100000 + Math.random() * 900000
    ).toString();

    sessionStorage.setItem("activationCode", code);

    if (mode === "phone") {

        console.log(
            "=== CODE SMS ===",
            code
        );

        alert(
            "Mode développeur : regarde la console."
        );

        return;

    }

    alert(
        "Prochaine étape : envoi EmailJS."
    );

});