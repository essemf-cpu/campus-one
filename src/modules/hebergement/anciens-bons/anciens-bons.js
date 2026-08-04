import { requireRole } from "../../../auth/authGuard.js";
import { loadSidebar } from "../components/sidebar.js";
import { getTypesTravaux } from "../../../services/referentielService.js";
import { getBons } from "../../../services/bonsService.js";

requireRole("agent", async ({ profile }) => {

    if (profile.service !== "Service de l'Hébergement") {
        return;
    }

    await loadSidebar(profile);

    document.getElementById("page-title").textContent =
        profile.affectation;

    const typeSelect = document.getElementById("typeFiltre");

    const types = await getTypesTravaux();

    typeSelect.innerHTML =
        `<option value="">Tous les types</option>`;

    types.forEach(type => {

        typeSelect.innerHTML += `

            <option value="${type.id}">

                ${type.nom}

            </option>

        `;

    });

    // Remplissage automatique des années

    const anneeSelect =
        document.getElementById("anneeFiltre");

    const anneeActuelle =
        new Date().getFullYear();

    for (let annee = anneeActuelle; annee >= 2023; annee--) {

        anneeSelect.innerHTML += `

            <option value="${annee}">

                ${annee}

            </option>

        `;

    }

    const tbody = document.getElementById("anciens-body");

const bons = await getBons();

tbody.innerHTML = "";

const aujourdHui = new Date().toISOString().split("T")[0];

const anciensBons = bons.filter(bon => {

    if (!bon.date) return false;

    const dateBon = bon.date.split("T")[0];

    return dateBon !== aujourdHui;

});

if (anciensBons.length === 0) {

    tbody.innerHTML = `

        <tr class="empty-row">

            <td colspan="7">

                Aucun ancien bon trouvé.

            </td>

        </tr>

    `;

} else {

    anciensBons.forEach(bon => {

        tbody.innerHTML += `

            <tr>

                <td>${bon.id}</td>

                <td>${bon.date}</td>

                <td>${bon.type || ""}</td>

                <td>${bon.description || ""}</td>

                <td>${bon.pavillon || ""}</td>

                <td>${bon.statut || ""}</td>

                <td>${bon.cause || ""}</td>

            </tr>

        `;

    });

}

    document.body.classList.add("loaded");

});