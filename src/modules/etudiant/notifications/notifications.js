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
        async ({ profile }) => {

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
                demande.status === "pending" &&
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


                // ==========================
                // FILTRE
                // ==========================

                if (type !== "all") {

                    liste =
                        liste.filter(
                            (n) =>
                                n.type === type
                        );

                }


                // ==========================
                // TRI
                // ==========================

                liste.sort(
                    (a, b) =>
                        b.date - a.date
                );


                // ==========================
                // AUCUNE NOTIFICATION
                // ==========================

                if (
                    liste.length === 0
                ) {

                    zone.innerHTML = `

                        <div
                            class="notification-empty">

                            <i
                                class="fa-solid fa-bell-slash">
                            </i>

                            <p>
                                Aucune notification
                            </p>

                        </div>

                    `;

                    return;
                }


                // ==========================
                // AFFICHAGE
                // ==========================

                liste.forEach((n) => {

                    // ---------------------------------
                    // DEMANDE D'AMI
                    // ---------------------------------

                    if (
                        n.source ===
                        "friends"
                    ) {

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
                    Vous et
                    ${escapeHtml(
                        n.fromNom
                    )}
                    êtes désormais amis
                </strong>

                <p>
                    Vous pouvez maintenant
                    échanger avec
                    ${escapeHtml(
                        n.fromNom
                    )}.
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


                    // ---------------------------------
                    // NOTIFICATION NORMALE
                    // ---------------------------------

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

                                <i
                                    class="${
                                        n.icon ||
                                        "fa-solid fa-bell"
                                    }">
                                </i>

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

                });


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
                                        profile
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
                                        button
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

                const amiMatricule =
                    button.dataset.matricule;

                const amiNom =
                    button.dataset.nom;

                const amiAvatar =
                    button.dataset.avatar;


                if (!requestId) return;


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

                    // =============================================
                    // VÉRIFIER LA DEMANDE
                    // =============================================

                    const requestRef =
                        doc(
                            db,
                            "friendRequests",
                            requestId
                        );


                    const requestSnapshot =
                        await getDocs(
                            query(
                                collection(
                                    db,
                                    "friendRequests"
                                ),
                                where(
                                    "__name__",
                                    "==",
                                    requestId
                                )
                            )
                        );


                    if (
                        requestSnapshot.empty
                    ) {

                        throw new Error(
                            "Demande introuvable."
                        );

                    }


                    const requestData =
                        requestSnapshot
                            .docs[0]
                            .data();


                    if (
                        requestData.status !==
                        "pending"
                    ) {

                        throw new Error(
                            "Cette demande n'est plus en attente."
                        );

                    }


                    // =============================================
                    // VÉRIFIER SI DÉJÀ AMIS
                    // =============================================

                    const existingFriendQuery =
                        query(

                            collection(
                                db,
                                "friends"
                            ),

                            where(
                                "userCarte",
                                "==",
                                profile.matricule
                            ),

                            where(
                                "friendCarte",
                                "==",
                                amiMatricule
                            )

                        );


                    const existingFriend =
                        await getDocs(
                            existingFriendQuery
                        );


                    if (
                        existingFriend.empty
                    ) {

                        // =========================================
                        // AJOUT POUR L'UTILISATEUR CONNECTÉ
                        // =========================================

                        await addDoc(

                            collection(
                                db,
                                "friends"
                            ),

                            {

                                userCarte:
                                    profile.matricule,

                                userNom:
                                    `${profile.prenom} ${profile.nom}`,

                                friendCarte:
                                    amiMatricule,

                                friendNom:
                                    amiNom,

                                friendAvatar:
                                    amiAvatar ||
                                    "assets/default-user.png"

                            }

                        );


                        // =========================================
                        // AJOUT POUR L'AUTRE UTILISATEUR
                        // =========================================

                        await addDoc(

                            collection(
                                db,
                                "friends"
                            ),

                            {

                                userCarte:
                                    amiMatricule,

                                userNom:
                                    amiNom,

                                friendCarte:
                                    profile.matricule,

                                friendNom:
                                    `${profile.prenom} ${profile.nom}`,

                                friendAvatar:
                                    profile.avatar ||
                                    "assets/default-user.png"

                            }

                        );

                    }


                    // =============================================
                    // ACCEPTER LA DEMANDE
                    // =============================================

                    await updateDoc(
                        requestRef,
                        {

                            status:
                                "accepted",

                            message:
                                `${profile.prenom} ${profile.nom} a accepté votre demande d'ami.`,

                            date:
                                Date.now()

                        }
                    );


                    // =============================================
                    // NOTIFICATION POUR LE DEMANDEUR
                    // =============================================

                    console.log(
    "🔔 NOTIFICATION ACCEPTATION :",
    {
        amiMatricule,
        profileMatricule: profile.matricule
    }
);
                    await addDoc(

                        collection(
                            db,
                            "notifications"
                        ),

                        {

                            to:
                                amiMatricule,

                            type:
                                "amis",

                            title:
                                "Demande acceptée",

                            text:
                                `${profile.prenom} ${profile.nom} a accepté votre demande d'ami.`,

                            date:
                                Date.now(),

                            seen:
                                false

                        }

                    );


                    console.log(
                        "✅ Demande acceptée."
                    );


                    // =============================================
                    // MESSAGE TEMPORAIRE
                    // =============================================

                    button
                        .closest(
                            ".friend-request-card"
                        )
                        .innerHTML = `

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
                                        ${escapeHtml(
                                            amiNom
                                        )}
                                        a été ajouté à vos amis.
                                    </p>

                                </div>

                            </div>

                        `;


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
                        "Impossible d'accepter la demande."
                    );

                }

            }


            // =====================================================
            // REFUSER UNE DEMANDE
            // =====================================================

            async function refuserDemande(
                button
            ) {

                const requestId =
                    button.dataset.id;


                if (!requestId) return;


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

                    await updateDoc(

                        doc(
                            db,
                            "friendRequests",
                            requestId
                        ),

                        {

                            status:
                                "rejected",

                            date:
                                Date.now()

                        }

                    );


                    console.log(
                        "✅ Demande refusée."
                    );


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
                        "Impossible de refuser la demande."
                    );

                }

            }


            // =====================================================
            // DEMANDES D'AMIS
            // =====================================================

            await marquerNotificationsCommeLues();

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
                    )

                );


            onSnapshot(

                demandesQuery,

                (snapshot) => {

                    console.log(
                        "👥 Demandes reçues :",
                        snapshot.size
                    );


                    notifications =
                        notifications.filter(
                            (n) =>
                                n.source !==
                                "friends"
                        );


                    snapshot.forEach(
                        (document) => {

                            const d =
                                document.data();


                            // ==================================
                            // ON AFFICHE UNIQUEMENT LES DEMANDES
                            // EN ATTENTE
                            // ==================================

                            if (
                                d.status ===
                                "rejected"
                            ) {

                                return;

                            }


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
                                    d.status

                            });

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


                            // ==================================
                            // LES NOTIFICATIONS "AMIS"
                            // SONT GÉRÉES PAR friendRequests
                            // ==================================

                            if (
                                n.type ===
                                "amis"
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


                                // Réappliquer
                                // la recherche

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

        }
    );

}



// =====================================================
// BADGE
// =====================================================

export function afficherBadgeNotifications() {

    requireRole(

        "etudiant",

        async ({ profile }) => {

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
            // BADGE
            // =================================================

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
                    total;

            }


            // =================================================
            // DEMANDES AMIS
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
                    )

                );


            onSnapshot(

                demandesQuery,

                (snapshot) => {

                    demandes =
    snapshot.docs.filter(
        (document) => {

            const d =
                document.data();

            return (
                d.status === "pending" &&
                d.seen !== true
            );

        }
    ).length;


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

            return (
                n.seen === false
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
                    )

                );


            onSnapshot(

                restaurantQuery,

                (snapshot) => {

                    restaurantNonLues =
                        snapshot.docs.filter(
                            (document) =>
                                document
                                    .data()
                                    .seen ===
                                false
                        ).length;


                    updateBadge();

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