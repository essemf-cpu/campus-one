import { requireRole } from "../../../auth/authGuard.js";
import { loadSidebar } from "../components/sidebar.js";

import {
    collection,
    query,
    where,
    onSnapshot,
    updateDoc,
    doc
} from "firebase/firestore";

import { db } from "../../../firebase/firebase.js";

import { createIcons, icons } from "lucide";


// =====================================================
// LISTENER
// =====================================================

let notificationsUnsubscribe = null;


// =====================================================
// CLÉ DE CONSULTATION
// =====================================================

function obtenirCleConsultation(site) {

    return `atelier_notifications_consultation_${site}`;

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

                    // =================================================
                    // SIDEBAR
                    // =================================================

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


                    // =================================================
                    // PAGE
                    // =================================================

                    initialiserPage();


                    // =================================================
                    // NOTIFICATIONS
                    // =================================================

                    chargerNotifications(profile);


                    // =================================================
                    // LOADER
                    // =================================================

                    masquerLoader();

                }
            );

        } catch (error) {

            console.error(
                "❌ Erreur initialisation notifications Atelier :",
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

    // Aucun bouton "Tout marquer comme lu".
    //
    // Les notifications nouvelles restent signalées
    // pendant toute la consultation actuelle.
    //
    // La consultation est enregistrée lorsque
    // l'utilisateur quitte la page.
    //
    // Au prochain retour sur la page, les notifications
    // déjà présentes lors de cette consultation seront
    // considérées comme vues.


    window.addEventListener(
        "beforeunload",
        enregistrerConsultation
    );

}


// =====================================================
// CHARGER LES NOTIFICATIONS
// =====================================================

function chargerNotifications(profile) {

    const liste =
        document.getElementById(
            "notifications-list"
        );

    const vide =
        document.getElementById(
            "notifications-empty"
        );


    if (!liste) {
        return;
    }


    const site =
        profile?.site;


    if (!site) {

        afficherEtatVide();

        return;
    }

    window.__atelierSite = site;

    // =================================================
    // ÉVITER LES DOUBLES LISTENERS
    // =================================================

    if (notificationsUnsubscribe) {

        notificationsUnsubscribe();

        notificationsUnsubscribe = null;

    }


    // =================================================
    // DERNIÈRE CONSULTATION
    // =================================================

    const cleConsultation =
        obtenirCleConsultation(site);

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
            "notificationsAtelier"
        ),
        where(
            "site",
            "==",
            site
        )
    );

console.log("🔎 Site utilisé pour notifications :", site);

    // =================================================
    // LISTENER TEMPS RÉEL
    // =================================================

    notificationsUnsubscribe =
        onSnapshot(
            requete,

            snapshot => {

                // -----------------------------------------
                // RÉCUPÉRATION
                // -----------------------------------------

                const notifications =
                    snapshot.docs
                        .map(
                            documentSnapshot => ({
                                id:
                                    documentSnapshot.id,

                                ...documentSnapshot.data()
                            })
                        );


                // -----------------------------------------
                // TRI
                // -----------------------------------------

                notifications.sort(
                    (a, b) => {

                        const dateA =
                            a.createdAt?.toMillis?.() ||
                            0;

                        const dateB =
                            b.createdAt?.toMillis?.() ||
                            0;

                        return dateB - dateA;

                    }
                );


                // -----------------------------------------
                // NETTOYAGE
                // -----------------------------------------

                liste
                    .querySelectorAll(
                        ".notification-item"
                    )
                    .forEach(
                        element =>
                            element.remove()
                    );


                // -----------------------------------------
                // ÉTAT VIDE
                // -----------------------------------------

                if (
                    notifications.length === 0
                ) {
                    if (vide) {
                        vide.hidden = false;
                        vide.style.display = "";
                    }

                    return;
                }

                if (vide) {
                    vide.hidden = true;
                    vide.style.display = "none";
                }


                // -----------------------------------------
                // AFFICHAGE
                // -----------------------------------------

                notifications.forEach(
                    notification => {

                        /*
                         * Une notification qui était déjà
                         * présente lors de la précédente
                         * consultation est considérée comme
                         * déjà vue.
                         *
                         * Les notifications arrivées depuis
                         * cette consultation restent nouvelles.
                         */

                        const dateCreation =
                            notification.createdAt
                                ?.toMillis?.() || 0;


                        const dejaPresente =
                            derniereConsultation > 0 &&
                            dateCreation <=
                                derniereConsultation;


                        const notificationAffichage = {

                            ...notification,

                            lu:
                                notification.lu === true ||
                                dejaPresente

                        };


                        liste.appendChild(
                            creerNotificationElement(
                                notificationAffichage
                            )
                        );

                    }
                );


                // -----------------------------------------
                // CRÉATION DES ICÔNES SVG
                // -----------------------------------------

                createIcons({
                    icons
                });

            },

            error => {

                console.error(
                    "❌ Erreur notifications Atelier :",
                    error
                );

                afficherEtatVide();

            }
        );

}


// =====================================================
// CRÉER UNE NOTIFICATION VISUELLE
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
    // NOTIFICATION NOUVELLE
    // =================================================

    if (
        notification.lu !== true
    ) {

        article.classList.add(
            "unread"
        );

    }


    // =================================================
    // ICÔNE SVG
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
// ICÔNES NOTIFICATIONS
// =====================================================

function obtenirIconeNotification(type) {

    switch (type) {

        case "nouveau_bon":
            return "clipboard-list";

        case "bon_termine":
            return "circle-check";

        case "bon_non_termine":
            return "circle-alert";

        case "besoin_stock":
            return "package";

        case "bon_neglige":
            return "clock-alert";

        default:
            return "bell";

    }

}


// =====================================================
// ENREGISTRER LA CONSULTATION
// =====================================================

function enregistrerConsultation() {

    /*
     * On récupère le site depuis la dernière initialisation.
     */

    const site =
        window.__atelierSite;


    if (!site) {
        return;
    }


    /*
     * On enregistre le moment où l'utilisateur
     * quitte la page.
     *
     * Les notifications créées avant ce moment
     * seront considérées comme vues lors de la
     * prochaine ouverture.
     */

    localStorage.setItem(
        obtenirCleConsultation(site),
        String(Date.now())
    );

}


// =====================================================
// DATE
// =====================================================

function formaterDate(
    timestamp
) {

    if (!timestamp) {
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
            new Date(timestamp);

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
    ).format(date);

}


// =====================================================
// ÉTAT VIDE
// =====================================================

function afficherEtatVide() {

    const vide =
        document.getElementById(
            "notifications-empty"
        );


    if (vide) {

        vide.hidden =
            false;

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


    if (!loader) {
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