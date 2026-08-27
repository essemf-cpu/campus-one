import {
    collection,
    query,
    where,
    getDocs,
    setDoc,
    doc,
    serverTimestamp
} from "firebase/firestore";

import {
    auth,
    db
} from "../../../firebase/firebase.js";

import {
    getCurrentUser
} from "../../../auth/authService.js";

import {
    onAuthStateChanged
} from "firebase/auth";


// =====================================================
// CONFIGURATION
// =====================================================

const MONTANT_MENSUEL = 3000;

const COLLECTION_PAIEMENTS =
    "paiementsLoyers";


// =====================================================
// SITUATION DE DÉMONSTRATION DE BASE
// =====================================================
//
// Cette partie sert uniquement de base tant que
// Recouvrement n'est pas encore complètement branché.
//
// Les paiements enregistrés dans Firestore prennent
// ensuite le dessus sur cette situation.
//

const situationBase = {

    anneeAcademique: "2026-2027",

    montantMensuel:
        MONTANT_MENSUEL,

    mois: [

        {
            nom: "Novembre 2026",
            statut: "paye"
        },

        {
            nom: "Décembre 2026",
            statut: "paye"
        },

        {
            nom: "Janvier 2027",
            statut: "a_payer"
        },

        {
            nom: "Février 2027",
            statut: "a_payer"
        },

        {
            nom: "Mars 2027",
            statut: "a_payer"
        },

        {
            nom: "Avril 2027",
            statut: "a_payer"
        },

        {
            nom: "Mai 2027",
            statut: "a_payer"
        },

        {
            nom: "Juin 2027",
            statut: "a_payer"
        },

        {
            nom: "Juillet 2027",
            statut: "a_payer"
        }

    ]

};


// =====================================================
// SITUATION UTILISÉE PAR LA PAGE
// =====================================================

let situation = {

    anneeAcademique:
        situationBase.anneeAcademique,

    montantMensuel:
        situationBase.montantMensuel,

    mois:
        situationBase.mois.map(
            mois => ({
                ...mois
            })
        )

};


// =====================================================
// INFORMATIONS UTILISATEUR
// =====================================================

let utilisateur = null;

let matricule = null;

let anneeAcademique = null;


// =====================================================
// ÉLÉMENTS
// =====================================================

const anneeElement =
    document.getElementById(
        "annee-academique"
    );

const montantTotalElement =
    document.getElementById(
        "montant-total"
    );

const moisAPayerElement =
    document.getElementById(
        "mois-a-payer"
    );

const paiementsList =
    document.getElementById(
        "paiements-list"
    );


// =====================================================
// FORMATAGE
// =====================================================

function formaterMontant(
    montant
) {

    return `${new Intl.NumberFormat(
        "fr-FR"
    ).format(montant)} FCFA`;

}


// =====================================================
// PREMIER MOIS À RÉGULARISER
// =====================================================

function obtenirPremierMoisAPayer() {

    return situation.mois.find(
        mois =>
            mois.statut ===
            "a_payer"
    );

}


// =====================================================
// CHARGER LES PAIEMENTS FIRESTORE
// =====================================================

async function chargerPaiementsFirestore() {


// =====================================================
// CHARGEMENT INITIAL
// =====================================================

paiementsList.innerHTML = `
    <div class="paiements-loading">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <span>Chargement...</span>
    </div>
`;

    if (
        !matricule ||
        !anneeAcademique
    ) {

        return;

    }


    console.log(
        "💰 Chargement des paiements du loyer..."
    );


    const paiementsQuery =
        query(

            collection(
                db,
                COLLECTION_PAIEMENTS
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


    const snapshot =
        await getDocs(
            paiementsQuery
        );


    console.log(
        "💰 Paiements Firestore :",
        snapshot.size
    );


    // =================================================
    // ON REPART DE LA SITUATION DE BASE
    // =================================================

    situation = {

        anneeAcademique,

        montantMensuel:
            MONTANT_MENSUEL,

        mois:
            situationBase.mois.map(
                mois => ({
                    ...mois
                })
            )

    };


    // =================================================
    // APPLICATION DES PAIEMENTS FIRESTORE
    // =================================================

    snapshot.forEach(
        paiementDocument => {

            const paiement =
                paiementDocument.data();


            const moisPaye =
                situation.mois.find(
                    mois =>
                        mois.nom ===
                        paiement.mois
                );


            if (
                moisPaye &&
                paiement.statut ===
                    "paye"
            ) {

                moisPaye.statut =
                    "paye";

            }

        }
    );

}


// =====================================================
// AFFICHER SITUATION
// =====================================================

function afficherSituation() {

    const premierMois =
        obtenirPremierMoisAPayer();


    anneeElement.textContent =
        situation.anneeAcademique;


    if (
        premierMois
    ) {

        montantTotalElement.textContent =
            formaterMontant(
                situation.montantMensuel
            );


        moisAPayerElement.textContent =
            premierMois.nom;

    } else {

        montantTotalElement.textContent =
            "0 FCFA";


        moisAPayerElement.textContent =
            "Aucun mois en attente";

    }

}


// =====================================================
// AFFICHER HISTORIQUE
// =====================================================

function afficherPaiements() {

    paiementsList.innerHTML =
        "";


    situation.mois.forEach(
        mois => {

            const estPaye =
                mois.statut ===
                "paye";


            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "paiement-row";


            element.innerHTML = `

                <div
                    class="paiement-mois"
                >

                    <div
                        class="
                            paiement-status
                            ${
                                estPaye
                                    ? "status-paye"
                                    : "status-attente"
                            }
                        "
                    >

                        <i
                            class="
                                fa-solid
                                ${
                                    estPaye
                                        ? "fa-check"
                                        : "fa-clock"
                                }
                            "
                        ></i>

                    </div>

                    <span>
                        ${mois.nom}
                    </span>

                </div>


                <div
                    class="
                        paiement-etat
                        ${
                            estPaye
                                ? "etat-paye"
                                : "etat-attente"
                        }
                    "
                >

                    ${
                        estPaye
                            ? "Payé"
                            : "À payer"
                    }

                </div>

            `;


            paiementsList.appendChild(
                element
            );

        }
    );

}


// =====================================================
// MODALES
// =====================================================

const paiementModal =
    document.getElementById(
        "paiement-modal"
    );

const plusieursModal =
    document.getElementById(
        "plusieurs-modal"
    );

const recapModal =
    document.getElementById(
        "recap-modal"
    );


// =====================================================
// OUVRIR / FERMER MODALE
// =====================================================

function ouvrirModal(
    modal
) {

    modal.classList.add(
        "show"
    );

    document.body.classList.add(
        "modal-open"
    );

}


function fermerModal(
    modal
) {

    modal.classList.remove(
        "show"
    );


    if (
        !document.querySelector(
            ".modal.show"
        )
    ) {

        document.body.classList.remove(
            "modal-open"
        );

    }

}


// =====================================================
// BOUTON PAYER
// =====================================================

document
    .getElementById(
        "payer-btn"
    )
    .addEventListener(
        "click",
        () => {

            const premierMois =
                obtenirPremierMoisAPayer();


            if (
                !premierMois
            ) {

                alert(
                    "Votre situation est à jour."
                );

                return;

            }


            document.getElementById(
                "modal-mois"
            ).textContent =
                premierMois.nom;


            document.getElementById(
                "montant-mois"
            ).textContent =
                formaterMontant(
                    situation.montantMensuel
                );


            ouvrirModal(
                paiementModal
            );

        }
    );


// =====================================================
// PAYER UNIQUEMENT LE MOIS
// =====================================================

document
    .getElementById("payer-seul-btn")
    .addEventListener("click", () => {

        const premierMois =
            obtenirPremierMoisAPayer();

        if (!premierMois) {
            return;
        }

        // IMPORTANT :
        // Le paiement unique doit également
        // alimenter la sélection utilisée
        // par le bouton "Confirmer et payer".
        moisSelectionnes = [
            premierMois
        ];

        afficherRecap(
            moisSelectionnes
        );

        fermerModal(
            paiementModal
        );

        ouvrirModal(
            recapModal
        );

    });


// =====================================================
// PAYER PLUSIEURS MOIS
// =====================================================

document
    .getElementById(
        "payer-plusieurs-btn"
    )
    .addEventListener(
        "click",
        () => {

            fermerModal(
                paiementModal
            );


            afficherSelectionMois();


            ouvrirModal(
                plusieursModal
            );

        }
    );


// =====================================================
// SÉLECTION DES MOIS
// =====================================================

let moisSelectionnes = [];


function afficherSelectionMois() {

    const container =
        document.getElementById(
            "mois-selection"
        );


    container.innerHTML =
        "";


    moisSelectionnes =
        [];


    const moisAPayer =
        situation.mois.filter(
            mois =>
                mois.statut ===
                "a_payer"
        );


    moisAPayer.forEach(
        (
            mois,
            index
        ) => {


            const element =
                document.createElement(
                    "button"
                );


            element.type =
                "button";


            element.className =
                "mois-option";


            element.dataset.index =
                index;


            element.innerHTML = `

                <div>

                    <strong>
                        ${mois.nom}
                    </strong>

                    <span>
                        ${formaterMontant(
                            situation.montantMensuel
                        )}
                    </span>

                </div>


                <i
                    class="
                        fa-solid
                        fa-circle-check
                    "
                ></i>

            `;


            element.addEventListener(
                "click",
                () => {

                    if (
                        element.classList.contains(
                            "disabled"
                        )
                    ) {

                        return;

                    }


                    toggleMois(
                        index
                    );

                }
            );


            container.appendChild(
                element
            );

        }
    );


    // =================================================
    // PREMIER MOIS AUTOMATIQUEMENT SÉLECTIONNÉ
    // =================================================

    if (
        moisAPayer.length > 0
    ) {

        moisSelectionnes =
            [
                moisAPayer[0]
            ];


        container
            .firstElementChild
            ?.classList.add(
                "selected"
            );

    }


    mettreAJourTotal();

}


// =====================================================
// TOGGLE MOIS
// =====================================================

function toggleMois(
    index
) {

    const moisAPayer =
        situation.mois.filter(
            mois =>
                mois.statut ===
                "a_payer"
        );


    const nouveauMois =
        moisAPayer[index];


    if (
        !nouveauMois
    ) {

        return;

    }


    const position =
        moisSelectionnes.indexOf(
            nouveauMois
        );


    if (
        position !== -1
    ) {

        // On ne retire qu'un mois
        // situé à la fin de la sélection.

        if (
            position !==
            moisSelectionnes.length - 1
        ) {

            return;

        }


        moisSelectionnes.splice(
            position,
            1
        );

    } else {

        // Sélection uniquement
        // dans l'ordre.

        if (
            index !==
            moisSelectionnes.length
        ) {

            return;

        }


        moisSelectionnes.push(
            nouveauMois
        );

    }


    actualiserSelectionVisuelle();

    mettreAJourTotal();

}


// =====================================================
// VISUEL + DISPONIBILITÉ DE LA SÉLECTION
// =====================================================

function actualiserSelectionVisuelle() {

    const options =
        document.querySelectorAll(
            ".mois-option"
        );

    options.forEach(
        (element, index) => {

            const selectionne =
                index <
                moisSelectionnes.length;

            const prochainDisponible =
                index ===
                moisSelectionnes.length;

            element.classList.toggle(
                "selected",
                selectionne
            );

            element.classList.toggle(
                "disabled",
                !selectionne &&
                !prochainDisponible
            );

        }
    );

}


// =====================================================
// TOTAL
// =====================================================

function calculerTotal(
    mois
) {

    return (
        mois.length *
        situation.montantMensuel
    );

}


function mettreAJourTotal() {

    const total =
        calculerTotal(
            moisSelectionnes
        );


    document.getElementById(
        "total-selection"
    ).textContent =
        formaterMontant(
            total
        );

}


// =====================================================
// CONTINUER
// =====================================================

document
    .getElementById(
        "continuer-paiement-btn"
    )
    .addEventListener(
        "click",
        () => {

            if (
                moisSelectionnes.length ===
                0
            ) {

                alert(
                    "Veuillez sélectionner au moins un mois."
                );

                return;

            }


            afficherRecap(
                moisSelectionnes
            );


            fermerModal(
                plusieursModal
            );


            ouvrirModal(
                recapModal
            );

        }
    );


// =====================================================
// RÉCAPITULATIF
// =====================================================

function afficherRecap(
    mois
) {

    const recapList =
        document.getElementById(
            "recap-list"
        );


    recapList.innerHTML =
        "";


    mois.forEach(
        element => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "recap-row";


            row.innerHTML = `

                <span>
                    ${element.nom}
                </span>

                <strong>
                    ${formaterMontant(
                        situation.montantMensuel
                    )}
                </strong>

            `;


            recapList.appendChild(
                row
            );

        }
    );


    document.getElementById(
        "recap-total"
    ).textContent =
        formaterMontant(
            calculerTotal(
                mois
            )
        );

}


// =====================================================
// ENREGISTRER UN PAIEMENT FIRESTORE
// =====================================================
//
// Un document = un mois payé.
//
// Exemple :
//
// paiementsLoyers/
//     2026-2027_MATRICULE_Janvier-2027
//
// Cela permet d'éviter les doublons.
//

async function enregistrerPaiement(
    mois
) {

    if (
        !matricule ||
        !anneeAcademique
    ) {

        throw new Error(
            "UTILISATEUR_NON_INITIALISE"
        );

    }


    const identifiantMois =
        mois.nom
            .replace(
                /\s+/g,
                "-"
            )
            .replace(
                /[^a-zA-Z0-9À-ÿ-]/g,
                ""
            );


    const documentId =
        `${anneeAcademique}_${matricule}_${identifiantMois}`;


    const paiementReference =
        doc(
            db,
            COLLECTION_PAIEMENTS,
            documentId
        );


    await setDoc(
        paiementReference,
        {

            matricule,

            anneeAcademique,

            mois:
                mois.nom,

            montant:
                situation.montantMensuel,

            statut:
                "paye",

            type:
                "loyer",

            origine:
                "campus-one",

            datePaiement:
                serverTimestamp()

        },
        {
            merge: true
        }
    );


    console.log(
        "✅ Paiement enregistré :",
        mois.nom
    );

}


// =====================================================
// CONFIRMATION / PAIEMENT
// =====================================================

document
    .getElementById(
        "confirmer-paiement-btn"
    )
    .addEventListener(
        "click",
        async () => {

            if (
                moisSelectionnes.length ===
                0
            ) {

                return;

            }


            const bouton =
                document.getElementById(
                    "confirmer-paiement-btn"
                );


            const selection =
                [
                    ...moisSelectionnes
                ];


            bouton.disabled =
                true;


            bouton.innerHTML = `

                <i
                    class="
                        fa-solid
                        fa-spinner
                        fa-spin
                    "
                ></i>

                Enregistrement...

            `;


            try {

                // =====================================
                // ENREGISTRER CHAQUE MOIS
                // =====================================

                for (
                    const mois
                    of selection
                ) {

                    await enregistrerPaiement(
                        mois
                    );

                }


                // =====================================
                // METTRE À JOUR LA SITUATION LOCALE
                // =====================================

                selection.forEach(
                    moisPaye => {

                        const mois =
                            situation.mois.find(
                                element =>
                                    element.nom ===
                                    moisPaye.nom
                            );


                        if (
                            mois
                        ) {

                            mois.statut =
                                "paye";

                        }

                    }
                );


                // =====================================
                // ACTUALISER L'INTERFACE
                // =====================================

                afficherSituation();

                afficherPaiements();


                fermerModal(
                    recapModal
                );


                // =====================================
                // MESSAGE
                // =====================================

                alert(
                    selection.length === 1

                        ? `Paiement de ${selection[0].nom} enregistré.`

                        : `${selection.length} mois ont été enregistrés comme payés.`
                );


            } catch (
                error
            ) {

                console.error(
                    "❌ Erreur enregistrement paiement :",
                    error
                );


                alert(
                    "Impossible d'enregistrer le paiement. Veuillez réessayer."
                );


            } finally {

                bouton.disabled =
                    false;


                bouton.innerHTML = `

                    <i
                        class="
                            fa-solid
                            fa-lock
                        "
                    ></i>

                    Confirmer et payer

                `;

            }

        }
    );


// =====================================================
// RÈGLEMENT INTÉRIEUR
// =====================================================

document
    .getElementById(
        "reglement-btn"
    )
    .addEventListener(
        "click",
        () => {

            alert(
                "L'article du règlement intérieur sera disponible prochainement."
            );

        }
    );


// =====================================================
// FERMETURE MODALES
// =====================================================

document
    .getElementById(
        "close-modal"
    )
    .addEventListener(
        "click",
        () => {

            fermerModal(
                paiementModal
            );

        }
    );


document
    .getElementById(
        "close-plusieurs-modal"
    )
    .addEventListener(
        "click",
        () => {

            fermerModal(
                plusieursModal
            );

        }
    );


document
    .getElementById(
        "close-recap-modal"
    )
    .addEventListener(
        "click",
        () => {

            fermerModal(
                recapModal
            );

        }
    );


// =====================================================
// CLIC SUR LE FOND
// =====================================================

document
    .querySelectorAll(
        ".modal"
    )
    .forEach(
        modal => {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        modal
                    ) {

                        fermerModal(
                            modal
                        );

                    }

                }
            );

        }
    );


// =====================================================
// RETOUR
// =====================================================

document
    .getElementById(
        "back-btn"
    )
    .addEventListener(
        "click",
        () => {

            window.history.back();

        }
    );


// =====================================================
// INITIALISATION
// =====================================================

async function initialiser(
    firebaseUser
) {

    try {

        // =============================================
        // UTILISATEUR FIREBASE CONFIRMÉ
        // =============================================

        if (!firebaseUser) {

            throw new Error(
                "UTILISATEUR_NON_CONNECTE"
            );

        }


        // =============================================
        // RÉCUPÉRATION DU PROFIL CAMPUS ONE
        // =============================================

        utilisateur =
            await getCurrentUser(
                firebaseUser.uid
            );


        matricule =
            utilisateur.profile?.matricule;


        anneeAcademique =
            utilisateur.anneeAcademique;


        if (!matricule) {

            throw new Error(
                "MATRICULE_MANQUANT"
            );

        }


        if (!anneeAcademique) {

            throw new Error(
                "ANNEE_MANQUANTE"
            );

        }


        console.log(
            "👤 Matricule :",
            matricule
        );


        console.log(
            "📅 Année académique :",
            anneeAcademique
        );


await chargerPaiementsFirestore();

afficherSituation();
afficherPaiements();


    } catch (error) {

        console.error(
            "❌ Erreur initialisation loyer :",
            error
        );

    }

}


// =====================================================
// ATTENDRE LA RESTAURATION DE LA SESSION FIREBASE
// =====================================================

onAuthStateChanged(
    auth,
    async (firebaseUser) => {

        if (!firebaseUser) {

            console.error(
                "❌ Aucun utilisateur Firebase connecté."
            );

            return;

        }


        console.log(
            "🔥 Utilisateur Firebase restauré :",
            firebaseUser.uid
        );


        await initialiser(
            firebaseUser
        );

    }
);