import { requireRole } from "../../../auth/authGuard.js";
import { loadSidebar } from "../components/sidebar.js";

requireRole("agent", async ({ profile }) => {

    if (profile.service !== "Service de l'Hébergement") {
        return;
    }

    await loadSidebar(profile);

    document.getElementById("total-bons").textContent = "0";
    document.getElementById("bons-attente").textContent = "0";
    document.getElementById("bons-encours").textContent = "0";
    document.getElementById("bons-termines").textContent = "0";

});