import { requireRole } from "../../auth/authGuard.js";

import {
    db
} from "../../firebase/firebase.js";

import {
    collection,
    query,
    where,
    getDocs
} from "firebase/firestore";


requireRole(
    "etudiant",
    async ({ profile }) => {

        const content =
            document.getElementById(
                "codifier-content"
            );


        // ==========================================
        // MATRICULE DE L'ÉTUDIANT CONNECTÉ
        // ==========================================

        const matricule =
            profile.matricule;


        if (!matricule) {

            content.innerHTML = `

                <div
                    class="service-indisponible"
                >

                    <div
                        class="
                            service-indisponible-icon
                        "
                    >

                        <i
                            class="
                                fa-solid
                                fa-triangle-exclamation
                            "
                        ></i>

                    </div>

                    <h2>
                        Service momentanément indisponible
                    </h2>

                    <p>
                        Réessayer ultérieurement.
                    </p>

                </div>

            `;

            return;
        }


        // ==========================================
        // RECHERCHE DE L'HÉBERGEMENT
        // ==========================================

        try {

            const hebergementsQuery =
                query(

                    collection(
                        db,
                        "hebergements"
                    ),

                    where(
                        "matricule",
                        "==",
                        matricule
                    )

                );


            const snapshot =
                await getDocs(
                    hebergementsQuery
                );


            // ==========================================
            // AUCUN HÉBERGEMENT
            // ==========================================

            if (
                snapshot.empty
            ) {

                content.innerHTML = `

                    <div
                        class="
                            service-indisponible
                        "
                    >

                        <div
                            class="
                                service-indisponible-icon
                            "
                        >

                            <i
                                class="
                                    fa-solid
                                    fa-house-circle-exclamation
                                "
                            ></i>

                        </div>

                        <h2>
                            Service momentanément indisponible
                        </h2>

                        <p>
                            Réessayer ultérieurement.
                        </p>

                    </div>

                `;

                return;
            }


            // ==========================================
            // HÉBERGEMENT TROUVÉ
            // ==========================================

            const hebergement =
                snapshot.docs[0].data();


            content.innerHTML = `

                <div
                    class="
                        codifier-header
                    "
                >

                    <h1>
                        Mon dossier d'hébergement
                    </h1>

                    <p>
                        Informations
                    </p>

                </div>


                <div
                    class="
                        hebergement-card
                    "
                >

                    <div
                        class="
                            hebergement-card-header
                        "
                    >

                        <div
                            class="
                                hebergement-icon
                            "
                        >

                            <i
                                class="
                                    fa-solid
                                    fa-house
                                "
                            ></i>

                        </div>


                        <div>

                            <h2>
    ${profile.prenom} ${profile.nom}
</h2>

<p>
    Carte n° ${profile.numeroEtudiant || "-"}
</p>

                        </div>

                    </div>


                    <div
                        class="
                            hebergement-info
                        "
                    >

                        <div
                            class="
                                hebergement-row
                            "
                        >

                            <span
                                class="
                                    hebergement-label
                                "
                            >
                                Site
                            </span>

                            <span
                                class="
                                    hebergement-value
                                "
                            >
                                ${hebergement.site || "-"}
                            </span>

                        </div>


                        <div
                            class="
                                hebergement-row
                            "
                        >

                            <span
                                class="
                                    hebergement-label
                                "
                            >
                                Pavillon
                            </span>

                            <span
                                class="
                                    hebergement-value
                                "
                            >
                                ${hebergement.pavillon || "-"}
                            </span>

                        </div>


                        <div
                            class="
                                hebergement-row
                            "
                        >

                            <span
                                class="
                                    hebergement-label
                                "
                            >
                                Chambre
                            </span>

                            <span
                                class="
                                    hebergement-value
                                "
                            >
                                ${hebergement.chambre || "-"}
                            </span>

                        </div>


                        <div
                            class="
                                hebergement-row
                            "
                        >

                            <span
                                class="
                                    hebergement-label
                                "
                            >
                                Lit
                            </span>

                            <span
                                class="
                                    hebergement-value
                                "
                            >
                                ${hebergement.lit || "-"}
                            </span>

                        </div>

                    </div>


                    <div
                        class="
                            codifier-actions
                        "
                    >

                        <button
    id="faire-reclamation-btn"
    class="
        codifier-button
        codifier-button-primary
    "
    type="button"
>

                            <i
                                class="
                                    fa-solid
                                    fa-screwdriver-wrench
                                "
                            ></i>

                            Faire une demande de réclamation

                        </button>


                        <button
    id="voir-demandes-btn"
    class="
        codifier-button
        codifier-button-secondary
    "
    type="button"
>

                            <i
                                class="
                                    fa-solid
                                    fa-clock-rotate-left
                                "
                            ></i>

                            Voir mes demandes

                        </button>

                    </div>

                </div>

            `;

            const reclamationButton =
    document.getElementById(
        "faire-reclamation-btn"
    );


if (reclamationButton) {

    reclamationButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "./reclamation/index.html";

        }
    );

}


// ==========================================
// VOIR MES DEMANDES
// ==========================================

const voirDemandesButton =
    document.getElementById(
        "voir-demandes-btn"
    );


if (voirDemandesButton) {

    voirDemandesButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "./mes-demandes/index.html";

        }
    );

}

        } catch (error) {

            console.error(
                "❌ Erreur récupération hébergement :",
                error
            );


            content.innerHTML = `

                <div
                    class="
                        service-indisponible
                    "
                >

                    <div
                        class="
                            service-indisponible-icon
                        "
                    >

                        <i
                            class="
                                fa-solid
                                fa-triangle-exclamation
                            "
                        ></i>

                    </div>

                    <h2>
                        Service momentanément indisponible
                    </h2>

                    <p>
                        Réessayer ultérieurement.
                    </p>

                </div>

            `;
            

        }

    }
);