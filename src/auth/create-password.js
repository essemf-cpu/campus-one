const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const createBtn = document.getElementById("createBtn");
const message = document.getElementById("message");

const params = new URLSearchParams(window.location.search);
const matricule = params.get("matricule");

if (!matricule) {
    window.location.href = "index.html";
}

if (sessionStorage.getItem("activationVerified") !== "true") {
    window.location.href = "index.html";
}

createBtn.addEventListener("click", async () => {

    message.textContent = "";

    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!password || !confirmPassword) {
        message.textContent = "Veuillez remplir tous les champs.";
        return;
    }

    if (password.length < 6) {
        message.textContent = "Le mot de passe doit contenir au moins 6 caractères.";
        return;
    }

    if (password !== confirmPassword) {
        message.textContent = "Les mots de passe ne correspondent pas.";
        return;
    }

    createBtn.disabled = true;
    createBtn.textContent = "Création...";

    try {

        const response = await fetch("http://localhost:3000/api/auth/create-account", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                matricule,
                password
            })

        });

        const result = await response.json();

        if (!result.success) {
            message.textContent = result.message;
            createBtn.disabled = false;
            createBtn.textContent = "Créer mon compte";
            return;
        }

        sessionStorage.removeItem("activationVerified");
        sessionStorage.removeItem("activationCode");
        sessionStorage.removeItem("activationExpires");
        sessionStorage.removeItem("activationMode");

        message.style.color = "green";
        message.textContent = "Compte créé avec succès.";

        setTimeout(() => {
            window.location.href = `login.html?matricule=${matricule}`;
        }, 1500);

    } catch (error) {

        console.error(error);

        message.textContent = "Impossible de contacter le serveur.";

        createBtn.disabled = false;
        createBtn.textContent = "Créer mon compte";
    }

});