import { requireRole } from "../../../auth/authGuard.js";

import { loadSidebar } from "../components/sidebar.js";

import {
    collection,
    query,
    where,
    onSnapshot
} from "firebase/firestore";

import { db } from "../../../firebase/firebase.js";

import {
    createIcons,
    icons
} from "lucide";


// =====================================================
// LISTENER
// =====================================================

let notificationsUnsubscribe = null;


// =====================================================
// CLÉ DE CONSULTATION
// =====================================================

function obtenirCleConsultation(
    site,
    pavillon
) {

    return (
        `hebergement_notifications_consultation_` +
        `${site}_${pavillon}`
    );

}


// =====================================================
// INITIALISATION
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            await requireRole(
                "agent",
                async ({
                    profile,
                    permissions,
                    affectation,
                    posteId,
                    anneeAcademique,
                    lectureSeule
                }) => {


                    // =============================================
                    // VÉRIFICATION SERVICE
                    // =============================================

                    if (
                        profile?.service !==
                        "Service de l'Hébergement"
                    ) {

                        console.warn(
                            "⚠️ Accès refusé : service incorrect."
                        );

                        masquerLoader();

                        return;

                    }


                    // =============================================
                    // SIDEBAR
                    // =============================================

                    await loadSidebar({

                        ...profile,

                        permissions,

                        affectation:
                            affectation?.affectation ||
                            affectation?.site ||
                            profile?.affectation ||
                            "",

                        posteId,
                        anneeAcademique,
                        lectureSeule

                    });


                    // =============================================
                    // PAGE
                    // =============================================

                    initialiserPage();


                    // =============================================
                    // NOTIFICATIONS
                    // =============================================
                    //
                    // IMPORTANT :
                    // On attend la première réponse Firestore
                    // avant de masquer le loader.
                    //

                    await chargerNotifications(
                        profile
                    );


                    // =============================================
                    // LOADER
                    // =============================================

                    masquerLoader();

                }
            );

        } catch (error) {

            console.error(
                "❌ Erreur initialisation notifications Hébergement :",
                error
            );

            masquerLoader();

        }

    }
);


// =====================================================
// INITIALISER LA PAGE
// =====================================================

function initialiserPage() {

    /*
     * Il n'y a volontairement aucun bouton
     * "Tout marquer comme lu".
     *
     * Les notifications restent nouvelles pendant
     * toute la consultation actuelle.
     *
     * La consultation est enregistrée lorsque
     * l'utilisateur quitte la page.
     */

    window.addEventListener(
        "beforeunload",
        enregistrerConsultation
    );

}


// =====================================================
// CHARGER LES NOTIFICATIONS
// =====================================================
//
// Lecture directe de la collection
// "notificationsHebergement".
//
// La fonction retourne une Promise afin que
// l'initialisation puisse attendre la première
// réponse Firestore avant de masquer le loader.
//
// =====================================================

function chargerNotifications(
    profile
) {

    return new Promise(
        (resolve) => {

            const liste =
                document.getElementById(
                    "notifications-list"
                );


            const vide =
                document.getElementById(
                    "notifications-empty"
                );


            // =================================================
            // ÉTAT INITIAL : CHARGEMENT
            // =================================================
            //
            // Tant que Firestore n'a pas répondu,
            // "Aucune notification" doit rester caché.
            //

            if (vide) {

                vide.hidden =
                    true;

                vide.style.display =
                    "none";

            }


            if (!liste) {

                console.error(
                    "❌ notifications-list introuvable."
                );

                resolve();

                return;

            }


            // =================================================
            // IDENTIFICATION AGENT
            // =================================================

            const site =
                profile?.site;


            const pavillon =
                profile?.affectation
                    ?.replace(
                        /^Pavillon\s+/i,
                        ""
                    )
                    .trim();


            console.log(
                "🏢 Site notifications Hébergement :",
                site
            );


            console.log(
                "🏠 Pavillon notifications Hébergement :",
                pavillon
            );


            if (
                !site ||
                !pavillon
            ) {

                console.error(
                    "❌ Impossible de déterminer le site ou le pavillon."
                );

                afficherEtatVide();

                resolve();

                return;

            }


            window.__hebergementSite =
                site;

            window.__hebergementPavillon =
                pavillon;


            // =================================================
            // ÉVITER LES DOUBLES LISTENERS
            // =================================================

            if (
                notificationsUnsubscribe
            ) {

                notificationsUnsubscribe();

                notificationsUnsubscribe =
                    null;

            }


            // =================================================
            // DERNIÈRE CONSULTATION
            // =================================================

            const cleConsultation =
                obtenirCleConsultation(
                    site,
                    pavillon
                );


            const derniereConsultation =
                Number(
                    localStorage.getItem(
                        cleConsultation
                    )
                ) || 0;


            // =================================================
            // REQUÊTE FIRESTORE
            // =================================================

            const requete =
                query(

                    collection(
                        db,
                        "notificationsHebergement"
                    ),

                    where(
                        "site",
                        "==",
                        site
                    ),

                    where(
                        "pavillon",
                        "==",
                        pavillon
                    )

                );


            console.log(
                "🔎 Écoute des notifications du pavillon :",
                pavillon
            );


            // =================================================
            // LISTENER TEMPS RÉEL
            // =================================================

            notificationsUnsubscribe =
                onSnapshot(

                    requete,

                    snapshot => {


                        // =========================================
                        // FIRESTORE A RÉPONDU
                        // =========================================
                        //
                        // À partir d'ici, on sait si la liste
                        // est réellement vide ou non.
                        //

                        console.log(
                            "🔔 Notifications Hébergement reçues :",
                            snapshot.size
                        );


                        // =========================================
                        // RÉCUPÉRATION
                        // =========================================

                        const notifications =
                            snapshot.docs
                                .map(
                                    documentSnapshot => ({

                                        id:
                                            documentSnapshot.id,

                                        ...documentSnapshot.data()

                                    })
                                );


                        // =========================================
                        // TRI
                        // =========================================

                        notifications.sort(
                            (a, b) => {

                                const dateA =
                                    obtenirMillis(
                                        a.createdAt
                                    );


                                const dateB =
                                    obtenirMillis(
                                        b.createdAt
                                    );


                                return dateB - dateA;

                            }
                        );


                        // =========================================
                        // NETTOYAGE
                        // =========================================

                        liste
                            .querySelectorAll(
                                ".notification-item"
                            )
                            .forEach(
                                element =>
                                    element.remove()
                            );


                        // =========================================
                        // ÉTAT VIDE
                        // =========================================

                        if (
                            notifications.length ===
                            0
                        ) {

                            if (vide) {

                                vide.hidden =
                                    false;

                                vide.style.display =
                                    "";

                            }


                            // =====================================
                            // IMPORTANT :
                            // PREMIÈRE RÉPONSE TERMINÉE
                            // =====================================

                            resolve();

                            return;

                        }


                        // =========================================
                        // IL Y A DES NOTIFICATIONS
                        // =========================================

                        if (vide) {

                            vide.hidden =
                                true;

                            vide.style.display =
                                "none";

                        }


                        // =========================================
                        // AFFICHAGE
                        // =========================================

                        notifications.forEach(
                            notification => {

                                const dateCreation =
                                    obtenirMillis(
                                        notification.createdAt
                                    );


                                const dejaPresente =
                                    derniereConsultation >
                                        0 &&
                                    dateCreation <=
                                        derniereConsultation;


                                const notificationAffichage = {

                                    ...notification,

                                    lu:
                                        notification.lu ===
                                            true ||
                                        dejaPresente

                                };


                                liste.appendChild(
                                    creerNotificationElement(
                                        notificationAffichage
                                    )
                                );

                            }
                        );


                        // =========================================
                        // ICÔNES
                        // =========================================

                        createIcons({
                            icons
                        });


                        // =========================================
                        // PREMIÈRE RÉPONSE TERMINÉE
                        // =========================================
                        //
                        // Le loader sera maintenant masqué
                        // par "await chargerNotifications()".
                        //

                        resolve();

                    },


                    error => {

                        console.error(
                            "❌ Erreur notifications Hébergement :",
                            error
                        );


                        afficherEtatVide();


                        // =========================================
                        // ERREUR TERMINÉE
                        // =========================================
                        //
                        // On ne bloque pas définitivement
                        // le loader en cas d'erreur.
                        //

                        resolve();

                    }

                );

        }
    );

}


// =====================================================
// CRÉER NOTIFICATION
// =====================================================

function creerNotificationElement(
    notification
) {

    const article =
        document.createElement(
            "article"
        );


    article.className =
        "notification-item";


    // =================================================
    // NON LUE
    // =================================================

    if (
        notification.lu !== true
    ) {

        article.classList.add(
            "unread"
        );

    }


    // =================================================
    // ICÔNE
    // =================================================

    const icon =
        document.createElement(
            "div"
        );


    icon.className =
        "notification-icon";


    const iconElement =
        document.createElement(
            "i"
        );


    iconElement.setAttribute(
        "data-lucide",
        obtenirIconeNotification(
            notification.type
        )
    );


    icon.appendChild(
        iconElement
    );


    // =================================================
    // CONTENU
    // =================================================

    const contenu =
        document.createElement(
            "div"
        );


    contenu.className =
        "notification-content";


    const titre =
        document.createElement(
            "h3"
        );


    titre.className =
        "notification-title";


    titre.textContent =
        notification.titre ||
        "Notification";


    const message =
        document.createElement(
            "p"
        );


    message.className =
        "notification-message";


    message.textContent =
        notification.message ||
        "";


    const date =
        document.createElement(
            "div"
        );


    date.className =
        "notification-date";


    date.textContent =
        formaterDate(
            notification.createdAt
        );


    contenu.appendChild(
        titre
    );


    contenu.appendChild(
        message
    );


    contenu.appendChild(
        date
    );


    // =================================================
    // POINT NOUVEAUTÉ
    // =================================================

    if (
        notification.lu !== true
    ) {

        const point =
            document.createElement(
                "span"
            );


        point.className =
            "notification-unread";


        point.title =
            "Nouvelle notification";


        article.appendChild(
            point
        );

    }


    article.appendChild(
        icon
    );


    article.appendChild(
        contenu
    );


    return article;

}


// =====================================================
// ICÔNES
// =====================================================

function obtenirIconeNotification(
    type
) {

    switch (type) {

        case "nouvelle_demande":

            return "clipboard-list";


        case "demande_terminee":

            return "circle-check";


        case "demande_non_terminee":

            return "circle-alert";


        case "demande_forclose":

            return "clock-alert";


        default:

            return "bell";

    }

}


// =====================================================
// MILLIS
// =====================================================

function obtenirMillis(
    valeur
) {

    if (
        valeur?.toMillis &&
        typeof valeur.toMillis ===
            "function"
    ) {

        return valeur.toMillis();

    }


    if (
        valeur instanceof Date
    ) {

        return valeur.getTime();

    }


    if (
        valeur
    ) {

        const date =
            new Date(
                valeur
            );


        if (
            !Number.isNaN(
                date.getTime()
            )
        ) {

            return date.getTime();

        }

    }


    return 0;

}


// =====================================================
// ENREGISTRER CONSULTATION
// =====================================================

function enregistrerConsultation() {

    const site =
        window.__hebergementSite;


    const pavillon =
        window.__hebergementPavillon;


    if (
        !site ||
        !pavillon
    ) {

        return;

    }


    const cleConsultation =
        obtenirCleConsultation(
            site,
            pavillon
        );


    localStorage.setItem(
        cleConsultation,
        String(
            Date.now()
        )
    );

}


// =====================================================
// FORMATER DATE
// =====================================================

function formaterDate(
    timestamp
) {

    if (
        !timestamp
    ) {

        return "";

    }


    let date;


    if (
        typeof timestamp.toDate ===
        "function"
    ) {

        date =
            timestamp.toDate();

    } else {

        date =
            new Date(
                timestamp
            );

    }


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

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
        date
    );

}


// =====================================================
// ÉTAT VIDE
// =====================================================

function afficherEtatVide() {

    const vide =
        document.getElementById(
            "notifications-empty"
        );


    if (
        vide
    ) {

        vide.hidden =
            false;

        vide.style.display =
            "";

    }

}


// =====================================================
// LOADER
// =====================================================

function masquerLoader() {

    const loader =
        document.getElementById(
            "app-loader"
        );


    if (
        !loader
    ) {

        return;

    }


    requestAnimationFrame(
        () => {

            loader.classList.add(
                "hidden"
            );

        }
    );

}