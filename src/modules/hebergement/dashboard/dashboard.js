import { requireRole } from "../../../auth/authGuard.js";
import { loadSidebar } from "../components/sidebar.js";

requireRole("agent", async ({ profile }) => {

    if (profile.service !== "Service de l'Hébergement") {

        return;

    }

    await loadSidebar(profile);
    document.body.classList.add("loaded");

});

console.time("TOTAL");

requireRole("agent", async ({ profile }) => {

    console.timeLog("TOTAL", "requireRole terminé");

    if (profile.service !== "Service de l'Hébergement") {
        return;
    }

    await loadSidebar(profile);

    console.timeEnd("TOTAL");

});