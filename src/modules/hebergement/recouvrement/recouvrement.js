import { requireRole } from "../../../auth/authGuard.js";

import {
    collection,
    query,
    where,
    getDocs,
    onSnapshot,
    addDoc
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

const COLLECTION_NOTIFICATIONS =
    "notifications";

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

let profilAgent = null;

let anneeAcademiqueCourante = "";

let lectureSeuleCourante = false;


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

    /*
     * L'année académique est du type :
     *
     * 2026-2027
     * 2027-2028
     * 2028-2029
     *
     * On récupère automatiquement
     * l'année de début.
     */

    const correspondance =
        String(
            anneeAcademique || ""
        ).match(
            /^(\d{4})-(\d{4})$/
        );


    if (
        !correspondance
    ) {

        console.error(
            "❌ Année académique invalide :",
            anneeAcademique
        );

        return {
            id:
                `${anneeAcademique}_${matricule}`,

            matricule,

            anneeAcademique,

            montantMensuel:
                3000,

            mois: {},

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


    const anneeDebut =
        Number(
            correspondance[1]
        );

    const anneeFin =
        Number(
            correspondance[2]
        );


    /*
     * Structure automatique :
     *
     * Novembre année de début
     * Décembre année de début
     * Janvier année suivante
     * ...
     * Juillet année suivante
     */

    const moisNoms = [

        [
            "novembre",
            `Novembre ${anneeDebut}`
        ],

        [
            "decembre",
            `Décembre ${anneeDebut}`
        ],

        [
            "janvier",
            `Janvier ${anneeFin}`
        ],

        [
            "fevrier",
            `Février ${anneeFin}`
        ],

        [
            "mars",
            `Mars ${anneeFin}`
        ],

        [
            "avril",
            `Avril ${anneeFin}`
        ],

        [
            "mai",
            `Mai ${anneeFin}`
        ],

        [
            "juin",
            `Juin ${anneeFin}`
        ],

        [
            "juillet",
            `Juillet ${anneeFin}`
        ]

    ];


    const mois = {};


moisNoms.forEach(
    ([cle, libelle]) => {

        const estCodification =
            cle === "novembre" ||
            cle === "decembre";

        mois[cle] = {

            libelle,

            statut:
                estCodification
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
// APPLIQUER LA CODIFICATION DE DÉBUT D'ANNÉE
// =====================================================

function appliquerCodificationInitiale(
    recouvrement
) {

    if (
        !recouvrement?.mois
    ) {

        return;

    }

    ["novembre", "decembre"].forEach(
        cle => {

            const mois =
                recouvrement.mois[cle];

            if (
                mois &&
                mois.statut !== "paye"
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

    appliquerCodificationInitiale(
    recouvrement
);


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
// RAPPEL — GÉNÉRER LES MOIS DE L'ANNÉE ACADÉMIQUE
// =====================================================

function obtenirMoisAcademiques(
    anneeAcademique
) {

    const correspondance =
        String(
            anneeAcademique || ""
        ).match(
            /^(\d{4})-(\d{4})$/
        );


    if (
        !correspondance
    ) {

        return [];

    }


    const anneeDebut =
        Number(
            correspondance[1]
        );

    const anneeFin =
        Number(
            correspondance[2]
        );


    return [

        {
            cle:
                "novembre",

            mois:
                10,

            annee:
                anneeDebut,

            libelle:
                `Novembre ${anneeDebut}`
        },

        {
            cle:
                "decembre",

            mois:
                11,

            annee:
                anneeDebut,

            libelle:
                `Décembre ${anneeDebut}`
        },

        {
            cle:
                "janvier",

            mois:
                0,

            annee:
                anneeFin,

            libelle:
                `Janvier ${anneeFin}`
        },

        {
            cle:
                "fevrier",

            mois:
                1,

            annee:
                anneeFin,

            libelle:
                `Février ${anneeFin}`
        },

        {
            cle:
                "mars",

            mois:
                2,

            annee:
                anneeFin,

            libelle:
                `Mars ${anneeFin}`
        },

        {
            cle:
                "avril",

            mois:
                3,

            annee:
                anneeFin,

            libelle:
                `Avril ${anneeFin}`
        },

        {
            cle:
                "mai",

            mois:
                4,

            annee:
                anneeFin,

            libelle:
                `Mai ${anneeFin}`
        },

        {
            cle:
                "juin",

            mois:
                5,

            annee:
                anneeFin,

            libelle:
                `Juin ${anneeFin}`
        },

        {
            cle:
                "juillet",

            mois:
                6,

            annee:
                anneeFin,

            libelle:
                `Juillet ${anneeFin}`
        }

    ];

}


// =====================================================
// RAPPEL — MOIS COURANT
// =====================================================

function obtenirMoisCourant() {

    if (
        !anneeAcademiqueCourante
    ) {

        return null;

    }


    const maintenant =
        new Date();


    const moisActuel =
        maintenant.getMonth();


    const anneeActuelle =
        maintenant.getFullYear();


    const moisAcademiques =
        obtenirMoisAcademiques(
            anneeAcademiqueCourante
        );


    const moisCorrespondant =
        moisAcademiques.find(
            element =>
                element.mois ===
                moisActuel &&
                element.annee ===
                anneeActuelle
        );


    return (
        moisCorrespondant ||
        null
    );

}


// =====================================================
// RAPPEL — PREMIER MOIS IMPAYÉ
// =====================================================

function obtenirPremierMoisImpayé(
    ligne
) {

    if (
        !ligne?.recouvrement?.mois
    ) {

        return null;

    }


    const moisAcademiques =
        obtenirMoisAcademiques(
            anneeAcademiqueCourante
        );


    for (
        const moisAcademique
        of moisAcademiques
    ) {

        const mois =
            ligne.recouvrement.mois[
                moisAcademique.cle
            ];


        if (
            mois &&
            mois.statut ===
            "a_payer"
        ) {

            return {

                cle:
                    moisAcademique.cle,

                mois:
                    moisAcademique.libelle

            };

        }

    }


    return null;

}


// =====================================================
// RAPPEL — COMPTER LES RAPPELS DU MOIS IMPAYÉ
// =====================================================

async function compterRappelsDuMois(
    matricule,
    moisRappel
) {

    if (
        !moisRappel
    ) {

        return 0;

    }


    try {

        const snapshot =
            await getDocs(
                query(
                    collection(
                        db,
                        COLLECTION_NOTIFICATIONS
                    ),
                    where(
                        "to",
                        "==",
                        String(
                            matricule
                        )
                    )
                )
            );


        return snapshot.docs.filter(
            document => {

                const notification =
                    document.data();


                return (

                    notification.type ===
                    "rappel_loyer" &&

                    notification.anneeAcademique ===
                    anneeAcademiqueCourante &&

                    notification.mois ===
                    moisRappel

                );

            }
        ).length;

    } catch (error) {

        console.error(
            "❌ Impossible de vérifier les rappels :",
            error
        );

        return 0;

    }

}


// =====================================================
// RAPPEL — VÉRIFIER SI UN RAPPEL PEUT ÊTRE ENVOYÉ
// =====================================================

async function peutEnvoyerRappel(
    ligne
) {

    // =============================================
    // 1. ANNÉE EN LECTURE SEULE
    // =============================================

    if (
        lectureSeuleCourante
    ) {

        return {

            autorise:
                false,

            raison:
                "Cette année académique est en lecture seule. Une nouvelle codification est en cours."

        };

    }


    // =============================================
    // 2. CHERCHER LE PREMIER MOIS IMPAYÉ
    // =============================================

    const premierMoisImpayé =
        obtenirPremierMoisImpayé(
            ligne
        );


    // =============================================
    // 3. AUCUN IMPAYÉ
    // =============================================

    if (
        !premierMoisImpayé
    ) {

        return {

            autorise:
                false,

            raison:
                "Aucun loyer n'est actuellement dû."

        };

    }


    // =============================================
    // 4. COMPTER LES RAPPELS POUR CE MOIS
    // =============================================

    const nombreRappels =
        await compterRappelsDuMois(
            ligne.matricule,
            premierMoisImpayé.mois
        );


    // =============================================
    // 5. MAXIMUM DEUX RAPPELS
    // =============================================

    if (
        nombreRappels >=
        2
    ) {

        return {

            autorise:
                false,

            raison:
                `Deux rappels ont déjà été envoyés pour ${premierMoisImpayé.mois}.`

        };

    }


    // =============================================
    // 6. RAPPEL AUTORISÉ
    // =============================================

    return {

        autorise:
            true,

        nombreRappels,

        mois:
            premierMoisImpayé.mois,

        cle:
            premierMoisImpayé.cle

    };

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

            const rappelFerme =
                lectureSeuleCourante;


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
                    !dette

                        ?

                        `
                            <span
                                class="rappel-ok"
                            >
                                À jour
                            </span>
                        `

                        :

                        rappelFerme

                        ?

                        `
                            <span
                                class="rappel-ferme"
                            >
                                Rappel fermé
                            </span>
                        `

                        :

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
                    async () => {

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


                        bouton.disabled =
                            true;


                        try {

                            await afficherMenuRappel(
                                ligne
                            );

                        } finally {

                            bouton.disabled =
                                false;

                        }

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

async function afficherMenuRappel(
    ligne
) {

    /*
     * Vérification avant même d'afficher
     * le menu de rappel.
     */

    const controle =
        await peutEnvoyerRappel(
            ligne
        );


    if (
        !controle.autorise
    ) {

        alert(
            controle.raison
        );

        return;

    }


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

                const bouton =
                    choix.querySelector(
                        '[data-action="notification"]'
                    );


                bouton.disabled =
                    true;


                try {

                    const envoye =
                        await envoyerNotificationRappel(
                            ligne
                        );


                    if (
                        envoye
                    ) {

                        fermer();

                    }

                } finally {

                    bouton.disabled =
                        false;

                }

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

    /*
     * Nouvelle vérification juste avant l'écriture
     * Firestore.
     *
     * Cela évite qu'un agent ait deux fenêtres ouvertes
     * et dépasse accidentellement la limite de rappels.
     */

    const controle =
        await peutEnvoyerRappel(
            ligne
        );


    if (
        !controle.autorise
    ) {

        alert(
            controle.raison
        );

        return false;

    }


    const nomComplet =
        `${ligne.prenom} ${ligne.nom}`
            .trim();


    const montantMensuel =
        Number(
            ligne.recouvrement?.montantMensuel
        ) || 0;


    try {

        await addDoc(
            collection(
                db,
                COLLECTION_NOTIFICATIONS
            ),
            {

                anneeAcademique:
                    anneeAcademiqueCourante,

                date:
                    Date.now(),

                from:
                    profilAgent?.uid ||
                    profilAgent?.id ||
                    profilAgent?.matricule ||
                    "service-hebergement",

                fromAvatar:
                    profilAgent?.avatar ||
                    "",

                fromNom:
                    profilAgent?.nomComplet ||
                    profilAgent?.nom ||
                    "Service de l'Hébergement",

                seen:
                    false,

                title:
                    "Rappel de loyer",

                text:
                    `Votre loyer du mois de ${controle.mois.toLowerCase()} reste à régulariser. Montant mensuel : ${formaterMontant(
                        montantMensuel
                    )}.`,

                to:
                    String(
                        ligne.matricule
                    ),

                type:
                    "rappel_loyer",

                mois:
                    controle.mois

            }
        );


        console.log(
            "📩 Rappel de loyer envoyé :",
            {

                matricule:
                    ligne.matricule,

                mois:
                    controle.mois,

                anneeAcademique:
                    anneeAcademiqueCourante

            }
        );


        alert(
            `Rappel envoyé à ${nomComplet || ligne.matricule}.`
        );


        return true;

    } catch (error) {

        console.error(
            "❌ Erreur lors de l'envoi du rappel :",
            error
        );


        alert(
            "Impossible d'envoyer le rappel."
        );


        return false;

    }

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

            profilAgent =
                profile;

            anneeAcademiqueCourante =
                anneeAcademique || "";

            lectureSeuleCourante =
            Boolean(
                lectureSeule
            );


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