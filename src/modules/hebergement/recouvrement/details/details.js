import { requireRole } from "../../../../auth/authGuard.js";

import {
    collection,
    query,
    where,
    getDocs
} from "firebase/firestore";

import { db } from "../../../../firebase/firebase.js";

import { loadSidebar } from "../../components/sidebar.js";


// =====================================================
// CONFIGURATION
// =====================================================

const COLLECTION_ETUDIANTS =
    "etudiants";

const COLLECTION_HEBERGEMENTS =
    "hebergements";

const COLLECTION_PAIEMENTS =
    "paiementsLoyers";

const COLLECTION_RECOUVREMENTS =
    "recouvrements";


// =====================================================
// VARIABLES
// =====================================================

let matricule = "";

let anneeAcademique = "";

let etudiant = null;

let hebergement = null;

let paiements = [];

let recouvrement = null;


// =====================================================
// ÉLÉMENTS DOM
// =====================================================

const anneeElement =
    document.getElementById(
        "annee-academique"
    );

const studentInitialsElement =
    document.getElementById(
        "student-initials"
    );

const studentNameElement =
    document.getElementById(
        "student-name"
    );

const studentCardElement =
    document.getElementById(
        "student-card-number"
    );

const studentPavillonElement =
    document.getElementById(
        "student-pavillon"
    );

const studentChambreElement =
    document.getElementById(
        "student-chambre"
    );

const studentLitElement =
    document.getElementById(
        "student-lit"
    );

const totalPayeElement =
    document.getElementById(
        "total-paye"
    );

const totalDuElement =
    document.getElementById(
        "total-du"
    );

const nombrePaiementsElement =
    document.getElementById(
        "nombre-paiements"
    );

const situationPaiementElement =
    document.getElementById(
        "situation-paiement"
    );

const paiementsBody =
    document.getElementById(
        "paiements-body"
    );

const tableTotalElement =
    document.getElementById(
        "table-total"
    );

const situationMensuelleElement =
    document.getElementById(
        "situation-mensuelle"
    );

const retourBtn =
    document.getElementById(
        "retour-btn"
    );


// =====================================================
// ORDRE OFFICIEL DES MOIS
// =====================================================

const ORDRE_MOIS = [

    {
        cle: "novembre",
        libelle: "Novembre 2026",
        ordre: 1,
        codification: true
    },

    {
        cle: "decembre",
        libelle: "Décembre 2026",
        ordre: 2,
        codification: true
    },

    {
        cle: "janvier",
        libelle: "Janvier 2027",
        ordre: 3
    },

    {
        cle: "fevrier",
        libelle: "Février 2027",
        ordre: 4
    },

    {
        cle: "mars",
        libelle: "Mars 2027",
        ordre: 5
    },

    {
        cle: "avril",
        libelle: "Avril 2027",
        ordre: 6
    },

    {
        cle: "mai",
        libelle: "Mai 2027",
        ordre: 7
    },

    {
        cle: "juin",
        libelle: "Juin 2027",
        ordre: 8
    },

    {
        cle: "juillet",
        libelle: "Juillet 2027",
        ordre: 9
    }

];


// =====================================================
// FORMATAGE MONTANT
// =====================================================

function formaterMontant(
    montant
) {

    return `${new Intl.NumberFormat(
        "fr-FR"
    ).format(
        Number(montant) || 0
    )} FCFA`;

}


// =====================================================
// FORMATAGE DATE
// =====================================================

function formaterDate(
    date
) {

    if (!date) {

        return "-";

    }


    try {

        let valeur = date;


        if (
            typeof date.toDate ===
            "function"
        ) {

            valeur =
                date.toDate();

        }


        const dateObj =
            valeur instanceof Date
                ? valeur
                : new Date(
                    valeur
                );


        if (
            Number.isNaN(
                dateObj.getTime()
            )
        ) {

            return "-";

        }


        return new Intl.DateTimeFormat(
            "fr-FR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        ).format(
            dateObj
        );

    } catch {

        return "-";

    }

}


// =====================================================
// CONVERTIR DATE
// =====================================================

function convertirDate(
    date
) {

    if (!date) {

        return 0;

    }


    if (
        typeof date.toDate ===
        "function"
    ) {

        return date.toDate().getTime();

    }


    const valeur =
        new Date(
            date
        ).getTime();


    return Number.isNaN(
        valeur
    )
        ? 0
        : valeur;

}


// =====================================================
// EXTRAIRE NUMÉRO DU LIT
// =====================================================

function extraireNumeroLit(
    valeur
) {

    if (
        valeur === null ||
        valeur === undefined
    ) {

        return "-";

    }


    const texte =
        String(
            valeur
        ).trim();


    if (!texte) {

        return "-";

    }


    const match =
        texte.match(
            /(\d+)$/
        );


    return match
        ? match[1]
        : texte;

}


// =====================================================
// ÉCHAPPER HTML
// =====================================================

function escapeHtml(
    value = ""
) {

    return String(
        value
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// RÉFÉRENCE DU PAIEMENT
// =====================================================
//
// Source de vérité :
// 1. quittance
// 2. reference
// 3. ID du document Firestore
//
// =====================================================

function obtenirReferencePaiement(
    paiement
) {

    return (

        paiement.quittance ||

        paiement.reference ||

        paiement.id ||

        "-"

    );

}


// =====================================================
// ORDRE D'UN MOIS
// =====================================================

function obtenirOrdreMois(
    libelle
) {

    const texte =
        String(
            libelle ||
            ""
        )
            .toLowerCase()
            .trim();


    const element =
        ORDRE_MOIS.find(
            mois =>
                mois.libelle
                    .toLowerCase()
                    .trim() ===
                texte
        );


    return element
        ? element.ordre
        : 999;

}


// =====================================================
// MOIS DE CODIFICATION
// =====================================================

function estMoisCodification(
    libelle
) {

    const texte =
        String(
            libelle ||
            ""
        )
            .toLowerCase()
            .trim();


    return (
        texte ===
            "novembre 2026" ||

        texte ===
            "décembre 2026"
    );

}


// =====================================================
// CHARGER L'ÉTUDIANT
// =====================================================

async function chargerEtudiant() {

    if (!matricule) {

        throw new Error(
            "Matricule absent de l'URL."
        );

    }


    const snapshot =
        await getDocs(
            query(
                collection(
                    db,
                    COLLECTION_ETUDIANTS
                ),
                where(
                    "matricule",
                    "==",
                    matricule
                )
            )
        );


    if (
        snapshot.empty
    ) {

        throw new Error(
            `Étudiant introuvable : ${matricule}`
        );

    }


    const document =
        snapshot.docs[0];


    etudiant = {

        id:
            document.id,

        ...document.data()

    };

}


// =====================================================
// CHARGER L'HÉBERGEMENT
// =====================================================

async function chargerHebergement() {

    if (!matricule) {

        return;

    }


    const snapshot =
        await getDocs(
            query(
                collection(
                    db,
                    COLLECTION_HEBERGEMENTS
                ),
                where(
                    "matricule",
                    "==",
                    matricule
                )
            )
        );


    if (
        snapshot.empty
    ) {

        hebergement =
            null;

        return;

    }


    const documents =
        snapshot.docs.map(
            document => ({

                id:
                    document.id,

                ...document.data()

            })
        );


    const correspondant =
        documents.find(
            element =>
                element.anneeAcademique ===
                    anneeAcademique &&
                (
                    element.statutOccupation ===
                        "actif" ||
                    element.statutOccupation ===
                        undefined
                )
        );


    hebergement =
        correspondant ||
        documents.find(
            element =>
                element.anneeAcademique ===
                anneeAcademique
        ) ||
        documents[0] ||
        null;

}


// =====================================================
// CHARGER LES PAIEMENTS
// =====================================================

async function chargerPaiements() {

    const snapshot =
        await getDocs(
            query(
                collection(
                    db,
                    COLLECTION_PAIEMENTS
                ),
                where(
                    "matricule",
                    "==",
                    matricule
                )
            )
        );


    paiements =
        snapshot.docs
            .map(
                document => ({

                    id:
                        document.id,

                    ...document.data()

                })
            )
            .filter(
                paiement =>
                    !anneeAcademique ||
                    paiement.anneeAcademique ===
                    anneeAcademique
            )
            .filter(
                paiement =>
                    paiement.type ===
                        "loyer" ||
                    !paiement.type
            )
            .filter(
                paiement =>
                    paiement.statut ===
                    "paye"
            );


    // =================================================
    // HISTORIQUE :
    // DU PREMIER PAIEMENT AU PLUS RÉCENT
    // =================================================

    paiements.sort(
        (
            a,
            b
        ) => {

            const ordreA =
                obtenirOrdreMois(
                    a.mois
                );

            const ordreB =
                obtenirOrdreMois(
                    b.mois
                );


            if (
                ordreA !==
                ordreB
            ) {

                return (
                    ordreA -
                    ordreB
                );

            }


            return (
                convertirDate(
                    a.datePaiement
                ) -
                convertirDate(
                    b.datePaiement
                )
            );

        }
    );

}


// =====================================================
// CHARGER LE RECOUVREMENT
// =====================================================

async function chargerRecouvrement() {

    const snapshot =
        await getDocs(
            query(
                collection(
                    db,
                    COLLECTION_RECOUVREMENTS
                ),
                where(
                    "anneeAcademique",
                    "==",
                    anneeAcademique
                ),
                where(
                    "matricule",
                    "==",
                    matricule
                )
            )
        );


    if (
        snapshot.empty
    ) {

        recouvrement =
            creerRecouvrementParDefaut();

        return;

    }


    const document =
        snapshot.docs[0];


    recouvrement = {

        id:
            document.id,

        ...document.data()

    };

}


// =====================================================
// RECOUVREMENT PAR DÉFAUT
// =====================================================

function creerRecouvrementParDefaut() {

    const mois = {};


    ORDRE_MOIS.forEach(
        element => {

            mois[element.cle] = {

                libelle:
                    element.libelle,

                statut:
                    element.codification
                        ? "codification"
                        : "a_payer",

                datePaiement:
                    null,

                montant:
                    0

            };

        }
    );


    return {

        matricule,

        anneeAcademique,

        montantMensuel:
            3000,

        mois

    };

}


// =====================================================
// APPLIQUER LES PAIEMENTS
// =====================================================

function appliquerPaiements() {

    if (
        !recouvrement
    ) {

        recouvrement =
            creerRecouvrementParDefaut();

    }


    if (
        !recouvrement.mois
    ) {

        recouvrement.mois =
            {};

    }


    // =================================================
    // INITIALISATION DES MOIS
    // =================================================

    ORDRE_MOIS.forEach(
        element => {

            if (
                !recouvrement.mois[
                    element.cle
                ]
            ) {

                recouvrement.mois[
                    element.cle
                ] = {

                    libelle:
                        element.libelle,

                    statut:
                        element.codification
                            ? "codification"
                            : "a_payer",

                    datePaiement:
                        null,

                    montant:
                        0

                };

            }

        }
    );


    // =================================================
    // NOVEMBRE / DÉCEMBRE
    // =================================================
    //
    // Ces deux mois correspondent au démarrage /
    // à la codification.
    //
    // Ils ne doivent donc pas générer de dette.
    //
    // =================================================

    ORDRE_MOIS
        .filter(
            element =>
                element.codification
        )
        .forEach(
            element => {

                const mois =
                    recouvrement.mois[
                        element.cle
                    ];


                if (
                    mois &&
                    mois.statut !==
                    "paye"
                ) {

                    mois.statut =
                        "codification";

                    mois.datePaiement =
                        null;

                    mois.montant =
                        0;

                }

            }
        );


    // =================================================
    // APPLICATION DES PAIEMENTS RÉELS
    // =================================================

    paiements.forEach(
        paiement => {

            const moisPaye =
                Object.values(
                    recouvrement.mois
                ).find(
                    mois =>
                        mois &&
                        mois.libelle ===
                        paiement.mois
                );


            if (
                !moisPaye
            ) {

                return;

            }


            moisPaye.statut =
                "paye";

            moisPaye.datePaiement =
                paiement.datePaiement ||
                null;

            moisPaye.montant =
                Number(
                    paiement.montant
                ) || 0;

        }
    );

}


// =====================================================
// AFFICHER IDENTITÉ
// =====================================================

function afficherIdentite() {

    if (!etudiant) {

        return;

    }


    const nom =
        String(
            etudiant.nom ||
            ""
        ).trim();

    const prenom =
        String(
            etudiant.prenom ||
            ""
        ).trim();


    const nomComplet =
        `${prenom} ${nom}`.trim();


    const initiales =
        (
            (
                prenom.charAt(0) ||
                ""
            ) +
            (
                nom.charAt(0) ||
                ""
            )
        )
            .toUpperCase();


    if (
        studentInitialsElement
    ) {

        studentInitialsElement.textContent =
            initiales ||
            "—";

    }


    if (
        studentNameElement
    ) {

        studentNameElement.textContent =
            nomComplet ||
            matricule;

    }


    if (
        studentCardElement
    ) {

        studentCardElement.textContent =
            etudiant.numeroEtudiant ||
            etudiant.numeroCarte ||
            etudiant.carte ||
            etudiant.matricule ||
            matricule;

    }


    if (
        anneeElement
    ) {

        anneeElement.textContent =
            anneeAcademique ||
            "—";

    }


    if (
        studentPavillonElement
    ) {

        studentPavillonElement.textContent =
            hebergement?.pavillon ||
            "—";

    }


    if (
        studentChambreElement
    ) {

        studentChambreElement.textContent =
            hebergement?.chambre ||
            "—";

    }


    if (
        studentLitElement
    ) {

        studentLitElement.textContent =
            extraireNumeroLit(
                hebergement?.lit ||
                hebergement?.numeroLit ||
                hebergement?.bed ||
                ""
            );

    }

}


// =====================================================
// CALCULER LA DETTE
// =====================================================

function calculerMontantDu() {

    const montantMensuel =
        Number(
            recouvrement?.montantMensuel
        ) || 3000;


    return Object.values(
        recouvrement?.mois ||
        {}
    )
        .filter(
            mois =>
                mois &&
                mois.statut ===
                "a_payer"
        )
        .reduce(
            (
                total
            ) =>
                total +
                montantMensuel,
            0
        );

}


// =====================================================
// AFFICHER RÉSUMÉ
// =====================================================

function afficherResume() {

    const totalPaye =
        paiements.reduce(
            (
                total,
                paiement
            ) =>
                total +
                (
                    Number(
                        paiement.montant
                    ) || 0
                ),
            0
        );


    const montantDu =
        calculerMontantDu();


    if (
        totalPayeElement
    ) {

        totalPayeElement.textContent =
            formaterMontant(
                totalPaye
            );

    }


    if (
        totalDuElement
    ) {

        totalDuElement.textContent =
            formaterMontant(
                montantDu
            );

    }


    if (
        nombrePaiementsElement
    ) {

        nombrePaiementsElement.textContent =
            paiements.length;

    }


if (
    situationPaiementElement
) {

    const nombreMoisRestants =
        Object.values(
            recouvrement?.mois || {}
        )
        .filter(
            mois =>
                mois &&
                mois.statut ===
                "a_payer"
        )
        .length;


    situationPaiementElement.textContent =
        nombreMoisRestants === 0
            ? "À jour"
            : `${nombreMoisRestants} mois restant${
                nombreMoisRestants > 1
                    ? "s"
                    : ""
              } à régulariser`;


    situationPaiementElement.className =
        nombreMoisRestants === 0
            ? "status"
            : "status status-due";

}

}


// =====================================================
// AJOUTER COLONNE RÉFÉRENCE / QUITTANCE
// =====================================================
//
// On l'ajoute dynamiquement pour éviter de toucher
// au HTML à cette étape.
//
// =====================================================

function ajouterColonneReference() {

    const table =
        document.querySelector(
            ".payment-table"
        );


    if (!table) {

        return;

    }


    const header =
        table.querySelector(
            "thead tr"
        );


    if (
        !header ||
        header.querySelector(
            ".reference-header"
        )
    ) {

        return;

    }


    const th =
        document.createElement(
            "th"
        );


    th.className =
        "reference-header";


    th.textContent =
        "Quittance / Référence";


    const statutHeader =
        header.children[
            header.children.length - 1
        ];


    header.insertBefore(
        th,
        statutHeader
    );

}


// =====================================================
// AFFICHER HISTORIQUE
// =====================================================

function afficherPaiements() {

    if (
        !paiementsBody
    ) {

        return;

    }


    ajouterColonneReference();


    paiementsBody.innerHTML =
        "";


    if (
        paiements.length ===
        0
    ) {

        paiementsBody.innerHTML = `

            <tr class="empty-row">

                <td colspan="6">

                    Aucun paiement enregistré
                    pour cet étudiant.

                </td>

            </tr>

        `;


        if (
            tableTotalElement
        ) {

            tableTotalElement.textContent =
                "0 FCFA";

        }


        return;

    }


    paiements.forEach(
        (
            paiement,
            index
        ) => {

            const tr =
                document.createElement(
                    "tr"
                );


            const reference =
                obtenirReferencePaiement(
                    paiement
                );


            tr.innerHTML = `

                <td>

                    ${index + 1}

                </td>


                <td>

                    <strong>

                        ${escapeHtml(
                            paiement.mois ||
                            "-"
                        )}

                    </strong>

                </td>


                <td>

                    ${escapeHtml(
                        formaterDate(
                            paiement.datePaiement
                        )
                    )}

                </td>


                <td>

                    ${formaterMontant(
                        paiement.montant
                    )}

                </td>


                <td>

                    <strong>

                        ${escapeHtml(
                            reference
                        )}

                    </strong>

                </td>


                <td>

                    <span class="payment-status">

                        Payé

                    </span>

                </td>

            `;


            paiementsBody.appendChild(
                tr
            );

        }
    );


    const total =
        paiements.reduce(
            (
                somme,
                paiement
            ) =>
                somme +
                (
                    Number(
                        paiement.montant
                    ) || 0
                ),
            0
        );


    if (
        tableTotalElement
    ) {

        tableTotalElement.textContent =
            formaterMontant(
                total
            );

    }

}


// =====================================================
// AFFICHER SITUATION MENSUELLE
// =====================================================

function afficherSituationMensuelle() {

    if (
        !situationMensuelleElement
    ) {

        return;

    }


    situationMensuelleElement.innerHTML =
        "";


    // =================================================
    // ORDRE NOVEMBRE → JUILLET
    // =================================================

    const mois =
        ORDRE_MOIS.map(
            element => {

                const donnees =
                    Object.values(
                        recouvrement?.mois ||
                        {}
                    ).find(
                        moisInfo =>
                            moisInfo &&
                            (
                                moisInfo.libelle ===
                                element.libelle
                            )
                    );


                return {

                    ...element,

                    ...(donnees || {

                        libelle:
                            element.libelle,

                        statut:
                            element.codification
                                ? "codification"
                                : "a_payer",

                        datePaiement:
                            null,

                        montant:
                            0

                    })

                };

            }
        );


    mois.forEach(
        moisInfo => {

            const paye =
                moisInfo.statut ===
                "paye";


            const codification =
                moisInfo.statut ===
                "codification";


            const carte =
                document.createElement(
                    "div"
                );


            carte.className =
                "month-card";


            let statutHTML = "";


            if (
                paye
            ) {

                statutHTML = `

                    <span class="month-paid">

                        Payé · ${formaterMontant(
                            moisInfo.montant
                        )}

                    </span>

                `;

            } else if (
                codification
            ) {

                statutHTML = `

                    <span class="month-codification">

                        Codification

                    </span>

                `;

            } else {

                statutHTML = `

                    <span class="month-unpaid">

                        À payer

                    </span>

                `;

            }


            let sousTexte = "";


            if (
                paye
            ) {

                sousTexte =
                    formaterDate(
                        moisInfo.datePaiement
                    );

            } else if (
                codification
            ) {

                sousTexte =
                    "Début d'année académique";

            } else {

                sousTexte =
                    "Aucun paiement enregistré";

            }


            carte.innerHTML = `

                <div class="month-info">

                    <strong>

                        ${escapeHtml(
                            moisInfo.libelle
                        )}

                    </strong>


                    <span>

                        ${escapeHtml(
                            sousTexte
                        )}

                    </span>

                </div>


                <div>

                    ${statutHTML}

                </div>

            `;


            situationMensuelleElement.appendChild(
                carte
            );

        }
    );

}


// =====================================================
// RETOUR
// =====================================================

if (
    retourBtn
) {

    retourBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "../index.html";

        }
    );

}


// =====================================================
// INITIALISATION
// =====================================================

const params =
    new URLSearchParams(
        window.location.search
    );

matricule =
    String(
        params.get(
            "matricule"
        ) || ""
    ).trim();


requireRole(
    "agent",

    async ({
        profile,
        affectation,
        anneeAcademique: anneeSession
    }) => {

        try {

            // =============================================
            // SERVICE
            // =============================================

            if (
                profile.service !==
                "Service de l'Hébergement"
            ) {

                console.error(
                    "❌ Accès refusé : service incorrect."
                );

                return;

            }


            // =============================================
            // SIDEBAR
            // =============================================

            await loadSidebar(
                profile
            );


            // =============================================
            // ANNÉE
            // =============================================

            anneeAcademique =
                anneeSession ||
                "";


            // =============================================
            // MATRICULE
            // =============================================

            if (!matricule) {

                throw new Error(
                    "Aucun matricule fourni."
                );

            }


            console.log(
                "💰 Détails recouvrement :",
                {
                    matricule,
                    anneeAcademique
                }
            );


            // =============================================
            // CHARGEMENT
            // =============================================

            await chargerEtudiant();


            await Promise.all([

                chargerHebergement(),

                chargerPaiements(),

                chargerRecouvrement()

            ]);


            // =============================================
            // APPLICATION
            // =============================================

            appliquerPaiements();


            // =============================================
            // AFFICHAGE
            // =============================================

            afficherIdentite();

            afficherResume();

            afficherPaiements();

            afficherSituationMensuelle();


            console.log(
                "💰 Paiements de l'étudiant :",
                paiements
            );


        } catch (
            error
        ) {

            console.error(
                "❌ Erreur chargement détails :",
                error
            );


            if (
                studentNameElement
            ) {

                studentNameElement.textContent =
                    "Impossible de charger les données";

            }


            if (
                paiementsBody
            ) {

                paiementsBody.innerHTML = `

                    <tr class="empty-row">

                        <td colspan="6">

                            Impossible de charger
                            les informations de paiement.

                        </td>

                    </tr>

                `;

            }


            if (
                situationMensuelleElement
            ) {

                situationMensuelleElement.innerHTML = `

                    <div class="monthly-empty">

                        Impossible de charger
                        la situation mensuelle.

                    </div>

                `;

            }

        } finally {

            document.body.classList.add(
                "loaded"
            );

        }

    }
);