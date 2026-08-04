import { requireRole } from "../../../auth/authGuard.js";
import { loadSidebar } from "../components/sidebar.js";
import {
    getTypesTravaux,
    getPavillons
} from "../../../services/referentielService.js";

requireRole("agent", async ({ profile }) => {

    if (profile.service !== "Service de l'Hébergement") {
        return;
    }

    await loadSidebar(profile);

    document.getElementById("page-title").textContent =
        profile.affectation;

    const typeSelect = document.getElementById("type");

    if (typeSelect) {

        const types = await getTypesTravaux();

        typeSelect.innerHTML = "";

        types.forEach(type => {

            typeSelect.innerHTML += `
                <option value="${type.id}">
                    ${type.nom}
                </option>
            `;

        });

    }

    document.body.classList.add("loaded");

});