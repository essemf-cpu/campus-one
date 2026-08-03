import { createIcons, icons } from "lucide";
import { getCurrentUser } from "../../../auth/authService.js";
import { auth } from "../../../firebase/firebase.js";

export async function loadSidebar() {

    console.log("A");

console.log(firebaseUser);

const { account, profile } = await getCurrentUser(firebaseUser.uid);
console.log(profile);

    // Charger le CSS
    if (!document.getElementById("sidebar-css")) {

        const link = document.createElement("link");

        link.id = "sidebar-css";
        link.rel = "stylesheet";
        link.href = "../components/sidebar.css";

        document.head.appendChild(link);

    }

    // Charger le HTML
    const response = await fetch("../components/sidebar.html");

    document.getElementById("sidebar-container").innerHTML =
        await response.text();

    createIcons({ icons });

    // ===== Utilisateur connecté =====

    const firebaseUser = auth.currentUser;

    if (!firebaseUser) return;

    const { account, profile } = await getCurrentUser(firebaseUser.uid);

    document.getElementById("sidebar-affectation").textContent =
        profile.affectation;

    document.getElementById("sidebar-fonction").textContent =
        profile.fonction;

    document.getElementById("sidebar-nom").textContent =
        `${profile.prenom} ${profile.nom}`;

    document.getElementById("sidebar-email").textContent =
        profile.email;

}