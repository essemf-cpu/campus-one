import { requireRole } from "../../../auth/authGuard.js";
import { loadSidebar } from "../components/sidebar.js";
import { getBons } from "../../../services/bonsService.js";

requireRole("agent", async ({ profile }) => {

    if (profile.service !== "Service de l'Hébergement") {
        return;
    }

    await loadSidebar(profile);

    document.getElementById("page-title").textContent =
        profile.affectation;

    const tbody =
        document.getElementById("historique-body");

    const bons = await getBons();

    tbody.innerHTML = "";

    if (bons.length === 0) {

        tbody.innerHTML = `

            <tr class="empty-row">

                <td colspan="10">

                    Aucun historique disponible.

                </td>

            </tr>

        `;

    } else {

        bons.sort((a, b) => {

            return new Date(b.date) - new Date(a.date);

        });

        bons.forEach(bon => {

            tbody.innerHTML += `

                <tr>

                    <td>${bon.date || ""}</td>

                    <td>${bon.nomEtudiant || ""}</td>

                    <td>${bon.chambre || ""}</td>

                    <td>${bon.niveau || ""}</td>

                    <td>${bon.type || ""}</td>

                    <td>${bon.description || ""}</td>

                    <td>${bon.statut || ""}</td>

                    <td>${bon.cause || ""}</td>

                    <td>${bon.evaluation ? "⭐".repeat(bon.evaluation) : ""}</td>

                    <td>${bon.commentaire || ""}</td>

                </tr>

            `;

        });

    }

    document.body.classList.add("loaded");

});