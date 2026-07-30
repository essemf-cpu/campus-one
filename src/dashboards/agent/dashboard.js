import { requireAuth } from "../../auth/authGuard.js";
import { getCurrentUser } from "../../auth/authService.js";
import { auth } from "../../firebase/firebase.js";

requireAuth(async (user) => {

    try {

        const currentUser = await getCurrentUser(user.uid);

        const account = currentUser.account;
        const profile = currentUser.profile;

        document.getElementById("welcome").textContent =
            `Bienvenue ${profile.prenom} ${profile.nom}`;

        document.getElementById("fonction").textContent =
            profile.fonction;

        document.getElementById("service").textContent =
            profile.service;

        document.getElementById("affectation").textContent =
            profile.affectation;

    } catch (error) {

        console.error(error);

        await auth.signOut();

        window.location.href =
            "../../auth/login.html";

    }

});