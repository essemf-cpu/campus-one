import { getActivationInfos } from "./authService.js";

const params = new URLSearchParams(window.location.search);
const matricule = params.get("matricule");

const infos = await getActivationInfos(matricule);

const destination = document.getElementById("destination");
const inputs = document.querySelectorAll(".otp-input");
const message = document.getElementById("message");
const countdown = document.getElementById("countdown");

destination.textContent =
    sessionStorage.getItem("activationMode") === "phone"
        ? infos.phone
        : infos.email;

// Premier champ actif
inputs[0].focus();

inputs.forEach((input, index) => {

    input.addEventListener("input", () => {

        input.value = input.value.replace(/\D/g, "");

        if (input.value && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }

    });

    input.addEventListener("keydown", e => {

        if (
            e.key === "Backspace" &&
            !input.value &&
            index > 0
        ) {

            inputs[index - 1].focus();

        }

    });

});

document.addEventListener("paste", e => {

    const text = e.clipboardData
        .getData("text")
        .replace(/\D/g, "");

    if (text.length === 6) {

        inputs.forEach((input, i) => {

            input.value = text[i];

        });

        inputs[5].focus();

    }

});

function startCountdown() {

    const expire =
        Number(
            sessionStorage.getItem(
                "activationExpires"
            )
        );

    const timer = setInterval(() => {

        const remain =
            expire - Date.now();

        if (remain <= 0) {

            clearInterval(timer);

            countdown.textContent =
                "00:00";

            document
                .getElementById("resendBtn")
                .disabled = false;

            return;

        }

        const minutes =
            Math.floor(remain / 60000);

        const seconds =
            Math.floor(
                (remain % 60000) / 1000
            );

        countdown.textContent =
            `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;

    },1000);

}

startCountdown();

document
.getElementById("continueBtn")
.addEventListener("click",()=>{

    const entered =
        [...inputs]
        .map(i=>i.value)
        .join("");

    const saved =
        sessionStorage.getItem(
            "activationCode"
        );

    if(entered!==saved){

        message.textContent =
            "Code incorrect.";

        return;

    }
sessionStorage.setItem("activationVerified", "true");
    window.location.href =
`create-password.html?matricule=${matricule}`;

});