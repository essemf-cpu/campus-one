import { requireRole } from "../../../auth/authGuard.js";

import {
    collection,
    query,
    where,
    onSnapshot,
    getDocs,
    addDoc,
    updateDoc,
    doc
} from "firebase/firestore";

import { db } from "../../../firebase/firebase.js";


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

            if (!zone) return;


            const matricule =
                profile.matricule;


            if (!matricule) {

                console.error(
                    "❌ Matricule introuvable.",
                    profile
                );

                return;
            }


            console.log(
                "🔔 Notifications pour :",
                matricule
            );


            let notifications = [];


            // =====================================================
            // MARQUER LES NOTIFICATIONS COMME LUES
            // =====================================================

            async function marquerNotificationsCommeLues() {

                try {

                    // -------------------------------------------------
                    // DEMANDES D'AMIS
                    // -------------------------------------------------

                    const demandesSnapshot =
                        await getDocs(
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
                        );


                    for (
                        const document
                        of demandesSnapshot.docs
                    ) {

                        const demande =
                            document.data();


                        if (
                            demande.status ===
                                "pending" &&
                            demande.seen !== true
                        ) {

                            await updateDoc(
                                doc(
                                    db,
                                    "friendRequests",
                                    document.id
                                ),
                                {
                                    seen: true
                                }
                            );

                        }

                    }


                    // -------------------------------------------------
                    // NOTIFICATIONS SYSTÈME
                    // -------------------------------------------------

                    const notificationsSnapshot =
                        await getDocs(
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
                        );


                    for (
                        const document
                        of notificationsSnapshot.docs
                    ) {

                        const notification =
                            document.data();


                        if (
                            notification.seen !==
                            true
                        ) {

                            await updateDoc(
                                doc(
                                    db,
                                    "notifications",
                                    document.id
                                ),
                                {
                                    seen: true
                                }
                            );

                        }

                    }


                    // -------------------------------------------------
                    // RESTAURANT
                    // -------------------------------------------------

                    const restaurantSnapshot =
                        await getDocs(
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
                        );


                    for (
                        const document
                        of restaurantSnapshot.docs
                    ) {

                        const notification =
                            document.data();


                        if (
                            notification.seen !==
                            true
                        ) {

                            await updateDoc(
                                doc(
                                    db,
                                    "restaurantNotifications",
                                    document.id
                                ),
                                {
                                    seen: true
                                }
                            );

                        }

                    }


                    console.log(
                        "✅ Notifications marquées comme lues."
                    );


                } catch (error) {

                    console.error(
                        "❌ Erreur lecture notifications :",
                        error
                    );

                }

            }


            // =====================================================
            // AFFICHER LES NOTIFICATIONS
            // =====================================================

            function renderNotifications(
                type = "all"
            ) {

                zone.innerHTML = "";


                let liste =
                    [...notifications];


                // =================================================
                // FILTRE
                // =================================================

                if (
                    type !== "all"
                ) {

                    liste =
                        liste.filter(
                            (n) =>
                                n.type === type
                        );

                }


                // =================================================
                // SUPPRESSION DES DOUBLONS
                // =================================================

                const dejaAffichees =
                    new Set();


                liste =
                    liste.filter(
                        (n) => {

                            let cle;


                            if (
    n.source ===
    "friends"
) {

    // =================================================
    // DEMANDE ACCEPTÉE
    // =================================================

    if (
        n.status ===
        "accepted"
    ) {

        zone.innerHTML += `

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

                    ${
                        n.avatar
                        ?

                        `
                        <img
                            src="${n.avatar}"
                            alt="Avatar"
                            onerror="
                                this.style.display='none';
                                this.nextElementSibling.style.display='flex';
                            "
                        >

                        <div
                            class="
                                avatar-fallback
                            "
                            style="display:none;"
                        >
                            ${getInitiales(
                                n.fromNom
                            )}
                        </div>
                        `

                        :

                        `
                        <div
                            class="
                                avatar-fallback
                            "
                        >
                            ${getInitiales(
                                n.fromNom
                            )}
                        </div>
                        `
                    }

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
                        ${formatDate(
                            n.date
                        )}
                    </small>

                </div>

            </div>

        `;

        return;
    }


    // =================================================
    // DEMANDE EN ATTENTE
    // =================================================

    zone.innerHTML += `

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

                ${
                    n.avatar
                    ?

                    `
                    <img
                        src="${n.avatar}"
                        alt="Avatar"
                        onerror="
                            this.style.display='none';
                            this.nextElementSibling.style.display='flex';
                        "
                    >

                    <div
                        class="
                            avatar-fallback
                        "
                        style="display:none;"
                    >
                        ${getInitiales(
                            n.fromNom
                        )}
                    </div>
                    `

                    :

                    `
                    <div
                        class="
                            avatar-fallback
                        "
                    >
                        ${getInitiales(
                            n.fromNom
                        )}
                    </div>
                    `
                }

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
                    ${formatDate(
                        n.date
                    )}
                </small>


                <div
                    class="
                        friend-request-actions
                    "
                >

                    <button
                        class="
                            accept-friend-btn
                        "
                        data-id="${n.id}"
                        data-matricule="${n.from}"
                        data-nom="${escapeAttribute(
                            n.fromNom
                        )}"
                        data-avatar="${escapeAttribute(
                            n.avatar || ""
                        )}"
                    >

                        <i
                            class="
                                fa-solid
                                fa-check
                            ">
                        </i>

                        Accepter

                    </button>


                    <button
                        class="
                            reject-friend-btn
                        "
                        data-id="${n.id}"
                    >

                        <i
                            class="
                                fa-solid
                                fa-xmark
                            ">
                        </i>

                        Refuser

                    </button>

                </div>

            </div>

        </div>

    `;

                            return;

                        }


                        // -----------------------------------------
                        // NOTIFICATION NORMALE
                        // -----------------------------------------

                        zone.innerHTML += `

                            <div
                                class="
                                    notification-card
                                    normal-notification-card
                                "
                            >

                                <div
    class="
        notification-icon
        ${n.iconBg || ""}
    "
>

    ${
        n.type === "amis" &&
        n.title === "Demande acceptée"

        ?

        (
            n.fromAvatar

            ?

            `
            <img
                src="${escapeAttribute(n.fromAvatar)}"
                alt="${escapeAttribute(n.fromNom || "")}"
                class="notification-user-avatar"
                onerror="
                    this.style.display='none';
                    this.nextElementSibling.style.display='flex';
                "
            >

            <span
                class="notification-user-initial"
                style="display:none;"
            >
                ${getInitiales(
                    n.fromNom || ""
                )}
            </span>
            `

            :

            `
            <span
                class="notification-user-initial"
            >
                ${getInitiales(
                    n.fromNom || ""
                )}
            </span>
            `
        )

        :

        `
        <i
            class="${
                n.icon ||
                "fa-solid fa-bell"
            }">
        </i>
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
                );


                // =================================================
                // BOUTONS ACCEPTER
                // =================================================

                document
                    .querySelectorAll(
                        ".accept-friend-btn"
                    )
                    .forEach(
                        (button) => {

                            button.addEventListener(
                                "click",
                                async () => {

                                    await accepterDemande(
                                        button,
                                        profile,
                                        anneeAcademique
                                    );

                                }
                            );

                        }
                    );


                // =================================================
                // BOUTONS REFUSER
                // =================================================

                document
                    .querySelectorAll(
                        ".reject-friend-btn"
                    )
                    .forEach(
                        (button) => {

                            button.addEventListener(
                                "click",
                                async () => {

                                    await refuserDemande(
                                        button,
                                        profile
                                    );

                                }
                            );

                        }
                    );

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

        <i
            class="
                fa-solid
                fa-spinner
                fa-spin
            ">
        </i>

        Acceptation...

    `;


    try {

        const response =
            await fetch(
                "http://192.168.1.10:3000/api/auth/friend-request/accept",
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


        console.log(
            "✅ Demande acceptée."
        );


        const card =
            button.closest(
                ".friend-request-card"
            );


        if (card) {

            card.innerHTML = `

                <div
                    class="
                        friend-request-accepted
                    "
                >

                    <div
                        class="
                            accepted-icon
                        "
                    >

                        <i
                            class="
                                fa-solid
                                fa-check
                            ">
                        </i>

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

        console.error(
            "❌ Erreur acceptation :",
            error
        );


        button.disabled =
            false;


        button.innerHTML = `

            <i
                class="
                    fa-solid
                    fa-check
                ">
            </i>

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

        <i
            class="
                fa-solid
                fa-spinner
                fa-spin
            ">
        </i>

        Refus...

    `;


    try {

        const response =
            await fetch(
                "http://192.168.1.10:3000/api/auth/friend-request/reject",
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


        console.log(
            "✅ Demande refusée."
        );


        const card =
            button.closest(
                ".friend-request-card"
            );


        if (card) {

            card.remove();

        }


    } catch (error) {

        console.error(
            "❌ Erreur refus :",
            error
        );


        button.disabled =
            false;


        button.innerHTML = `

            <i
                class="
                    fa-solid
                    fa-xmark
                ">
            </i>

            Refuser

        `;


        alert(
            error.message ||
            "Impossible de refuser la demande."
        );

    }

}


            // =====================================================
// DEMANDES D'AMIS
// =====================================================

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


onSnapshot(

    demandesQuery,

    (snapshot) => {

        console.log(
            "👥 Demandes reçues :",
            snapshot.size
        );


        // -------------------------------------------------
        // RETIRER LES ANCIENNES DEMANDES DE LA LISTE
        // -------------------------------------------------

        notifications =
            notifications.filter(
                (n) =>
                    n.source !==
                    "friends"
            );


        const expediteursDejaVus =
            new Set();


        snapshot.forEach(
            (document) => {

                const d =
                    document.data();


                // -------------------------------------------------
                // REFUSÉE
                // -------------------------------------------------
                // Une demande refusée ne doit jamais apparaître.
                // Le demandeur ne reçoit aucune notification.
                // -------------------------------------------------

                if (
                    d.status ===
                    "rejected"
                ) {

                    return;

                }


                // -------------------------------------------------
                // UNE SEULE DEMANDE PAR EXPÉDITEUR
                // -------------------------------------------------

                if (
                    d.from &&
                    expediteursDejaVus.has(
                        d.from
                    )
                ) {

                    return;

                }


                if (d.from) {

                    expediteursDejaVus.add(
                        d.from
                    );

                }


                // -------------------------------------------------
                // DEMANDE EN ATTENTE
                // -------------------------------------------------

                if (
                    d.status ===
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
                            `${d.fromNom} souhaite vous ajouter comme ami.`,

                        date:
                            d.date ||
                            Date.now(),

                        avatar:
                            d.fromAvatar ||
                            "",

                        from:
                            d.from,

                        fromNom:
                            d.fromNom,

                        status:
                            "pending",

                        seen:
                            d.seen ??
                            false

                    });

                    return;

                }


                // -------------------------------------------------
                // DEMANDE ACCEPTÉE
                // -------------------------------------------------
                // Elle reste dans les notifications.
                // Elle n'est simplement plus une demande à traiter.
                // -------------------------------------------------

                if (
                    d.status ===
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
                            `Vous et ${d.fromNom} êtes désormais amis.`,

                        date:
                            d.date ||
                            Date.now(),

                        avatar:
                            d.fromAvatar ||
                            "",

                        from:
                            d.from,

                        fromNom:
                            d.fromNom,

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

    (error) => {

        console.error(
            "❌ Erreur demandes d'amis :",
            error
        );

    }

);

            // =====================================================
            // NOTIFICATIONS SYSTÈME
            // =====================================================

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


            onSnapshot(

                notificationsQuery,

                (snapshot) => {

                    console.log(
                        "🔔 Notifications système :",
                        snapshot.size
                    );


                    notifications =
                        notifications.filter(
                            (n) =>
                                n.source !==
                                "system"
                        );


                    snapshot.forEach(
                        (document) => {

                            const n =
                                document.data();


                            // ---------------------------------
                            // UNE ANCIENNE NOTIFICATION
                            // "NOUVELLE DEMANDE D'AMI"
                            // NE DOIT PAS ÊTRE AFFICHÉE ICI.
                            //
                            // La demande est gérée par
                            // friendRequests.
                            //
                            // "Demande acceptée" reste affichée.
                            // ---------------------------------

                            if (
                                n.type === "amis" &&
                                n.title ===
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
        n.type ||
        "campus",

    title:
        n.title ||
        "Notification",

    text:
        n.text ||
        "",

    date:
        n.date ||
        Date.now(),

    seen:
        n.seen ??
        false,

    // =========================================
    // INFORMATIONS DE LA PERSONNE
    // =========================================

    from:
        n.from ||
        "",

    fromNom:
        n.fromNom ||
        "",

    fromAvatar:
        n.fromAvatar ||
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

                (error) => {

                    console.error(
                        "❌ Erreur notifications système :",
                        error
                    );

                }

            );


            // =====================================================
            // RESTAURANT
            // =====================================================

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


            onSnapshot(

                restaurantQuery,

                (snapshot) => {

                    console.log(
                        "🍽️ Notifications restaurant :",
                        snapshot.size
                    );


                    notifications =
                        notifications.filter(
                            (n) =>
                                n.source !==
                                "restaurant"
                        );


                    snapshot.forEach(
                        (document) => {

                            const r =
                                document.data();


                            notifications.push({

                                id:
                                    document.id,

                                source:
                                    "restaurant",

                                type:
                                    "restaurant",

                                title:
                                    r.title ||
                                    "Restaurant",

                                text:
                                    r.text ||
                                    "",

                                date:
                                    r.date ||
                                    Date.now(),

                                seen:
                                    r.seen ??
                                    false,

                                icon:
                                    "fa-solid fa-utensils",

                                iconBg:
                                    "purple-bg"

                            });

                        }
                    );


                    renderNotifications();

                },

                (error) => {

                    console.error(
                        "❌ Erreur restaurant :",
                        error
                    );

                }

            );


            // =====================================================
            // RECHERCHE
            // =====================================================

            const searchInput =
                document.getElementById(
                    "notification-search"
                );


            if (searchInput) {

                searchInput.addEventListener(
                    "input",
                    () => {

                        const recherche =
                            searchInput.value
                                .toLowerCase()
                                .trim();


                        document
                            .querySelectorAll(
                                ".notification-card"
                            )
                            .forEach(
                                (card) => {

                                    const texte =
                                        card
                                            .textContent
                                            .toLowerCase();


                                    card.style.display =
                                        texte.includes(
                                            recherche
                                        )
                                        ?
                                        ""
                                        :
                                        "none";

                                }
                            );

                    }
                );

            }


            // =====================================================
            // FILTRES
            // =====================================================

            document
                .querySelectorAll(
                    ".category-pill"
                )
                .forEach(
                    (pill) => {

                        pill.addEventListener(
                            "click",
                            () => {

                                document
                                    .querySelectorAll(
                                        ".category-pill"
                                    )
                                    .forEach(
                                        (p) => {

                                            p.classList.remove(
                                                "active-pill"
                                            );

                                        }
                                    );


                                pill.classList.add(
                                    "active-pill"
                                );


                                let type =
                                    pill
                                        .textContent
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


                                if (
                                    searchInput &&
                                    searchInput.value
                                ) {

                                    searchInput
                                        .dispatchEvent(
                                            new Event(
                                                "input"
                                            )
                                        );

                                }

                            }
                        );

                    }
                );


            // =====================================================
            // IMPORTANT :
            // ON MARQUE COMME LUES APRÈS AVOIR INSTALLÉ
            // LES LISTENERS
            // =====================================================

            await marquerNotificationsCommeLues();

        }
    );

}


// =====================================================
// BADGE
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


            if (!badge) return;


            const matricule =
                profile.matricule;


            if (!matricule) return;


            let demandes = 0;

            let notificationsNonLues = 0;

            let restaurantNonLues = 0;


            // =================================================
            // MISE À JOUR DU BADGE
            // =================================================

            function updateBadge() {

                const total =
                    demandes +
                    notificationsNonLues +
                    restaurantNonLues;


                console.log(
                    "🔔 BADGE :",
                    {
                        anneeAcademique,
                        demandes,
                        notificationsNonLues,
                        restaurantNonLues,
                        total
                    }
                );


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
                    total;

            }


            // =================================================
            // DEMANDES D'AMIS
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


            onSnapshot(

                demandesQuery,

                (snapshot) => {

                    const expediteurs =
                        new Set();


                    snapshot.docs.forEach(
                        (document) => {

                            const d =
                                document.data();


                            if (
                                d.status ===
                                    "pending" &&
                                d.seen !== true
                            ) {

                                expediteurs.add(
                                    d.from ||
                                    document.id
                                );

                            }

                        }
                    );


                    demandes =
                        expediteurs.size;


                    updateBadge();

                },

                (error) => {

                    console.error(
                        "❌ Erreur badge demandes :",
                        error
                    );

                }

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


            onSnapshot(

                notificationsQuery,

                (snapshot) => {

                    notificationsNonLues =
                        snapshot.docs.filter(
                            (document) => {

                                const n =
                                    document.data();


                                // ---------------------------------
                                // UNE "NOUVELLE DEMANDE D'AMI"
                                // EST COMPTÉE DANS friendRequests
                                // ---------------------------------

                                if (
                                    n.type === "amis" &&
                                    n.title ===
                                        "Nouvelle demande d'ami"
                                ) {

                                    return false;

                                }


                                return (
                                    n.seen !== true
                                );

                            }
                        ).length;


                    updateBadge();

                },

                (error) => {

                    console.error(
                        "❌ Erreur badge notifications :",
                        error
                    );

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


            onSnapshot(

                restaurantQuery,

                (snapshot) => {

                    restaurantNonLues =
                        snapshot.docs.filter(
                            (document) => {

                                const r =
                                    document.data();


                                return (
                                    r.seen !== true
                                );

                            }
                        ).length;


                    updateBadge();

                },

                (error) => {

                    console.error(
                        "❌ Erreur badge restaurant :",
                        error
                    );

                }

            );

        }

    );

}



// =====================================================
// UTILITAIRES
// =====================================================

function formatDate(
    timestamp
) {

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
            (mot) =>
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