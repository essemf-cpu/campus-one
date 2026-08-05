import { requireRole } from "../../../auth/authGuard.js";
import { loadSidebar } from "../components/sidebar.js";
import {
    getTypesTravaux,
    getPavillons
} from "../../../services/referentielService.js";

requireRole("agent", async ({ profile }) => {

    console.log("1 - requireRole OK");

    if (profile.service !== "Service de l'Hébergement") {
        return;
    }

    console.log("2 - service OK");

    await loadSidebar(profile);

    console.log("3 - sidebar chargée");

    document.getElementById("page-title").textContent =
        profile.affectation;

    const typeSelect = document.getElementById("type");

    if (typeSelect) {

        console.log("4 - select trouvé");

        const types = await getTypesTravaux();

        console.log("5 - types récupérés", types);

        typeSelect.innerHTML = "";

        types.forEach(type => {

            typeSelect.innerHTML += `
                <option value="${type.id}">
                    ${type.nom}
                </option>
            `;

        });

    }

    console.log("6 - page prête");

    document.body.classList.add("loaded");

});