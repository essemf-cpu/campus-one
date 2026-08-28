import { requireRole } from "../../../auth/authGuard.js";

import {
    collection,
    query,
    where,
    onSnapshot,
    getDocs,
    updateDoc,
    doc,
    writeBatch
} from "firebase/firestore";

import { db } from "../../../firebase/firebase.js";


// =====================================================
// ÉTAT LOCAL
// =====================================================

let notifications = [];

let notificationsUnsubscribers = [];

let notificationsInitialized = false;

let currentProfile = null;

let currentAnneeAcademique = null;

let currentSearch = "";

let currentFilter = "all";


// =====================================================
// NETTOYAGE DES LISTENERS
// =====================================================

function nettoyerListeners() {

    notificationsUnsubscribers.forEach(
        unsubscribe => {

            try {
                unsubscribe();
            } catch {
                // Rien
            }

        }
    );

    notificationsUnsubscribers = [];

}


// =====================================================
// NOTIFICATIONS
// =====================================================

export function afficherNotifications() {

    requireRole(
        "etudiant",
        async ({
            profile,
            anneeAcademique
        }) => {

            const zone =
                document.getElementById(
                    "notifications-list"
                );

            if (!zone) {
                return;
            }


            const matricule =
                profile?.matricule;

            if (!matricule) {
                return;
            }


            currentProfile =
                profile;

            currentAnneeAcademique =
                anneeAcademique;


            // =================================================
            // ÉVITER LES DOUBLES LISTENERS
            // =================================================

            if (
                notificationsInitialized
            ) {

                return;

            }

            notificationsInitialized =
                true;


            nettoyerListeners();


            // =================================================
            // RENDU
            // =================================================

            function renderNotifications(
                type = currentFilter
            ) {

                currentFilter =
                    type;


                let liste =
                    [...notifications];


                // ---------------------------------------------
                // FILTRE
                // ---------------------------------------------

                if (
                    type !== "all"
                ) {

                    liste =
                        liste.filter(
                            notification =>
                                notification.type ===
                                type
                        );

                }


                // ---------------------------------------------
                // RECHERCHE
                // ---------------------------------------------

                if (
                    currentSearch
                ) {

                    liste =
                        liste.filter(
                            notification => {

                                const texte =
                                    `
                                    ${notification.title || ""}
                                    ${notification.text || ""}
                                    ${notification.fromNom || ""}
                                    `
                                    .toLowerCase();

                                return texte.includes(
                                    currentSearch
                                );

                            }
                        );

                }


                // ---------------------------------------------
                // DOUBLONS
                // ---------------------------------------------

                const dejaAffichees =
                    new Set();


                liste =
                    liste.filter(
                        notification => {

                            let cle =
                                `${notification.source}-${notification.id}`;


                            if (
                                notification.source ===
                                "friends"
                            ) {

                                cle =
                                    `friend-${notification.from || notification.id}`;

                            }


                            if (
                                dejaAffichees.has(
                                    cle
                                )
                            ) {

                                return false;

                            }


                            dejaAffichees.add(
                                cle
                            );

                            return true;

                        }
                    );


                // ---------------------------------------------
                // RENDU UNIQUE
                // ---------------------------------------------

                zone.innerHTML =
                    liste
                        .map(
                            notification =>
                                renderNotificationCard(
                                    notification
                                )
                        )
                        .join("");


                // ---------------------------------------------
                // ÉVÉNEMENTS PAR DÉLÉGATION
                // ---------------------------------------------

                zone
                    .querySelectorAll(
                        ".accept-friend-btn"
                    )
                    .forEach(
                        button => {

                            button.onclick =
                                () => {

                                    accepterDemande(
                                        button,
                                        currentProfile
                                    );

                                };

                        }
                    );


                zone
                    .querySelectorAll(
                        ".reject-friend-btn"
                    )
                    .forEach(
                        button => {

                            button.onclick =
                                () => {

                                    refuserDemande(
                                        button,
                                        currentProfile
                                    );

                                };

                        }
                    );

            }


            // =================================================
            // LISTENER DEMANDES D'AMIS
            // =================================================

            const demandesQuery =
                query(

                    collection(
                        db,
                        "friendRequests"
                    ),

                    where(
                        "to",
                        "==",
                        matricule
                    ),

                    where(
                        "anneeAcademique",
                        "==",
                        anneeAcademique
                    )

                );


            const unsubscribeDemandes =
                onSnapshot(

                    demandesQuery,

                    snapshot => {

                        notifications =
                            notifications.filter(
                                notification =>
                                    notification.source !==
                                    "friends"
                            );


                        const expediteurs =
                            new Set();


                        snapshot.forEach(
                            document => {

                                const data =
                                    document.data();


                                if (
                                    data.status ===
                                    "rejected"
                                ) {

                                    return;

                                }


                                if (
                                    data.from &&
                                    expediteurs.has(
                                        data.from
                                    )
                                ) {

                                    return;

                                }


                                if (data.from) {

                                    expediteurs.add(
                                        data.from
                                    );

                                }


                                if (
                                    data.status ===
                                    "pending"
                                ) {

                                    notifications.push({

                                        id:
                                            document.id,

                                        source:
                                            "friends",

                                        type:
                                            "amis",

                                        title:
                                            "Nouvelle demande d'ami",

                                        text:
                                            `${data.fromNom || ""} souhaite vous ajouter comme ami.`,

                                        date:
                                            data.date ||
                                            Date.now(),

                                        avatar:
                                            data.fromAvatar ||
                                            "",

                                        from:
                                            data.from ||
                                            "",

                                        fromNom:
                                            data.fromNom ||
                                            "",

                                        status:
                                            "pending",

                                        seen:
                                            data.seen === true

                                    });

                                    return;

                                }


                                if (
                                    data.status ===
                                    "accepted"
                                ) {

                                    notifications.push({

                                        id:
                                            document.id,

                                        source:
                                            "friends",

                                        type:
                                            "amis",

                                        title:
                                            "Vous êtes désormais amis",

                                        text:
                                            `Vous et ${data.fromNom || ""} êtes désormais amis.`,

                                        date:
                                            data.date ||
                                            Date.now(),

                                        avatar:
                                            data.fromAvatar ||
                                            "",

                                        from:
                                            data.from ||
                                            "",

                                        fromNom:
                                            data.fromNom ||
                                            "",

                                        status:
                                            "accepted",

                                        seen:
                                            true

                                    });

                                }

                            }
                        );


                        renderNotifications();

                    },

                    () => {

                        // On ne casse pas la page
                        renderNotifications();

                    }

                );


            notificationsUnsubscribers.push(
                unsubscribeDemandes
            );


            // =================================================
            // NOTIFICATIONS SYSTÈME
            // =================================================

            const notificationsQuery =
                query(

                    collection(
                        db,
                        "notifications"
                    ),

                    where(
                        "to",
                        "==",
                        matricule
                    ),

                    where(
                        "anneeAcademique",
                        "==",
                        anneeAcademique
                    )

                );


            const unsubscribeSystem =
                onSnapshot(

                    notificationsQuery,

                    snapshot => {

                        notifications =
                            notifications.filter(
                                notification =>
                                    notification.source !==
                                    "system"
                            );


                        snapshot.forEach(
                            document => {

                                const data =
                                    document.data();


                                // Ancienne notification
                                // de demande d'ami
                                if (
                                    data.type ===
                                        "amis" &&
                                    data.title ===
                                        "Nouvelle demande d'ami"
                                ) {

                                    return;

                                }


                                notifications.push({

                                    id:
                                        document.id,

                                    source:
                                        "system",

                                    type:
                                        data.type ||
                                        "campus",

                                    title:
                                        data.title ||
                                        "Notification",

                                    text:
                                        data.text ||
                                        "",

                                    date:
                                        data.date ||
                                        Date.now(),

                                    seen:
                                        data.seen === true,

                                    from:
                                        data.from ||
                                        "",

                                    fromNom:
                                        data.fromNom ||
                                        "",

                                    fromAvatar:
                                        data.fromAvatar ||
                                        "",

                                    icon:
                                        "fa-solid fa-bell",

                                    iconBg:
                                        "blue-bg"

                                });

                            }
                        );


                        renderNotifications();

                    },

                    () => {

                        renderNotifications();

                    }

                );


            notificationsUnsubscribers.push(
                unsubscribeSystem
            );


            // =================================================
            // RESTAURANT
            // =================================================

            const restaurantQuery =
                query(

                    collection(
                        db,
                        "restaurantNotifications"
                    ),

                    where(
                        "to",
                        "==",
                        matricule
                    ),

                    where(
                        "anneeAcademique",
                        "==",
                        anneeAcademique
                    )

                );


            const unsubscribeRestaurant =
                onSnapshot(

                    restaurantQuery,

                    snapshot => {

                        notifications =
                            notifications.filter(
                                notification =>
                                    notification.source !==
                                    "restaurant"
                            );


                        snapshot.forEach(
                            document => {

                                const data =
                                    document.data();


                                notifications.push({

                                    id:
                                        document.id,

                                    source:
                                        "restaurant",

                                    type:
                                        "restaurant",

                                    title:
                                        data.title ||
                                        "Restaurant",

                                    text:
                                        data.text ||
                                        "",

                                    date:
                                        data.date ||
                                        Date.now(),

                                    seen:
                                        data.seen === true,

                                    icon:
                                        "fa-solid fa-utensils",

                                    iconBg:
                                        "purple-bg"

                                });

                            }
                        );


                        renderNotifications();

                    },

                    () => {

                        renderNotifications();

                    }

                );


            notificationsUnsubscribers.push(
                unsubscribeRestaurant
            );


            // =================================================
            // RECHERCHE
            // =================================================

            const searchInput =
                document.getElementById(
                    "notification-search"
                );


            if (
                searchInput &&
                !searchInput.dataset.bound
            ) {

                searchInput.dataset.bound =
                    "true";


                searchInput.addEventListener(
                    "input",
                    () => {

                        currentSearch =
                            searchInput.value
                                .toLowerCase()
                                .trim();


                        renderNotifications();

                    }
                );

            }


            // =================================================
            // FILTRES
            // =================================================

            document
                .querySelectorAll(
                    ".category-pill"
                )
                .forEach(
                    pill => {

                        if (
                            pill.dataset.bound
                        ) {

                            return;

                        }


                        pill.dataset.bound =
                            "true";


                        pill.addEventListener(
                            "click",
                            () => {

                                document
                                    .querySelectorAll(
                                        ".category-pill"
                                    )
                                    .forEach(
                                        item =>
                                            item.classList.remove(
                                                "active-pill"
                                            )
                                    );


                                pill.classList.add(
                                    "active-pill"
                                );


                                let type =
                                    pill.textContent
                                        .toLowerCase()
                                        .trim();


                                if (
                                    type ===
                                    "tout"
                                ) {

                                    type =
                                        "all";

                                }


                                renderNotifications(
                                    type
                                );

                            }
                        );

                    }
                );


            // =================================================
            // MARQUER COMME LUES
            // =================================================

            await marquerNotificationsCommeLues(
                matricule,
                anneeAcademique
            );

        }
    );

}


// =====================================================
// MARQUER LES NOTIFICATIONS COMME LUES
// =====================================================

async function marquerNotificationsCommeLues(
    matricule,
    anneeAcademique
) {

    try {

        const [
            demandesSnapshot,
            notificationsSnapshot,
            restaurantSnapshot
        ] = await Promise.all([

            getDocs(
                query(
                    collection(
                        db,
                        "friendRequests"
                    ),
                    where(
                        "to",
                        "==",
                        matricule
                    ),
                    where(
                        "anneeAcademique",
                        "==",
                        anneeAcademique
                    )
                )
            ),

            getDocs(
                query(
                    collection(
                        db,
                        "notifications"
                    ),
                    where(
                        "to",
                        "==",
                        matricule
                    ),
                    where(
                        "anneeAcademique",
                        "==",
                        anneeAcademique
                    )
                )
            ),

            getDocs(
                query(
                    collection(
                        db,
                        "restaurantNotifications"
                    ),
                    where(
                        "to",
                        "==",
                        matricule
                    ),
                    where(
                        "anneeAcademique",
                        "==",
                        anneeAcademique
                    )
                )
            )

        ]);


        const batch =
            writeBatch(db);


        let modifications =
            0;


        // -------------------------------------------------
        // AMIS
        // -------------------------------------------------

        demandesSnapshot.docs.forEach(
            document => {

                const data =
                    document.data();


                if (
                    data.status ===
                        "pending" &&
                    data.seen !== true
                ) {

                    batch.update(
                        doc(
                            db,
                            "friendRequests",
                            document.id
                        ),
                        {
                            seen: true
                        }
                    );

                    modifications++;

                }

            }
        );


        // -------------------------------------------------
        // SYSTÈME
        // -------------------------------------------------

        notificationsSnapshot.docs.forEach(
            document => {

                const data =
                    document.data();


                if (
                    data.seen !== true
                ) {

                    batch.update(
                        doc(
                            db,
                            "notifications",
                            document.id
                        ),
                        {
                            seen: true
                        }
                    );

                    modifications++;

                }

            }
        );


        // -------------------------------------------------
        // RESTAURANT
        // -------------------------------------------------

        restaurantSnapshot.docs.forEach(
            document => {

                const data =
                    document.data();


                if (
                    data.seen !== true
                ) {

                    batch.update(
                        doc(
                            db,
                            "restaurantNotifications",
                            document.id
                        ),
                        {
                            seen: true
                        }
                    );

                    modifications++;

                }

            }
        );


        if (
            modifications > 0
        ) {

            await batch.commit();

        }

    } catch {
        // Ne bloque jamais l'affichage
    }

}


// =====================================================
// ACCEPTER UNE DEMANDE
// =====================================================

async function accepterDemande(
    button,
    profile
) {

    const requestId =
        button.dataset.id;


    if (!requestId) {
        return;
    }


    button.disabled =
        true;


    button.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Acceptation...
    `;


    try {

        const response =
            await fetch(
                "http://192.168.1.6:3000/api/auth/friend-request/accept",
                {

                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            requestId,

                            matricule:
                                profile.matricule

                        })

                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Impossible d'accepter la demande."
            );

        }


        const card =
            button.closest(
                ".friend-request-card"
            );


        if (card) {

            card.innerHTML = `

                <div
                    class="friend-request-accepted"
                >

                    <div
                        class="accepted-icon"
                    >

                        <i
                            class="fa-solid fa-check"
                        ></i>

                    </div>

                    <div>

                        <strong>
                            Vous êtes maintenant amis
                        </strong>

                        <p>
                            La demande a été acceptée.
                        </p>

                    </div>

                </div>

            `;

        }

    } catch (error) {

        button.disabled =
            false;


        button.innerHTML = `
            <i class="fa-solid fa-check"></i>
            Accepter
        `;


        alert(
            error.message ||
            "Impossible d'accepter la demande."
        );

    }

}


// =====================================================
// REFUSER UNE DEMANDE
// =====================================================

async function refuserDemande(
    button,
    profile
) {

    const requestId =
        button.dataset.id;


    if (!requestId) {
        return;
    }


    button.disabled =
        true;


    button.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Refus...
    `;


    try {

        const response =
            await fetch(
                "http://192.168.1.6:3000/api/auth/friend-request/reject",
                {

                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            requestId,

                            matricule:
                                profile.matricule

                        })

                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Impossible de refuser la demande."
            );

        }


        const card =
            button.closest(
                ".friend-request-card"
            );


        if (card) {
            card.remove();
        }

    } catch (error) {

        button.disabled =
            false;


        button.innerHTML = `
            <i class="fa-solid fa-xmark"></i>
            Refuser
        `;


        alert(
            error.message ||
            "Impossible de refuser la demande."
        );

    }

}


// =====================================================
// BADGE NOTIFICATIONS
// =====================================================

export function afficherBadgeNotifications() {

    requireRole(
        "etudiant",
        async ({
            profile,
            anneeAcademique
        }) => {

            const badge =
                document.getElementById(
                    "notification-badge"
                );


            if (!badge) {
                return;
            }


            const matricule =
                profile?.matricule;


            if (!matricule) {
                return;
            }


            // Éviter les doubles listeners
            if (
                badge.dataset.initialized
            ) {

                return;

            }


            badge.dataset.initialized =
                "true";


            let demandes = 0;

            let notificationsNonLues = 0;

            let restaurantNonLues = 0;


            function updateBadge() {

                const total =
                    demandes +
                    notificationsNonLues +
                    restaurantNonLues;


                if (
                    total <= 0
                ) {

                    badge.style.display =
                        "none";

                    badge.textContent =
                        "";

                    return;

                }


                badge.style.display =
                    "flex";

                badge.textContent =
                    total > 99
                        ? "99+"
                        : String(total);

            }


            // =================================================
            // DEMANDES
            // =================================================

            const demandesQuery =
                query(

                    collection(
                        db,
                        "friendRequests"
                    ),

                    where(
                        "to",
                        "==",
                        matricule
                    ),

                    where(
                        "anneeAcademique",
                        "==",
                        anneeAcademique
                    )

                );


            const unsubscribeDemandes =
                onSnapshot(

                    demandesQuery,

                    snapshot => {

                        const expediteurs =
                            new Set();


                        snapshot.docs.forEach(
                            document => {

                                const data =
                                    document.data();


                                if (
                                    data.status ===
                                        "pending" &&
                                    data.seen !== true
                                ) {

                                    expediteurs.add(
                                        data.from ||
                                        document.id
                                    );

                                }

                            }
                        );


                        demandes =
                            expediteurs.size;


                        updateBadge();

                    }

                );


            // =================================================
            // NOTIFICATIONS
            // =================================================

            const notificationsQuery =
                query(

                    collection(
                        db,
                        "notifications"
                    ),

                    where(
                        "to",
                        "==",
                        matricule
                    ),

                    where(
                        "anneeAcademique",
                        "==",
                        anneeAcademique
                    )

                );


            const unsubscribeNotifications =
                onSnapshot(

                    notificationsQuery,

                    snapshot => {

                        notificationsNonLues =
                            snapshot.docs.filter(
                                document => {

                                    const data =
                                        document.data();


                                    if (
                                        data.type ===
                                            "amis" &&
                                        data.title ===
                                            "Nouvelle demande d'ami"
                                    ) {

                                        return false;

                                    }


                                    return (
                                        data.seen !== true
                                    );

                                }
                            ).length;


                        updateBadge();

                    }

                );


            // =================================================
            // RESTAURANT
            // =================================================

            const restaurantQuery =
                query(

                    collection(
                        db,
                        "restaurantNotifications"
                    ),

                    where(
                        "to",
                        "==",
                        matricule
                    ),

                    where(
                        "anneeAcademique",
                        "==",
                        anneeAcademique
                    )

                );


            const unsubscribeRestaurant =
                onSnapshot(

                    restaurantQuery,

                    snapshot => {

                        restaurantNonLues =
                            snapshot.docs.filter(
                                document =>
                                    document.data()
                                        .seen !== true
                            ).length;


                        updateBadge();

                    }

                );


            // On garde les références pour
            // pouvoir les nettoyer si nécessaire.

            notificationsUnsubscribers.push(
                unsubscribeDemandes,
                unsubscribeNotifications,
                unsubscribeRestaurant
            );

        }
    );

}


// =====================================================
// RENDU CARTE
// =====================================================

function renderNotificationCard(
    n
) {

    // -------------------------------------------------
    // DEMANDE D'AMI ACCEPTÉE
    // -------------------------------------------------

    if (
        n.source === "friends" &&
        n.status === "accepted"
    ) {

        return `

            <div
                class="
                    notification-card
                    friend-request-card
                "
            >

                <div
                    class="
                        friend-request-avatar
                    "
                >

                    ${renderAvatar(
                        n.avatar,
                        n.fromNom
                    )}

                </div>


                <div
                    class="
                        notification-info
                        friend-request-info
                    "
                >

                    <strong>
                        Vous êtes désormais amis
                    </strong>

                    <p>
                        Vous et
                        <b>
                            ${escapeHtml(
                                n.fromNom
                            )}
                        </b>
                        êtes désormais amis.
                    </p>

                    <small>
                        ${formatDate(n.date)}
                    </small>

                </div>

            </div>

        `;

    }


    // -------------------------------------------------
    // DEMANDE D'AMI EN ATTENTE
    // -------------------------------------------------

    if (
        n.source === "friends" &&
        n.status === "pending"
    ) {

        return `

            <div
                class="
                    notification-card
                    friend-request-card
                "
            >

                <div
                    class="
                        friend-request-avatar
                    "
                >

                    ${renderAvatar(
                        n.avatar,
                        n.fromNom
                    )}

                </div>


                <div
                    class="
                        notification-info
                        friend-request-info
                    "
                >

                    <strong>
                        Nouvelle demande d'ami
                    </strong>

                    <p>

                        <b>
                            ${escapeHtml(
                                n.fromNom
                            )}
                        </b>

                        souhaite vous ajouter
                        comme ami.

                    </p>


                    <small>
                        ${formatDate(n.date)}
                    </small>


                    <div
                        class="
                            friend-request-actions
                        "
                    >

                        <button
                            class="accept-friend-btn"
                            data-id="${escapeAttribute(n.id)}"
                        >

                            <i
                                class="fa-solid fa-check"
                            ></i>

                            Accepter

                        </button>


                        <button
                            class="reject-friend-btn"
                            data-id="${escapeAttribute(n.id)}"
                        >

                            <i
                                class="fa-solid fa-xmark"
                            ></i>

                            Refuser

                        </button>

                    </div>

                </div>

            </div>

        `;

    }


    // -------------------------------------------------
    // NOTIFICATION NORMALE
    // -------------------------------------------------

    const icon =
        n.icon ||
        "fa-solid fa-bell";


    const iconBg =
        n.iconBg ||
        "";


    const avatarNotification =
        n.type === "amis" &&
        n.title === "Demande acceptée";


    return `

        <div
            class="
                notification-card
                normal-notification-card
            "
        >

            <div
                class="
                    notification-icon
                    ${iconBg}
                "
            >

                ${
                    avatarNotification
                        ? renderAvatar(
                            n.fromAvatar,
                            n.fromNom
                        )
                        : `
                            <i
                                class="${icon}"
                            ></i>
                        `
                }

            </div>


            <div
                class="
                    notification-info
                "
            >

                <strong>
                    ${escapeHtml(
                        n.title
                    )}
                </strong>


                <p>
                    ${escapeHtml(
                        n.text
                    )}
                </p>


                <small>
                    ${formatDate(
                        n.date
                    )}
                </small>

            </div>

        </div>

    `;

}


// =====================================================
// AVATAR
// =====================================================

function renderAvatar(
    avatar,
    nom
) {

    const initiales =
        getInitiales(
            nom || ""
        );


    if (!avatar) {

        return `
            <div
                class="avatar-fallback"
            >
                ${initiales}
            </div>
        `;

    }


    return `

        <img
            src="${escapeAttribute(avatar)}"
            alt="Avatar"
            onerror="
                this.style.display='none';
                this.nextElementSibling.style.display='flex';
            "
        >

        <div
            class="avatar-fallback"
            style="display:none;"
        >
            ${initiales}
        </div>

    `;

}


// =====================================================
// UTILITAIRES
// =====================================================

function formatDate(
    timestamp
) {

    if (!timestamp) {
        return "";
    }


    if (
        typeof timestamp.toDate ===
        "function"
    ) {

        return timestamp
            .toDate()
            .toLocaleString(
                "fr-FR"
            );

    }


    return new Date(
        timestamp
    ).toLocaleString(
        "fr-FR"
    );

}


function getInitiales(
    nom = ""
) {

    return nom
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(
            mot =>
                mot[0]
                    ?.toUpperCase() ||
                ""
        )
        .join("");

}


function escapeHtml(
    value = ""
) {

    return String(value)
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


function escapeAttribute(
    value = ""
) {

    return escapeHtml(
        value
    );

}