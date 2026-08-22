import { requireRole } from "../../../auth/authGuard.js";
import { loadSidebar } from "../components/sidebar.js";

import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc
} from "firebase/firestore";

import { db } from "../../../firebase/firebase.js";

import {
    createBon,
    getBons,
    deleteBon
} from "../../../services/bonsService.js";

import {
    getTypesTravaux
} from "../../../services/referentielService.js";


requireRole(
    "agent",
    async ({
        profile,
        permissions,
        affectation,
        posteId,
        anneeAcademique,
        lectureSeule
    }) => {

        console.log(
            "🔐 MODE LECTURE SEULE =",
            lectureSeule
        );

        console.log("1 - requireRole OK");


        // =====================================================
        // VÉRIFICATION SERVICE
        // =====================================================

        if (
            profile.service !==
            "Service de l'Hébergement"
        ) {
            return;
        }

        console.log("2 - service OK");


        // =====================================================
        // SIDEBAR
        // =====================================================

        await loadSidebar(profile);

        console.log("3 - sidebar chargée");


        // =====================================================
        // TITRE
        // =====================================================

        document
            .getElementById("page-title")
            .textContent =
                profile.affectation;


        // =====================================================
        // TYPES DE TRAVAUX
        // =====================================================

        const typeSelect =
            document.getElementById("type");

        if (typeSelect) {

            console.log(
                "4 - select trouvé"
            );

            const types =
                await getTypesTravaux();

            console.log(
                "5 - types récupérés",
                types
            );

            typeSelect.innerHTML = "";

            types.forEach(
                (type) => {

                    typeSelect.innerHTML += `
                        <option value="${type.id}">
                            ${type.nom}
                        </option>
                    `;
                }
            );
        }


        // =====================================================
        // DEMANDES DES ÉTUDIANTS
        // =====================================================

        const demandesBody =
            document.getElementById(
                "demandes-body"
            );

        if (!demandesBody) {

            console.error(
                "❌ demandes-body introuvable"
            );

            return;
        }


        // =====================================================
        // IDENTIFIER LE PAVILLON DE L'AGENT
        // =====================================================

        const siteAgent =
            profile.site;

        const pavillonAgent =
            profile.affectation
                ?.replace(
                    /^Pavillon\s+/i,
                    ""
                )
                .trim();

        console.log(
            "🏢 Site agent :",
            siteAgent
        );

        console.log(
            "🏠 Pavillon agent :",
            pavillonAgent
        );


        if (
            !siteAgent ||
            !pavillonAgent
        ) {

            demandesBody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="9">
                        Impossible de déterminer
                        le site ou le pavillon.
                    </td>
                </tr>
            `;

            return;
        }


        // =====================================================
        // RÉFÉRENTIEL DES TYPES DE TRAVAUX
        // =====================================================

        const typesTravaux =
            await getTypesTravaux();

        const typesTravauxMap =
            new Map(
                typesTravaux.map(
                    type => [
                        type.id,
                        type.nom
                    ]
                )
            );


        // =====================================================
        // REQUÊTE FIRESTORE
        // =====================================================

        const demandesQuery =
            query(

                collection(
                    db,
                    "demandes_etudiants"
                ),

                where(
                    "site",
                    "==",
                    siteAgent
                ),

                where(
                    "pavillon",
                    "==",
                    pavillonAgent
                ),

                where(
                    "anneeAcademique",
                    "==",
                    anneeAcademique
                )

            );


        // =====================================================
        // CACHE DES DEMANDES
        // =====================================================

        const demandesCache =
            new Map();


        // =====================================================
        // ÉCOUTE TEMPS RÉEL DES DEMANDES
        // =====================================================

        onSnapshot(

            demandesQuery,

            (snapshot) => {

                console.log(
                    "📋 Demandes mises à jour :",
                    snapshot.size
                );

                demandesBody.innerHTML = "";

                let demandesActives = 0;


                snapshot.forEach(
                    (documentSnapshot) => {

                        const demande =
                            documentSnapshot.data();

                        const demandeId =
                            documentSnapshot.id;


                        // =================================================
                        // CACHE
                        // =================================================

                        demandesCache.set(
                            demandeId,
                            demande
                        );


                        // =================================================
                        // UNIQUEMENT LES DEMANDES ACTIVES
                        // =================================================

                        if (
                            demande.statut &&
                            demande.statut !== "en_attente" &&
                            demande.statut !== "en_cours"
                        ) {
                            return;
                        }


                        demandesActives++;


                        // =================================================
                        // NOM
                        // =================================================

                        const nomComplet =
                            `${demande.prenom || ""} ${demande.nom || ""}`
                                .trim();


                        // =================================================
                        // ACTIONS
                        // =================================================

                        let actions = "";


                        // =============================================
                        // EN ATTENTE
                        // =============================================

                        if (
                            !lectureSeule &&
                            (demande.statut || "en_attente") ===
                                "en_attente"
                        ) {

                            actions = `

                                <div class="demande-actions">

                                    <button
                                        type="button"
                                        class="demande-action-btn demande-action-encours"
                                        data-id="${demandeId}"
                                        data-action="encours"
                                    >
                                        En cours
                                    </button>

                                    <button
                                        type="button"
                                        class="demande-action-btn demande-action-forclos"
                                        data-id="${demandeId}"
                                        data-action="forclos"
                                    >
                                        Forclos
                                    </button>

                                    <button
                                        type="button"
                                        class="demande-action-btn demande-action-bon"
                                        data-id="${demandeId}"
                                        data-action="bon"
                                    >
                                        Rédiger un bon
                                    </button>

                                </div>

                            `;
                        }


                        // =============================================
                        // EN COURS
                        // =============================================

                        else if (
                            !lectureSeule &&
                            demande.statut === "en_cours"
                        ) {

                            actions = `

                                <div class="demande-actions">

                                    <button
                                        type="button"
                                        class="demande-action-btn demande-action-termine"
                                        data-id="${demandeId}"
                                        data-action="termine"
                                    >
                                        Terminée
                                    </button>

                                    <button
                                        type="button"
                                        class="demande-action-btn demande-action-nontermine"
                                        data-id="${demandeId}"
                                        data-action="nontermine"
                                    >
                                        Non terminée
                                    </button>

                                    <button
                                        type="button"
                                        class="demande-action-btn demande-action-bon"
                                        data-id="${demandeId}"
                                        data-action="bon"
                                    >
                                        Rédiger un bon
                                    </button>

                                </div>

                            `;
                        }


                        // =================================================
                        // LIGNE
                        // =================================================

                        demandesBody.innerHTML += `

                            <tr>

                                <!-- ÉTUDIANT -->

                                <td>
                                    <strong>
                                        ${nomComplet}
                                    </strong>
                                </td>


                                <!-- CARTE -->

                                <td>
                                    ${demande.matricule || "-"}
                                </td>


                                <!-- CHAMBRE -->

                                <td>
                                    ${demande.chambre || "-"}
                                </td>


                                <!-- TYPE -->

                                <td>
                                    ${
                                        typesTravauxMap.get(
                                            demande.type
                                        ) || "-"
                                    }
                                </td>


                                <!-- LOCALISATION -->

                                <td>
                                    ${demande.localisation || "-"}
                                </td>


                                <!-- NIVEAU -->

                                <td>
                                    ${demande.niveau || "-"}
                                </td>


                                <!-- CÔTÉ -->

                                <td>
                                    ${demande.cote || "-"}
                                </td>


                                <!-- PROBLÈME -->

                                <td>
                                    ${demande.probleme || "-"}
                                </td>


                                <!-- ACTION -->

                                <td>
                                    ${actions}
                                </td>

                            </tr>

                        `;
                    }
                );


                // =================================================
                // AUCUNE DEMANDE ACTIVE
                // =================================================

                if (
                    demandesActives === 0
                ) {

                    demandesBody.innerHTML = `

                        <tr class="empty-row">

                            <td colspan="9">

                                Aucune demande pour le moment

                            </td>

                        </tr>

                    `;
                }

            },


            // =====================================================
            // ERREUR ÉCOUTE TEMPS RÉEL
            // =====================================================

            (error) => {

                console.error(
                    "❌ Erreur écoute demandes :",
                    error
                );

                demandesBody.innerHTML = `

                    <tr class="empty-row">

                        <td colspan="9">

                            Impossible de charger
                            les demandes.

                        </td>

                    </tr>

                `;
            }

        );


        // =====================================================
        // FORMULAIRE NOUVEAU BON
        // =====================================================

        const bonForm =
            document.getElementById(
                "bonForm"
            );


        bonForm?.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                // =================================================
                // LECTURE SEULE
                // =================================================

                if (lectureSeule) {
                    return;
                }


                try {

                    const date =
                        document
                            .getElementById("date")
                            ?.value;

                    const type =
                        document
                            .getElementById("type")
                            ?.value;

                    const description =
                        document
                            .getElementById("description")
                            ?.value
                            .trim();

                    const chambre =
                        document
                            .getElementById("chambre")
                            ?.value
                            .trim();

                    const toilette =
                        document
                            .getElementById("toilette")
                            ?.value
                            .trim();


                    // =================================================
                    // PRÉCISIONS DE LOCALISATION
                    // =================================================

                    const localisation =
                        document
                            .getElementById("localisation")
                            ?.value
                            .trim();

                    const niveau =
                        document
                            .getElementById("niveau")
                            ?.value
                            .trim();

                    const cote =
                        document
                            .getElementById("cote")
                            ?.value
                            .trim();


                    // =================================================
                    // CRÉATION DU BON
                    // =================================================

                    await createBon({

                        date,

                        site:
                            profile.site,

                        pavillon:
                            profile.affectation
                                ?.replace(
                                    /^Pavillon\s+/i,
                                    ""
                                )
                                .trim(),

                        type,

                        description,

                        chambre,

                        toilette,

                        localisation,

                        niveau,

                        cote,

                        demandeId:
                            bonForm.dataset.demandeId ||
                            null,

                        agentMatricule:
                            profile.matricule,

                        agentNom:
                            `${profile.prenom || ""} ${profile.nom || ""}`
                                .trim()

                    });


                    alert(
                        "Bon envoyé avec succès."
                    );


                    bonForm.reset();

                    delete bonForm.dataset.demandeId;


                    // =================================================
                    // NETTOYAGE DES CHAMPS DE PRÉCISION
                    // =================================================

                    const localisationInput =
                        document.getElementById(
                            "localisation"
                        );

                    const niveauInput =
                        document.getElementById(
                            "niveau"
                        );

                    const coteInput =
                        document.getElementById(
                            "cote"
                        );


                    if (localisationInput) {
                        localisationInput.value = "";
                    }

                    if (niveauInput) {
                        niveauInput.value = "";
                    }

                    if (coteInput) {
                        coteInput.value = "";
                    }


                    // =================================================
                    // ACTUALISER LE SUIVI
                    // =================================================

                    await chargerSuiviBons();

                } catch (error) {

                    console.error(
                        "❌ Création du bon :",
                        error
                    );

                    alert(
                        "Impossible de créer le bon."
                    );

                }

            }
        );


        // =====================================================
        // ACTIONS DES DEMANDES ÉTUDIANTS
        // =====================================================

        demandesBody.addEventListener(
            "click",
            async (event) => {

                // =================================================
                // LECTURE SEULE
                // =================================================

                if (lectureSeule) {

                    console.warn(
                        "🔒 Action bloquée : session en lecture seule."
                    );

                    return;
                }


                const button =
                    event.target.closest(
                        ".demande-action-btn"
                    );


                if (!button) {
                    return;
                }


                const id =
                    button.dataset.id;

                const action =
                    button.dataset.action;


                // =================================================
                // RÉDIGER UN BON
                // =================================================

                if (
                    action === "bon"
                ) {

                    const demande =
                        demandesCache.get(id);


                    if (!demande) {

                        alert(
                            "Impossible de retrouver la demande."
                        );

                        return;
                    }


                    // =================================================
                    // DATE
                    // =================================================

                    const dateInput =
                        document.getElementById(
                            "date"
                        );

                    if (dateInput) {

                        dateInput.value =
                            new Date()
                                .toISOString()
                                .split("T")[0];

                    }


                    // =================================================
                    // TYPE
                    // =================================================

                    const typeInput =
                        document.getElementById(
                            "type"
                        );

                    if (typeInput) {

                        typeInput.value =
                            demande.type || "";

                    }


                    // =================================================
                    // DESCRIPTION / PROBLÈME
                    // =================================================

                    const descriptionInput =
                        document.getElementById(
                            "description"
                        );

                    if (descriptionInput) {

                        descriptionInput.value =
                            demande.probleme || "";

                    }


                    // =================================================
                    // CHAMBRE
                    // =================================================
                    // La chambre n'est renseignée que lorsque
                    // l'intervention concerne réellement une chambre.
                    // =================================================

                    const chambreInput =
                        document.getElementById(
                            "chambre"
                        );

                    if (chambreInput) {

                        const localisation =
                            String(
                                demande.localisation || ""
                            )
                            .trim()
                            .toLowerCase();

                        const concerneChambre =
                            localisation === "chambre";

                        chambreInput.value =
                            concerneChambre
                                ? (demande.chambre || "")
                                : "";

                    }


                    // =================================================
                    // LOCALISATION
                    // =================================================

                    const localisationInput =
                        document.getElementById(
                            "localisation"
                        );

                    if (localisationInput) {

                        localisationInput.value =
                            demande.localisation || "";

                    }


                    // =================================================
                    // NIVEAU / ÉTAGE
                    // =================================================

                    const niveauInput =
                        document.getElementById(
                            "niveau"
                        );

                    if (niveauInput) {

                        niveauInput.value =
                            demande.niveau ||
                            demande.etage ||
                            "";

                    }


                    // =================================================
                    // CÔTÉ
                    // =================================================

                    const coteInput =
                        document.getElementById(
                            "cote"
                        );

                    if (coteInput) {

                        coteInput.value =
                            demande.cote ||
                            "";

                    }


                    // =================================================
                    // TOILETTE
                    // =================================================

                    const toiletteInput =
                        document.getElementById(
                            "toilette"
                        );

                    if (toiletteInput) {

                        toiletteInput.value =
                            demande.toilette ||
                            "";

                    }


                    // =================================================
                    // LIER LE BON À LA DEMANDE
                    // =================================================

                    if (bonForm) {

                        bonForm.dataset.demandeId =
                            id;

                    }


                    // =================================================
                    // ALLER AU FORMULAIRE
                    // =================================================

                    document
                        .querySelector(
                            ".nouveau-card"
                        )
                        ?.scrollIntoView({

                            behavior:
                                "smooth",

                            block:
                                "start"

                        });


                    return;
                }


                // =================================================
                // VALIDATION ACTION
                // =================================================

                if (
                    !id ||
                    !action
                ) {
                    return;
                }


                // =================================================
                // EMPÊCHE LES DOUBLES CLICS
                // =================================================

                if (
                    button.disabled
                ) {
                    return;
                }

                button.disabled = true;


                try {

                    // =================================================
                    // EN COURS
                    // =================================================

                    if (
                        action === "encours"
                    ) {

                        await updateDoc(

                            doc(
                                db,
                                "demandes_etudiants",
                                id
                            ),

                            {
                                statut:
                                    "en_cours",

                                cause:
                                    "",

                                feedbackAutorise:
                                    false,

                                notificationVue:
                                    true
                            }

                        );
                    }


                    // =================================================
                    // FORCLOS
                    // =================================================

                    else if (
                        action === "forclos"
                    ) {

                        await updateDoc(

                            doc(
                                db,
                                "demandes_etudiants",
                                id
                            ),

                            {
                                statut:
                                    "forclos",

                                cause:
                                    "Votre demande a déjà été formulée par un(e) de vos camarades / colocataires.",

                                feedbackAutorise:
                                    false,

                                notificationVue:
                                    true
                            }

                        );
                    }


                    // =================================================
                    // TERMINÉE
                    // =================================================

                    else if (
                        action === "termine"
                    ) {

                        await updateDoc(

                            doc(
                                db,
                                "demandes_etudiants",
                                id
                            ),

                            {
                                statut:
                                    "termine",

                                cause:
                                    "",

                                feedbackAutorise:
                                    true
                            }

                        );
                    }


                    // =================================================
                    // NON TERMINÉE
                    // =================================================

                    else if (
                        action === "nontermine"
                    ) {

                        await updateDoc(

                            doc(
                                db,
                                "demandes_etudiants",
                                id
                            ),

                            {
                                statut:
                                    "non_termine",

                                cause:
                                    "Stock de matériel, merci de formuler votre demande dans les jours à venir.",

                                feedbackAutorise:
                                    false
                            }

                        );
                    }

                } catch (error) {

                    console.error(
                        "❌ Erreur action demande :",
                        error
                    );

                    button.disabled = false;

                    alert(
                        "Impossible de modifier la demande."
                    );
                }

            }
        );


        // =====================================================
        // SUIVI DES BONS
        // =====================================================

        const bonsBody =
            document.getElementById(
                "bons-body"
            );


        async function chargerSuiviBons() {

            if (!bonsBody) {

                console.error(
                    "❌ bons-body introuvable"
                );

                return;
            }


            try {

                const bons =
                    await getBons({

                        site:
                            siteAgent,

                        pavillon:
                            pavillonAgent

                    });


                // =================================================
                // FILTRE : BONS DU JOUR
                // =================================================

                const aujourdHui =
                    new Date()
                        .toISOString()
                        .split("T")[0];


                const bonsDuJour =
                    bons.filter(
                        bon =>
                            bon.date ===
                            aujourdHui
                    );


                bonsBody.innerHTML = "";


                // =================================================
                // AUCUN BON
                // =================================================

                if (
                    bonsDuJour.length === 0
                ) {

                    bonsBody.innerHTML = `

                        <tr class="empty-row">

                            <td colspan="13">

                                Aucun bon aujourd'hui

                            </td>

                        </tr>

                    `;

                    return;
                }


                // =================================================
                // AFFICHAGE
                // =================================================

                bonsDuJour.forEach(
                    (bon) => {

                const boutonSuppression =
                    !lectureSeule &&
                    bon.statut === "envoye"
                        ? `
                            <button
                                type="button"
                                class="bon-delete-btn"
                                data-bon-id="${bon.id}"
                            >
                                Supprimer
                            </button>
                        `
                        : "";


                        bonsBody.innerHTML += `

                            <tr>

                                <!-- ID -->

                                <td>
                                    ${bon.id || "-"}
                                </td>


                                <!-- DATE -->

                                <td>
                                    ${bon.date || "-"}
                                </td>


                                <!-- TYPE -->

                                <td>
                                    ${
                                        typesTravauxMap.get(
                                            bon.type
                                        ) || "-"
                                    }
                                </td>


                                <!-- LOCALISATION -->

                                <td>
                                    ${bon.localisation || "-"}
                                </td>


                                <!-- NIVEAU -->

                                <td>
                                    ${bon.niveau || "-"}
                                </td>


                                <!-- CÔTÉ -->

                                <td>
                                    ${bon.cote || "-"}
                                </td>


                                <!-- CHAMBRE -->

                                <td>
                                    ${bon.chambre || "-"}
                                </td>


                                <!-- TOILETTE -->

                                <td>
                                    ${bon.toilette || "-"}
                                </td>


                                <!-- DESCRIPTION -->

                                <td>
                                    ${bon.description || "-"}
                                </td>

                                <!-- PAR -->

                                <td>
                                    ${bon.par || "-"}
                                </td>


                                <!-- SUPPRESSION -->

                                <td>
                                    ${boutonSuppression}
                                </td>


                                <!-- STATUT -->

                                <td>
                                    ${bon.statut || "-"}
                                </td>


                                <!-- CAUSE -->

                                <td>
                                    ${bon.cause || "-"}
                                </td>

                            </tr>

                        `;
                    }
                );


                // =================================================
                // ACTION SUPPRESSION
                // =================================================

                if (!lectureSeule) {

                    bonsBody
                        .querySelectorAll(
                            ".bon-delete-btn"
                        )
                        .forEach(
                            (button) => {

                                button.addEventListener(
                                    "click",
                                    async () => {

                                        const bonId =
                                            button.dataset.bonId;


                                        if (!bonId) {
                                            return;
                                        }


                                        if (
                                            lectureSeule
                                        ) {

                                            console.warn(
                                                "🔒 Suppression bloquée : session en lecture seule."
                                            );

                                            return;
                                        }


                                        if (
                                            button.disabled
                                        ) {
                                            return;
                                        }


                                        const confirmation =
                                            confirm(
                                                "Voulez-vous vraiment supprimer ce bon ?"
                                            );


                                        if (
                                            !confirmation
                                        ) {
                                            return;
                                        }


                                        button.disabled =
                                            true;


                                        try {

                                            await deleteBon(
                                                bonId
                                            );


                                            await chargerSuiviBons();


                                        } catch (error) {

                                            console.error(
                                                "❌ Suppression du bon :",
                                                error
                                            );

                                            button.disabled =
                                                false;

                                            alert(
                                                "Impossible de supprimer le bon."
                                            );
                                        }

                                    }
                                );

                            }
                        );
                }

            } catch (error) {

                console.error(
                    "❌ Chargement des bons :",
                    error
                );


                bonsBody.innerHTML = `

                    <tr class="empty-row">

                        <td colspan="13">

                            Impossible de charger
                            les bons.

                        </td>

                    </tr>

                `;
            }

        }


        // =====================================================
        // CHARGEMENT INITIAL DU SUIVI
        // =====================================================

        await chargerSuiviBons();


        // =====================================================
        // FIN
        // =====================================================

        console.log(
            "6 - page prête"
        );

        document.body.classList.add(
            "loaded"
        );

    }
);