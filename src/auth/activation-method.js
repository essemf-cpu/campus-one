import emailjs from "@emailjs/browser";
import {
    getActivationInfos,
    findUserByMatricule
} from "./authService.js";

const params = new URLSearchParams(window.location.search);

const matricule = params.get("matricule");

const infos = await getActivationInfos(matricule);

document.getElementById("email").textContent = infos.email;
document.getElementById("phone").textContent = infos.phone;

document
    .getElementById("continueBtn")
    .addEventListener("click", async () => {

        const mode = document.querySelector(
            'input[name="mode"]:checked'
        ).value;

        let code = sessionStorage.getItem("activationCode");

if (!code) {
    code = Math.floor(
        100000 + Math.random() * 900000
    ).toString();

    sessionStorage.setItem("activationCode", code);

    sessionStorage.setItem(
    "activationExpires",
    Date.now() + 600000
);

sessionStorage.setItem(
    "activationMode",
    mode
);
}

        if (mode === "phone") {

    console.log("==========================");
    console.log("MODE DÉVELOPPEMENT");
    console.log("Code SMS :", code);
    console.log("==========================");

    alert("Mode développeur : regarde la console.");

    window.location.href =
        `activation-code.html?matricule=${matricule}`;

    return;

}

        try {

            const agent = await findUserByMatricule(matricule);

            await sendActivationEmail(agent, code);

            window.location.href =
`activation-code.html?matricule=${matricule}`;

        } catch (error) {

            console.error(error);

           window.location.href =
`activation-code.html?matricule=${matricule}`;

        }

    });

async function sendActivationEmail(agent, code) {

    return emailjs.send(

        "service_oaodp9m",

        "template_ia2uz8i",

        {

            name: `${agent.prenom} ${agent.nom}`,

            passcode: code,

            to_email: agent.email

        },

        "RyPqq0LGRkrVOpYCZ"

    );

}