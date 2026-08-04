import { requireRole } from "../../../auth/authGuard.js";
import { loadSidebar } from "../components/sidebar.js";

console.time("PAGE");

console.timeLog("PAGE", "Loader chargé");

requireRole("agent", async ({ profile }) => {

    console.timeLog("PAGE", "Utilisateur authentifié");

    await loadSidebar(profile);

    console.timeLog("PAGE", "Sidebar chargée");

    document.getElementById("total-bons").textContent = "0";
    document.getElementById("bons-attente").textContent = "0";
    document.getElementById("bons-encours").textContent = "0";
    document.getElementById("bons-termines").textContent = "0";

    console.timeLog("PAGE", "Contenu prêt");

    document.body.classList.add("loaded");

    console.timeEnd("PAGE");

});