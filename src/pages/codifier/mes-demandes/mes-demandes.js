import { requireRole } from "../../../auth/authGuard.js";

import {
    getTypesTravaux
} from "../../../services/referentielService.js";

import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc
} from "firebase/firestore";

import { db } from "../../../firebase/firebase.js";


requireRole(
    "etudiant",
    async ({
        profile,
        anneeAcademique
    }) => {

        const container =
            document.getElementById(
                "demandes-container"
            );


        if (!container) {

            console.error(
                "❌ demandes-container introuvable"
            );

            return;

        }


        const matricule =
            profile.matricule;

            if (!anneeAcademique) {

    container.innerHTML = `

        <div class="error-state">

            <i class="
                fa-solid
                fa-triangle-exclamation
            "></i>

            <p>
                Impossible de déterminer
                l'année académique.
            </p>

        </div>

    `;

    return;

}


        if (!matricule) {

            container.innerHTML = `

                <div class="error-state">

                    <i class="
                        fa-solid
                        fa-triangle-exclamation
                    "></i>

                    <p>
                        Impossible de déterminer
                        votre matricule.
                    </p>

                </div>

            `;

            return;

        }


        // ==========================================
        // RETOUR
        // ==========================================

        const retourButton =
            document.getElementById(
                "retour-btn"
            );


        if (retourButton) {

            retourButton.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "../index.html";

                }
            );

        }


        // ==========================================
// RECHERCHE ET FILTRES
// ==========================================

const searchInput =
    document.getElementById(
        "demandes-search"
    );


const sortSelect =
    document.getElementById(
        "demandes-sort-select"
    );


const typeSelect =
    document.getElementById(
        "demandes-type-select"
    );


const statutSelect =
    document.getElementById(
        "demandes-statut-select"
    );


let demandes =
    [];


let termeRecherche =
    "";


let modeTri =
    "date_desc";


let typeSelectionne =
    "tous";


let statutSelectionne =
    "tous";

    // ==========================================
// RÉFÉRENTIEL DES TYPES
// ==========================================

let typesTravaux = [];


try {

    typesTravaux =
        await getTypesTravaux();

} catch (error) {

    console.error(
        "❌ Erreur récupération types de travaux :",
        error
    );

}


// ==========================================
// REMPLIR LE FILTRE TYPE
// ==========================================

if (typeSelect) {

    typesTravaux.forEach(
        (type) => {

            typeSelect.innerHTML += `

                <option value="${type.id}">
                    ${type.nom}
                </option>

            `;

        }
    );

}

        // ==========================================
        // OUTILS
        // ==========================================

        const obtenirDate =
            (demande) => {

                if (
                    demande.date?.toDate
                ) {

                    return demande.date.toDate();

                }


                if (
                    demande.date
                ) {

                    const date =
                        new Date(
                            demande.date
                        );


                    if (
                        !isNaN(
                            date.getTime()
                        )
                    ) {

                        return date;

                    }

                }


                return new Date(0);

            };


        const obtenirStatut =
            (statut) => {

                if (
                    statut ===
                    "en_cours"
                ) {

                    return "En cours";

                }


                if (
                    statut ===
                    "termine"
                ) {

                    return "Terminée";

                }


                if (
                    statut ===
                    "forclos"
                ) {

                    return "Forclos";

                }


                if (
                    statut ===
                    "non_termine"
                ) {

                    return "Non terminée";

                }


                return "En attente";

            };


        // ==========================================
        // AFFICHAGE
        // ==========================================

        const afficherDemandes =
            () => {

                let demandesAffichees =
                    [...demandes];


                // ------------------------------------------
                // RECHERCHE
                // ------------------------------------------

                if (
                    termeRecherche
                ) {

                    const recherche =
                        termeRecherche
                            .toLowerCase()
                            .trim();


                    demandesAffichees =
                        demandesAffichees.filter(
                            (demande) => {

                                const statut =
                                    obtenirStatut(
                                        demande.statut
                                    );


                                const contenu = [

                                    demande.probleme,

                                    demande.type,

                                    demande.localisation,

                                    demande.chambre,

                                    statut,

                                    demande.cause

                                ]
                                    .filter(Boolean)
                                    .join(" ")
                                    .toLowerCase();


                                return contenu.includes(
                                    recherche
                                );

                            }
                        );

                }

                // ------------------------------------------
// FILTRE TYPE
// ------------------------------------------

if (
    typeSelectionne !==
    "tous"
) {

    demandesAffichees =
        demandesAffichees.filter(
            (demande) => {

                return (
                    demande.type ===
                    typeSelectionne
                );

            }
        );

}


// ------------------------------------------
// FILTRE STATUT
// ------------------------------------------

if (
    statutSelectionne !==
    "tous"
) {

    demandesAffichees =
        demandesAffichees.filter(
            (demande) => {

                return (
                    (
                        demande.statut ||
                        "en_attente"
                    ) ===
                    statutSelectionne
                );

            }
        );

}


                // ------------------------------------------
                // TRI
                // ------------------------------------------

                demandesAffichees.sort(
                    (a, b) => {

                        if (
                            modeTri ===
                            "date_desc"
                        ) {

                            return (
                                obtenirDate(b) -
                                obtenirDate(a)
                            );

                        }


                        if (
                            modeTri ===
                            "date_asc"
                        ) {

                            return (
                                obtenirDate(a) -
                                obtenirDate(b)
                            );

                        }


                        if (
                            modeTri ===
                            "statut"
                        ) {

                            return obtenirStatut(
                                a.statut
                            )
                                .localeCompare(
                                    obtenirStatut(
                                        b.statut
                                    ),
                                    "fr"
                                );

                        }


                        if (
                            modeTri ===
                            "type"
                        ) {

                            return (
                                `${a.type || ""}`
                            )
                                .localeCompare(
                                    `${b.type || ""}`,
                                    "fr"
                                );

                        }


                        return 0;

                    }
                );


                // ------------------------------------------
                // AUCUNE DEMANDE
                // ------------------------------------------

                if (
                    demandesAffichees.length ===
                    0
                ) {

                    container.innerHTML = `

                        <div class="empty-state">

                            <i class="
                                fa-solid
                                fa-magnifying-glass
                            "></i>

                            <p>

                                ${
                                    termeRecherche
                                        ?
                                        "Aucune demande ne correspond à votre recherche."
                                        :
                                        "Vous n'avez encore formulé aucune demande."
                                }

                            </p>

                        </div>

                    `;

                    return;

                }


                // ------------------------------------------
                // AFFICHAGE
                // ------------------------------------------

                container.innerHTML = "";


                demandesAffichees.forEach(
                    (demande) => {

                        const statut =
                            demande.statut ||
                            "en_attente";


                        // ==================================
                        // STATUT
                        // ==================================

                        let statutTexte =
                            "En attente";


                        let statutClasse =
                            "status-attente";


                        if (
                            statut ===
                            "en_cours"
                        ) {

                            statutTexte =
                                "En cours";

                            statutClasse =
                                "status-cours";

                        }

                        else if (
                            statut ===
                            "termine"
                        ) {

                            statutTexte =
                                "Terminée";

                            statutClasse =
                                "status-termine";

                        }

                        else if (
                            statut ===
                            "forclos"
                        ) {

                            statutTexte =
                                "Forclos";

                            statutClasse =
                                "status-forclos";

                        }

                        else if (
                            statut ===
                            "non_termine"
                        ) {

                            statutTexte =
                                "Non terminée";

                            statutClasse =
                                "status-non-termine";

                        }


                        // ==================================
                        // DATE
                        // ==================================

                        const date =
                            obtenirDate(
                                demande
                            );


                        const dateAffichee =
                            date.getTime() === 0
                                ? "-"
                                : date.toLocaleDateString(
                                    "fr-FR"
                                );


                        // ==================================
                        // CAUSE
                        // ==================================

                        let causeHTML =
                            "";


                        if (
                            demande.cause
                        ) {

                            causeHTML = `

                                <div class="demande-cause">

                                    <span class="cause-label">
                                        Motif
                                    </span>

                                    <p class="cause-text">
                                        ${demande.cause}
                                    </p>

                                </div>

                            `;

                        }


                        // ==================================
                        // FEEDBACK
                        // ==================================

                        let feedbackHTML =
                            "";


                        if (
                            statut ===
                            "termine"
                        ) {

                            // --------------------------------
                            // FEEDBACK DÉJÀ ENVOYÉ
                            // --------------------------------

                            if (
                                demande.evaluation
                            ) {

                                feedbackHTML = `

                                    <div class="feedback-result">

                                        <div class="feedback-result-title">

                                            Votre évaluation

                                        </div>


                                        <div class="feedback-stars">

                                            ${[1, 2, 3]
                                                .map(
                                                    (note) => `

                                                        <span
                                                            class="${
                                                                note <=
                                                                Number(
                                                                    demande.evaluation
                                                                )
                                                                    ? "star-active"
                                                                    : "star-inactive"
                                                            }"
                                                        >
                                                            ★
                                                        </span>

                                                    `
                                                )
                                                .join("")
                                            }

                                        </div>


                                        ${
                                            demande.commentaire
                                                ?

                                                `
                                                <div class="feedback-comment">

                                                    ${
                                                        demande.commentaire ===
                                                        "insatisfait"

                                                            ? "Insatisfait"

                                                            : demande.commentaire ===
                                                              "satisfait"

                                                                ? "Satisfait"

                                                                : demande.commentaire ===
                                                                  "tres_satisfait"

                                                                    ? "Très satisfait"

                                                                    : demande.commentaire
                                                    }

                                                </div>
                                                `

                                                :

                                                ""
                                        }

                                    </div>

                                `;

                            }

                            // --------------------------------
                            // FEEDBACK AUTORISÉ
                            // --------------------------------

                            else if (
                                demande.feedbackAutorise ===
                                true
                            ) {

                                feedbackHTML = `

                                    <div
                                        class="feedback-form"
                                        data-feedback-id="${demande.id}"
                                    >

                                        <div class="feedback-title">

                                            Évaluer cette demande

                                        </div>


                                        <div class="feedback-group">

                                            <label>
                                                Évaluation
                                            </label>


                                            <div class="feedback-stars-select">

                                                <button
                                                    type="button"
                                                    class="feedback-star"
                                                    data-note="1"
                                                >
                                                    ★
                                                </button>


                                                <button
                                                    type="button"
                                                    class="feedback-star"
                                                    data-note="2"
                                                >
                                                    ★
                                                </button>


                                                <button
                                                    type="button"
                                                    class="feedback-star"
                                                    data-note="3"
                                                >
                                                    ★
                                                </button>

                                            </div>

                                        </div>


                                        <div class="feedback-group">

                                            <label>
                                                Avis
                                            </label>


                                            <div class="feedback-choices">

                                                <button
                                                    type="button"
                                                    class="feedback-choice"
                                                    data-avis="insatisfait"
                                                >
                                                    Insatisfait
                                                </button>


                                                <button
                                                    type="button"
                                                    class="feedback-choice"
                                                    data-avis="satisfait"
                                                >
                                                    Satisfait
                                                </button>


                                                <button
                                                    type="button"
                                                    class="feedback-choice"
                                                    data-avis="tres_satisfait"
                                                >
                                                    Très satisfait
                                                </button>

                                            </div>

                                        </div>


                                        <button
                                            type="button"
                                            class="feedback-submit"
                                            data-id="${demande.id}"
                                            disabled
                                        >

                                            Valider

                                        </button>

                                    </div>

                                `;

                            }

                            else {

                                feedbackHTML = `

                                    <div class="feedback-locked">

                                        <i class="
                                            fa-solid
                                            fa-lock
                                        "></i>

                                        Évaluation indisponible

                                    </div>

                                `;

                            }

                        }

                        else {

                            feedbackHTML = `

                                <div class="feedback-locked">

                                    <i class="
                                        fa-solid
                                        fa-lock
                                    "></i>

                                    Évaluation indisponible

                                </div>

                            `;

                        }


                        // ==================================
                        // CARTE
                        // ==================================

                        container.innerHTML += `

                            <article class="demande-item">

                                <div class="demande-header">

                                    <div>

                                        <h3 class="demande-title">

                                            ${demande.probleme || "-"}

                                        </h3>


                                        <div class="demande-date">

                                            Demande du
                                            ${dateAffichee}

                                        </div>

                                    </div>


                                    <span
                                        class="
                                            demande-status
                                            ${statutClasse}
                                        "
                                    >

                                        ${statutTexte}

                                    </span>

                                </div>


                                <div class="demande-info">


                                    <div class="info-block">

                                        <span class="info-label">

                                            Type

                                        </span>


                                        <span class="info-value">

                                            ${demande.type || "-"}

                                        </span>

                                    </div>


                                    <div class="info-block">

                                        <span class="info-label">

                                            Localisation

                                        </span>


                                        <span class="info-value">

                                            ${demande.localisation || "-"}

                                        </span>

                                    </div>


                                    <div class="info-block">

                                        <span class="info-label">

                                            Chambre

                                        </span>


                                        <span class="info-value">

                                            ${demande.chambre || "-"}

                                        </span>

                                    </div>

                                </div>


                                ${causeHTML}


                                <div class="feedback-section">

                                    ${feedbackHTML}

                                </div>


                            </article>

                        `;

                    }
                );

            };


        // ==========================================
        // RECHERCHE
        // ==========================================

        if (
            searchInput
        ) {

            searchInput.addEventListener(
                "input",
                () => {

                    termeRecherche =
                        searchInput.value;

                    afficherDemandes();

                }
            );

        }


        // ==========================================
        // TRI
        // ==========================================

        if (
            sortSelect
        ) {

            sortSelect.addEventListener(
                "change",
                () => {

                    modeTri =
                        sortSelect.value;

                    afficherDemandes();

                }
            );

        }

        // ==========================================
// TYPE
// ==========================================

if (
    typeSelect
) {

    typeSelect.addEventListener(
        "change",
        () => {

            typeSelectionne =
                typeSelect.value;

            afficherDemandes();

        }
    );

}


// ==========================================
// STATUT
// ==========================================

if (
    statutSelect
) {

    statutSelect.addEventListener(
        "change",
        () => {

            statutSelectionne =
                statutSelect.value;

            afficherDemandes();

        }
    );

}


        // ==========================================
        // FIRESTORE
        // ==========================================

        const demandesQuery =
    query(

        collection(
            db,
            "demandes_etudiants"
        ),

        where(
            "matricule",
            "==",
            matricule
        ),

        where(
            "anneeAcademique",
            "==",
            anneeAcademique
        )

    );


        // ==========================================
        // TEMPS RÉEL
        // ==========================================

        onSnapshot(

            demandesQuery,

            (snapshot) => {

                console.log(
                    "📋 Mes demandes :",
                    snapshot.size
                );


                demandes = [];


                snapshot.forEach(
                    (document) => {

                        demandes.push({

                            id:
                                document.id,

                            ...document.data()

                        });

                    }
                );


                afficherDemandes();

            },


            (error) => {

                console.error(
                    "❌ Erreur écoute demandes :",
                    error
                );


                container.innerHTML = `

                    <div class="error-state">

                        <i class="
                            fa-solid
                            fa-triangle-exclamation
                        "></i>

                        <p>

                            Impossible de charger
                            vos demandes.

                        </p>

                    </div>

                `;

            }

        );


        // ==========================================
        // FEEDBACK
        // ==========================================

        container.addEventListener(
            "click",
            async (event) => {

                // --------------------------------------
                // ÉTOILE
                // --------------------------------------

                const star =
                    event.target.closest(
                        ".feedback-star"
                    );


                if (star) {

                    const form =
                        star.closest(
                            ".feedback-form"
                        );


                    if (!form) {
                        return;
                    }


                    const note =
                        Number(
                            star.dataset.note
                        );


                    form.dataset.note =
                        note;


                    form.querySelectorAll(
                        ".feedback-star"
                    ).forEach(
                        (item) => {

                            const itemNote =
                                Number(
                                    item.dataset.note
                                );


                            item.classList.toggle(
                                "selected",
                                itemNote <= note
                            );

                        }
                    );


                    const submit =
                        form.querySelector(
                            ".feedback-submit"
                        );


                    if (
                        submit &&
                        form.dataset.avis
                    ) {

                        submit.disabled =
                            false;

                    }


                    return;

                }


                // --------------------------------------
                // AVIS
                // --------------------------------------

                const avisButton =
                    event.target.closest(
                        ".feedback-choice"
                    );


                if (avisButton) {

                    const form =
                        avisButton.closest(
                            ".feedback-form"
                        );


                    if (!form) {
                        return;
                    }


                    form.dataset.avis =
                        avisButton.dataset.avis;


                    form.querySelectorAll(
                        ".feedback-choice"
                    ).forEach(
                        (button) => {

                            button.classList.remove(
                                "selected"
                            );

                        }
                    );


                    avisButton.classList.add(
                        "selected"
                    );


                    const submit =
                        form.querySelector(
                            ".feedback-submit"
                        );


                    if (
                        submit &&
                        form.dataset.note
                    ) {

                        submit.disabled =
                            false;

                    }


                    return;

                }


                // --------------------------------------
                // VALIDER
                // --------------------------------------

                const submit =
                    event.target.closest(
                        ".feedback-submit"
                    );


                if (!submit) {
                    return;
                }


                const form =
                    submit.closest(
                        ".feedback-form"
                    );


                const id =
                    submit.dataset.id;


                if (
                    !form ||
                    !id
                ) {

                    return;

                }


                const note =
                    Number(
                        form.dataset.note
                    );


                const avis =
                    form.dataset.avis;


                if (
                    !note ||
                    !avis ||
                    submit.disabled
                ) {

                    return;

                }


                submit.disabled =
                    true;


                submit.innerHTML = `

                    <i class="
                        fa-solid
                        fa-spinner
                        fa-spin
                    "></i>

                    Enregistrement...

                `;


                try {

                    await updateDoc(
                        doc(
                            db,
                            "demandes_etudiants",
                            id
                        ),
                        {

                            evaluation:
                                note,

                            commentaire:
                                avis,

                            feedbackAutorise:
                                false

                        }
                    );


                    console.log(
                        "✅ Feedback enregistré"
                    );


                } catch (error) {

                    console.error(
                        "❌ Erreur feedback :",
                        error
                    );


                    submit.disabled =
                        false;


                    submit.innerHTML =
                        "Valider";


                    alert(
                        "Impossible d'enregistrer votre évaluation."
                    );

                }

            }
        );

    }
);