import { requireRole } from "../../../auth/authGuard.js";

import {
    collection,
    query,
    where,
    getDocs,
    onSnapshot
} from "firebase/firestore";

import { db } from "../../../firebase/firebase.js";

import { loadSidebar } from "../components/sidebar.js";

import recouvrementsSeed
    from "../../../../scripts/data/seed/recouvrements.js";


// =====================================================
// CONFIGURATION
// =====================================================

const COLLECTION_RECOUVREMENTS =
    "recouvrements";

const COLLECTION_PAIEMENTS =
    "paiementsLoyers";

const TABLEAU_BORD_URL =
    "../dashboard/index.html";


// =====================================================
// VARIABLES
// =====================================================

let recouvrements = [];

let etudiants = new Map();

let hebergements = new Map();

let paiementsLoyers = [];

let donneesRecouvrementOriginales = [];

let unsubscribePaiementsLoyers = null;


// =====================================================
// ÉLÉMENTS DOM
// =====================================================

const body =
    document.getElementById(
        "recouvrement-body"
    );

const totalEtudiantsElement =
    document.getElementById(
        "total-etudiants"
    );

const totalRecouvrementElement =
    document.getElementById(
        "total-recouvrement"
    );

const totalPayeElement =
    document.getElementById(
        "total-paye"
    );

const totalDuElement =
    document.getElementById(
        "total-du"
    );

const searchInput =
    document.getElementById(
        "search-recouvrement"
    );

const chambreFilter =
    document.getElementById(
        "chambre-filter"
    );

const statutFilter =
    document.getElementById(
        "statut-filter"
    );

const anneeElement =
    document.getElementById(
        "annee-academique"
    );

const pavillonElement =
    document.getElementById(
        "pavillon-concerne"
    );


// =====================================================
// FORMATAGE DES MONTANTS
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
// CHARGER LES RECOUVREMENTS
// =====================================================

async function chargerRecouvrements(
    anneeAcademique
) {

    try {

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
                    )
                )
            );


        if (
            !snapshot.empty
        ) {

            return snapshot.docs.map(
                document => ({

                    id:
                        document.id,

                    ...document.data()

                })
            );

        }

    } catch (error) {

        console.warn(
            "⚠️ Impossible de lire les recouvrements Firestore. Utilisation du seed.",
            error
        );

    }


    return recouvrementsSeed.filter(
        recouvrement =>
            recouvrement.anneeAcademique ===
            anneeAcademique
    );

}


// =====================================================
// CHARGER LES PAIEMENTS INITIALEMENT
// =====================================================

async function chargerPaiementsLoyers(
    anneeAcademique
) {

    try {

        const snapshot =
            await getDocs(
                query(
                    collection(
                        db,
                        COLLECTION_PAIEMENTS
                    ),
                    where(
                        "anneeAcademique",
                        "==",
                        anneeAcademique
                    ),
                    where(
                        "statut",
                        "==",
                        "paye"
                    )
                )
            );


        paiementsLoyers =
            snapshot.docs.map(
                document => ({

                    id:
                        document.id,

                    ...document.data()

                })
            );


        console.log(
            "💰 Paiements loyers :",
            paiementsLoyers.length
        );

    } catch (error) {

        console.error(
            "❌ Impossible de charger les paiements de loyers :",
            error
        );

        paiementsLoyers = [];

    }

}


// =====================================================
// ÉCOUTE TEMPS RÉEL DES PAIEMENTS
// =====================================================

function ecouterPaiementsLoyers(
    anneeAcademique
) {

    if (
        typeof unsubscribePaiementsLoyers ===
        "function"
    ) {

        unsubscribePaiementsLoyers();

        unsubscribePaiementsLoyers =
            null;

    }


    const paiementsQuery =
        query(
            collection(
                db,
                COLLECTION_PAIEMENTS
            ),
            where(
                "anneeAcademique",
                "==",
                anneeAcademique
            ),
            where(
                "statut",
                "==",
                "paye"
            )
        );


    unsubscribePaiementsLoyers =
        onSnapshot(

            paiementsQuery,

            snapshot => {

                paiementsLoyers =
                    snapshot.docs.map(
                        document => ({

                            id:
                                document.id,

                            ...document.data()

                        })
                    );


                console.log(
                    "🔄 Paiements loyers mis à jour en temps réel :",
                    paiementsLoyers.length
                );


                reconstruireRecouvrements();

            },

            error => {

                console.error(
                    "❌ Erreur écoute temps réel paiementsLoyers :",
                    error
                );

            }

        );

}


// =====================================================
// RECONSTRUIRE LES RECOUVREMENTS
// =====================================================

function reconstruireRecouvrements() {

    recouvrements =
        donneesRecouvrementOriginales;


    const lignes =
        Array.from(
            hebergements.values()
        )

        .map(
            construireLigneDepuisHebergement
        )

        .filter(Boolean);


    recouvrements =
        lignes;


    recouvrements.sort(
        (a, b) => {

            const chambreA =
                String(
                    a.chambre
                );


            const chambreB =
                String(
                    b.chambre
                );


            const comparaison =
                chambreA.localeCompare(
                    chambreB,
                    "fr",
                    {
                        numeric:
                            true
                    }
                );


            if (
                comparaison !==
                0
            ) {

                return comparaison;

            }


            return String(
                a.lit
            ).localeCompare(
                String(
                    b.lit
                ),
                "fr",
                {
                    numeric:
                        true
                }
            );

        }
    );


    remplirFiltreChambres();

    afficherRecouvrements();

}


// =====================================================
// APPLIQUER LES PAIEMENTS RÉELS
// =====================================================

function appliquerPaiementsReels(
    recouvrement,
    matricule
) {

    if (
        !recouvrement ||
        !recouvrement.mois
    ) {

        return;

    }


    const paiementsEtudiant =
        paiementsLoyers.filter(
            paiement =>
                String(
                    paiement.matricule
                ) ===
                String(
                    matricule
                ) &&
                paiement.statut ===
                "paye"
        );


    paiementsEtudiant.forEach(
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

                console.warn(
                    "⚠️ Mois de paiement introuvable dans le recouvrement :",
                    {
                        matricule,
                        moisPaiement:
                            paiement.mois
                    }
                );

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
// CHARGER LES ÉTUDIANTS
// =====================================================

async function chargerEtudiants() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "etudiants"
            )
        );


    etudiants.clear();


    snapshot.docs.forEach(
        document => {

            const etudiant =
                document.data();


            if (
                !etudiant.matricule
            ) {

                return;

            }


            etudiants.set(
                String(
                    etudiant.matricule
                ),
                {

                    ...etudiant,

                    id:
                        document.id

                }
            );

        }
    );

}


// =====================================================
// CHARGER LES HÉBERGEMENTS
// =====================================================

async function chargerHebergements(
    site,
    pavillon,
    anneeAcademique,
    lectureSeule
) {

    const snapshot =
        await getDocs(
            query(
                collection(
                    db,
                    "hebergements"
                ),
                where(
                    "site",
                    "==",
                    site
                )
            )
        );


    hebergements.clear();


    snapshot.docs.forEach(
        document => {

            const hebergement =
                document.data();


            if (
                hebergement.pavillon !==
                pavillon
            ) {

                return;

            }


            if (
                hebergement.typeOccupation ===
                "suppleant"
            ) {

                return;

            }


            if (
                hebergement.anneeAcademique !==
                anneeAcademique
            ) {

                return;

            }


            if (
                !lectureSeule &&
                hebergement.statutOccupation !==
                "actif"
            ) {

                return;

            }


            if (
                !hebergement.matricule
            ) {

                return;

            }


            hebergements.set(
                String(
                    hebergement.matricule
                ),
                {

                    ...hebergement,

                    id:
                        document.id

                }
            );

        }
    );

}


// =====================================================
// CALCULER LE MONTANT PAYÉ
// =====================================================

function calculerMontantPaye(
    recouvrement
) {

    if (
        !recouvrement
    ) {

        return 0;

    }


    const matricule =
        String(
            recouvrement.matricule ||
            ""
        );


    return paiementsLoyers
        .filter(
            paiement =>
                String(
                    paiement.matricule
                ) ===
                matricule &&
                paiement.statut ===
                "paye"
        )
        .reduce(
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

}


// =====================================================
// CALCULER LE MONTANT DÛ
// =====================================================

function calculerMontantDu(
    recouvrement
) {

    if (
        !recouvrement
    ) {

        return 0;

    }


    const montantMensuel =
        Number(
            recouvrement.montantMensuel
        ) || 0;


    let montantDu = 0;


    if (
        recouvrement.mois
    ) {

        Object.values(
            recouvrement.mois
        ).forEach(
            mois => {

                if (
                    mois &&
                    mois.statut ===
                    "a_payer"
                ) {

                    montantDu +=
                        montantMensuel;

                }

            }
        );

    }


    return montantDu;

}


// =====================================================
// CRÉER UNE SITUATION PAR DÉFAUT
// =====================================================

function creerSituationParDefaut(
    matricule,
    anneeAcademique
) {

    const moisNoms = [

        [
            "novembre",
            "Novembre 2026"
        ],

        [
            "decembre",
            "Décembre 2026"
        ],

        [
            "janvier",
            "Janvier 2027"
        ],

        [
            "fevrier",
            "Février 2027"
        ],

        [
            "mars",
            "Mars 2027"
        ],

        [
            "avril",
            "Avril 2027"
        ],

        [
            "mai",
            "Mai 2027"
        ],

        [
            "juin",
            "Juin 2027"
        ],

        [
            "juillet",
            "Juillet 2027"
        ]

    ];


    const mois = {};


    moisNoms.forEach(
        ([cle, libelle]) => {

            mois[cle] = {

                libelle,

                statut:
                    "a_payer",

                datePaiement:
                    null,

                montant:
                    0

            };

        }
    );


    return {

        id:
            `${anneeAcademique}_${matricule}`,

        matricule,

        anneeAcademique,

        montantMensuel:
            3000,

        mois,

        dernierPaiement: {

            date:
                null,

            montant:
                0,

            mois:
                [],

            mode:
                null

        },

        statut:
            "en_cours"

    };

}


// =====================================================
// CONSTRUIRE UNE LIGNE
// =====================================================

function construireLigneDepuisHebergement(
    hebergement
) {

    const matricule =
        String(
            hebergement.matricule ||
            ""
        );


    const etudiant =
        etudiants.get(
            matricule
        );


    if (
        !etudiant
    ) {

        return null;

    }


    let recouvrement =
        donneesRecouvrementOriginales.find(
            element =>
                String(
                    element.matricule
                ) ===
                matricule
        );


    if (
        !recouvrement
    ) {

        recouvrement =
            creerSituationParDefaut(
                matricule,
                hebergement.anneeAcademique
            );

    }


    appliquerPaiementsReels(
        recouvrement,
        matricule
    );


    const montantPaye =
        calculerMontantPaye(
            recouvrement
        );


    const montantDu =
        calculerMontantDu(
            recouvrement
        );


    const moisEnRetard =
        Object.values(
            recouvrement.mois || {}
        ).filter(
            mois =>
                mois &&
                mois.statut ===
                "a_payer"
        );


    return {

        matricule,

        chambre:
            hebergement.chambre ||
            "-",

        lit:
            extraireNumeroLit(
                hebergement.lit ||
                hebergement.numeroLit ||
                hebergement.bed ||
                ""
            ),

        carte:
            etudiant.numeroEtudiant ||
            etudiant.numeroCarte ||
            etudiant.carte ||
            etudiant.matricule ||
            "-",

        nom:
            etudiant.nom ||
            "",

        prenom:
            etudiant.prenom ||
            "",

        montantPaye,

        montantDu,

        moisEnRetard,

        recouvrement

    };

}


// =====================================================
// EXTRAIRE LE NUMÉRO DU LIT
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


    if (
        !texte
    ) {

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
// REMPLIR LE FILTRE CHAMBRE
// =====================================================

function remplirFiltreChambres() {

    if (
        !chambreFilter
    ) {

        return;

    }


    const chambres =
        [
            ...new Set(
                recouvrements
                    .map(
                        ligne =>
                            String(
                                ligne.chambre
                            )
                    )
                    .filter(
                        chambre =>
                            chambre &&
                            chambre !== "-"
                    )
            )
        ];


    chambres.sort(
        (a, b) =>
            a.localeCompare(
                b,
                "fr",
                {
                    numeric:
                        true
                }
            )
    );


    const ancienneValeur =
        chambreFilter.value;


    chambreFilter.innerHTML = `
        <option value="">
            Toutes les chambres
        </option>
    `;


    chambres.forEach(
        chambre => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                chambre;


            option.textContent =
                chambre;


            chambreFilter.appendChild(
                option
            );

        }
    );


    if (
        chambres.includes(
            ancienneValeur
        )
    ) {

        chambreFilter.value =
            ancienneValeur;

    }

}


// =====================================================
// AFFICHER LE TABLEAU
// =====================================================

function afficherRecouvrements() {

    if (
        !body
    ) {

        return;

    }


    const recherche =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const chambre =
        chambreFilter
            ? chambreFilter.value
            : "";


    const statut =
        statutFilter
            ? statutFilter.value
            : "";


    const resultat =
        recouvrements.filter(
            ligne => {

                const texte =
                    [

                        ligne.chambre,

                        ligne.lit,

                        ligne.carte,

                        ligne.matricule,

                        ligne.prenom,

                        ligne.nom

                    ]

                    .filter(Boolean)

                    .join(" ")

                    .toLowerCase();


                const rechercheOK =
                    !recherche ||
                    texte.includes(
                        recherche
                    );


                const chambreOK =
                    !chambre ||
                    String(
                        ligne.chambre
                    ) ===
                    String(
                        chambre
                    );


                let statutOK =
                    true;


                if (
                    statut ===
                    "paye"
                ) {

                    statutOK =
                        ligne.montantDu ===
                        0;

                }


                if (
                    statut ===
                    "du"
                ) {

                    statutOK =
                        ligne.montantDu >
                        0;

                }


                return (
                    rechercheOK &&
                    chambreOK &&
                    statutOK
                );

            }
        );


    body.innerHTML =
        "";


    const totalEtudiants =
        recouvrements.length;


    const totalPaye =
        recouvrements.reduce(
            (
                total,
                ligne
            ) =>
                total +
                (
                    Number(
                        ligne.montantPaye
                    ) || 0
                ),
            0
        );


    const totalDu =
        recouvrements.reduce(
            (
                total,
                ligne
            ) =>
                total +
                (
                    Number(
                        ligne.montantDu
                    ) || 0
                ),
            0
        );


    if (
        totalEtudiantsElement
    ) {

        totalEtudiantsElement.textContent =
            totalEtudiants;

    }


    if (
        totalRecouvrementElement
    ) {

        totalRecouvrementElement.textContent =
            resultat.length;

    }


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
                totalDu
            );

    }


    if (
        resultat.length ===
        0
    ) {

        body.innerHTML = `

            <tr class="empty-row">

                <td colspan="8">

                    Aucun étudiant trouvé.

                </td>

            </tr>

        `;

        return;

    }


    resultat.forEach(
        (ligne, index) => {

            const tr =
                document.createElement(
                    "tr"
                );


            if (
                index > 0 &&
                resultat[
                    index - 1
                ].chambre !==
                ligne.chambre
            ) {

                tr.classList.add(
                    "room-separator"
                );

            }


            const nomComplet =
                `${ligne.prenom} ${ligne.nom}`
                    .trim();


            const dette =
                ligne.montantDu >
                0;


            tr.innerHTML = `

                <td>

                    <strong>

                        ${escapeHtml(
                            ligne.chambre
                        )}

                    </strong>

                </td>


                <td>

                    ${escapeHtml(
                        ligne.lit
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        ligne.carte
                    )}

                </td>


                <td>

                    <strong>

                        ${escapeHtml(
                            nomComplet ||
                            ligne.matricule
                        )}

                    </strong>

                </td>


                <td class="montant-paye">

                    ${formaterMontant(
                        ligne.montantPaye
                    )}

                </td>


                <td
                    class="
                        montant-du
                        ${
                            dette
                                ? "dette"
                                : "a-jour"
                        }
                    "
                >

                    ${formaterMontant(
                        ligne.montantDu
                    )}

                </td>


                <td>

                    ${
                        dette

                            ?

                            `
                                <button
                                    type="button"
                                    class="rappel-btn"
                                    data-matricule="${escapeHtml(
                                        ligne.matricule
                                    )}"
                                >
                                    ENVOYER
                                </button>
                            `

                            :

                            `
                                <span
                                    class="rappel-ok"
                                >
                                    À jour
                                </span>
                            `
                    }

                </td>


                <td>

                    <button
                        type="button"
                        class="details-btn"
                        data-matricule="${escapeHtml(
                            ligne.matricule
                        )}"
                    >

                        Voir

                    </button>

                </td>

            `;


            body.appendChild(
                tr
            );

        }
    );


    // =================================================
    // ACTIONS RAPPEL
    // =================================================

    body
        .querySelectorAll(
            ".rappel-btn"
        )
        .forEach(
            bouton => {

                bouton.addEventListener(
                    "click",
                    () => {

                        const matricule =
                            bouton.dataset
                                .matricule;


                        const ligne =
                            recouvrements.find(
                                element =>
                                    String(
                                        element.matricule
                                    ) ===
                                    String(
                                        matricule
                                    )
                            );


                        if (
                            !ligne
                        ) {

                            return;

                        }


                        afficherMenuRappel(
                            ligne
                        );

                    }
                );

            }
        );


    // =================================================
    // ACTIONS DÉTAILS
    // =================================================

    body
        .querySelectorAll(
            ".details-btn"
        )
        .forEach(
            bouton => {

                bouton.addEventListener(
                    "click",
                    () => {

                        const matricule =
                            bouton.dataset
                                .matricule;


                        if (
                            !matricule
                        ) {

                            return;

                        }


                        window.location.href =
                            `./details/index.html?matricule=${encodeURIComponent(
                                matricule
                            )}`;

                    }
                );

            }
        );

}


// =====================================================
// MENU RAPPEL
// =====================================================

function afficherMenuRappel(
    ligne
) {

    const choix =
        document.createElement(
            "div"
        );


    choix.className =
        "rappel-menu-overlay";


    const nomComplet =
        `${ligne.prenom} ${ligne.nom}`
            .trim();


    choix.innerHTML = `

        <div class="rappel-menu">

            <div class="rappel-menu-header">

                <h3>
                    Envoyer un rappel
                </h3>

                <button
                    type="button"
                    class="rappel-menu-close"
                >
                    ×
                </button>

            </div>


            <p>

                Choisissez le moyen de rappel
                pour

                <strong>
                    ${escapeHtml(
                        nomComplet ||
                        ligne.matricule
                    )}
                </strong>.

            </p>


            <div class="rappel-menu-actions">

                <button
                    type="button"
                    class="rappel-choice notification"
                    data-action="notification"
                >

                    <span>
                        <i class="fa-solid fa-bell"></i>
                    </span>

                    <div>

                        <strong>
                            Notification
                        </strong>

                        <small>
                            Envoyer dans Campus One
                        </small>

                    </div>

                </button>


                <button
                    type="button"
                    class="rappel-choice sms"
                    data-action="sms"
                >

                    <span>
                        <i class="fa-solid fa-message"></i>
                    </span>

                    <div>

                        <strong>
                            SMS
                        </strong>

                        <small>
                            Disponible prochainement
                        </small>

                    </div>

                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        choix
    );


    const fermer =
        () => {

            choix.remove();

        };


    choix
        .querySelector(
            ".rappel-menu-close"
        )
        .addEventListener(
            "click",
            fermer
        );


    choix.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                choix
            ) {

                fermer();

            }

        }
    );


    choix
        .querySelector(
            '[data-action="notification"]'
        )
        .addEventListener(
            "click",
            async () => {

                await envoyerNotificationRappel(
                    ligne
                );

                fermer();

            }
        );


    choix
        .querySelector(
            '[data-action="sms"]'
        )
        .addEventListener(
            "click",
            () => {

                alert(
                    "L'envoi de SMS sera disponible prochainement."
                );

            }
        );

}


// =====================================================
// NOTIFICATION DE RAPPEL
// =====================================================

async function envoyerNotificationRappel(
    ligne
) {

    console.log(
        "📩 Notification de rappel demandée :",
        {

            matricule:
                ligne.matricule,

            nom:
                `${ligne.prenom} ${ligne.nom}`
                    .trim(),

            montantDu:
                ligne.montantDu,

            moisEnRetard:
                ligne.moisEnRetard
                    .map(
                        mois =>
                            mois.libelle
                    )

        }
    );


    alert(
        `Notification de rappel préparée pour ${ligne.matricule}.`
    );

}


// =====================================================
// VOIR TABLEAU DE BORD
// =====================================================

function ouvrirTableauDeBord() {

    window.location.href =
        TABLEAU_BORD_URL;

}


const tableauBordBtn =
    document.getElementById(
        "voir-tableau-bord"
    );


if (
    tableauBordBtn
) {

    tableauBordBtn.addEventListener(
        "click",
        ouvrirTableauDeBord
    );

}


// =====================================================
// RECHERCHE
// =====================================================

if (
    searchInput
) {

    searchInput.addEventListener(
        "input",
        afficherRecouvrements
    );

}


// =====================================================
// FILTRE CHAMBRE
// =====================================================

if (
    chambreFilter
) {

    chambreFilter.addEventListener(
        "change",
        afficherRecouvrements
    );

}


// =====================================================
// FILTRE SITUATION
// =====================================================

if (
    statutFilter
) {

    statutFilter.addEventListener(
        "change",
        afficherRecouvrements
    );

}


// =====================================================
// INITIALISATION
// =====================================================

requireRole(
    "agent",

    async ({
        profile,
        affectation,
        anneeAcademique,
        lectureSeule
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
            // AFFECTATION
            // =============================================

            const site =
                affectation?.site ||
                profile.site ||
                "";


            const pavillon =
                affectation?.pavillon ||
                extrairePavillon(
                    affectation?.affectation ||
                    profile.affectation ||
                    ""
                );


            // =============================================
            // ANNÉE
            // =============================================

            if (
                anneeElement
            ) {

                anneeElement.textContent =
                    anneeAcademique ||
                    "-";

            }


            if (
                pavillonElement
            ) {

                pavillonElement.textContent =
                    pavillon ||
                    "-";

            }


            // =============================================
            // AFFECTATION INVALIDE
            // =============================================

            if (
                !site ||
                !pavillon
            ) {

                body.innerHTML = `

                    <tr class="empty-row">

                        <td colspan="8">

                            Votre affectation
                            n'est pas correctement
                            définie.

                        </td>

                    </tr>

                `;

                return;

            }


            console.log(
                "💰 Recouvrement - affectation :",
                {

                    site,

                    pavillon,

                    anneeAcademique

                }
            );


            // =============================================
            // CHARGEMENT INITIAL
            // =============================================

            const [
                donneesRecouvrement
            ] = await Promise.all(

                [

                    chargerRecouvrements(
                        anneeAcademique
                    ),

                    chargerPaiementsLoyers(
                        anneeAcademique
                    ),

                    chargerEtudiants(),

                    chargerHebergements(
                        site,
                        pavillon,
                        anneeAcademique,
                        lectureSeule
                    )

                ]

            );


            // =============================================
            // STOCKAGE
            // =============================================

            donneesRecouvrementOriginales =
                donneesRecouvrement;


            // =============================================
            // CONSTRUCTION INITIALE
            // =============================================

            reconstruireRecouvrements();


            // =============================================
            // ÉCOUTE TEMPS RÉEL
            // =============================================

            ecouterPaiementsLoyers(
                anneeAcademique
            );


            console.log(
                "💰 Étudiants affichés :",
                recouvrements.length
            );


            console.log(
                "💰 Paiements utilisés :",
                paiementsLoyers.length
            );


        } catch (
            error
        ) {

            console.error(
                "❌ Erreur chargement recouvrement :",
                error
            );


            if (
                body
            ) {

                body.innerHTML = `

                    <tr class="empty-row">

                        <td colspan="8">

                            Impossible de charger
                            les données de recouvrement.

                        </td>

                    </tr>

                `;

            }

        } finally {

            document.body.classList.add(
                "loaded"
            );

        }

    }
);


// =====================================================
// EXTRAIRE LE PAVILLON
// =====================================================

function extrairePavillon(
    affectation
) {

    const texte =
        String(
            affectation ||
            ""
        ).trim();


    const match =
        texte.match(
            /Pavillon\s+(.+)/i
        );


    return match
        ? match[1].trim()
        : "";

}