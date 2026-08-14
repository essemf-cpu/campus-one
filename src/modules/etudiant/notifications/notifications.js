// =====================
// NOTIFICATIONS
// =====================

export function afficherNotifications() {

    const zone =
        document.getElementById("notifications-list");

    if (!zone) return;

    const user =
        JSON.parse(
            localStorage.getItem("user")
        );

    if (!user) return;

    let notifications = [];

    function renderNotifications(type = "all") {

        zone.innerHTML = "";

        let liste = [...notifications];

        // =====================
        // FILTRE
        // =====================

        if (type !== "all") {

            liste = liste.filter((n) => {

                return n.type === type;

            });

        }

        // =====================
        // TRI
        // =====================

        liste.sort((a, b) => {

            return b.date - a.date;

        });

        // =====================
        // VIDE
        // =====================

        if (liste.length === 0) {

            zone.innerHTML = `
                <div class="notification-empty">
                    Aucune notification
                </div>
            `;

            return;
        }

        // =====================
        // AFFICHAGE
        // =====================

        liste.forEach((n) => {

            const dateFormatee =
                new Date(n.date)
                    .toLocaleString("fr-FR");

            zone.innerHTML += `

                <div class="notification-card">

                    <div class="notification-icon ${n.iconBg || ""}">

                        ${
                            n.source === "friends"

                            ?

                            `
                            <img
                                src="${n.avatar || ""}"
                                class="notification-avatar"
                                alt="Avatar">
                            `

                            :

                            `
                            <i class="${n.icon}"></i>
                            `
                        }

                    </div>

                    <div class="notification-info">

                        <strong>
                            ${n.title}
                        </strong>

                        <p>
                            ${n.text}
                        </p>

                        <small>
                            ${dateFormatee}
                        </small>

                    </div>

                    ${n.button || ""}

                </div>

            `;

        });

    }

    // =====================
    // AMIS
    // =====================

    db.collection("friendRequests")

        .where(
            "to",
            "==",
            user.carte
        )

        .onSnapshot((snapshot) => {

            notifications =
                notifications.filter(
                    n => n.source !== "friends"
                );

            snapshot.forEach((doc) => {

                const d = doc.data();

                notifications.push({

                    id: doc.id,

                    source: "friends",

                    type: "amis",

                    title: "Amis",

                    text:
                        d.status === "pending"

                        ?

                        `${d.fromNom} souhaite vous ajouter`

                        :

                        d.message ||
                        "Vous êtes désormais amis",

                    date:
                        d.date ||
                        Date.now(),

                    avatar:
                        d.fromAvatar ||
                        ""

                });

            });

            renderNotifications();

        });


    // =====================
    // SYSTEME
    // =====================

    db.collection("notifications")

        .where(
            "to",
            "==",
            user.carte
        )

        .onSnapshot((snapshot) => {

            notifications =
                notifications.filter(
                    n => n.source !== "system"
                );

            snapshot.forEach((doc) => {

                const n = doc.data();

                notifications.push({

                    id: doc.id,

                    source: "system",

                    type: n.type,

                    title: n.title,

                    text: n.text,

                    date:
                        n.date ||
                        Date.now(),

                    icon:
                        "fa-solid fa-bell",

                    iconBg:
                        "blue-bg"

                });

            });

            renderNotifications();

        });


    // =====================
    // RESTAURANT
    // =====================

    db.collection(
        "restaurantNotifications"
    )

    .where(
        "to",
        "==",
        user.carte
    )

    .onSnapshot((snapshot) => {

        notifications =
            notifications.filter(
                n => n.source !== "restaurant"
            );

        snapshot.forEach((doc) => {

            const r = doc.data();

            notifications.push({

                id: doc.id,

                source: "restaurant",

                type: "restaurant",

                title: r.title,

                text: r.text,

                date:
                    r.date ||
                    Date.now(),

                icon:
                    "fa-solid fa-utensils",

                iconBg:
                    "purple-bg"

            });

        });

        renderNotifications();

    });


    // =====================
    // FILTRES
    // =====================

    document
        .querySelectorAll(".category-pill")
        .forEach((pill) => {

            pill.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".category-pill"
                        )
                        .forEach((p) => {

                            p.classList.remove(
                                "active-pill"
                            );

                        });

                    pill.classList.add(
                        "active-pill"
                    );

                    let type =
                        pill.textContent
                            .toLowerCase()
                            .trim();

                    if (type === "tout") {

                        type = "all";

                    }

                    renderNotifications(type);

                }
            );

        });

}


// =====================
// BADGE
// =====================

export function afficherBadgeNotifications() {

    const badge =
        document.getElementById(
            "notification-badge"
        );

    if (!badge) return;

    const user =
        JSON.parse(
            localStorage.getItem("user")
        );

    if (!user) return;

    let demandes = 0;
    let notificationsNonLues = 0;
    let restaurantNonLues = 0;


    function updateBadge() {

        const total =
            demandes +
            notificationsNonLues +
            restaurantNonLues;

        if (total <= 0) {

            badge.style.display = "none";
            badge.textContent = "";

            return;

        }

        badge.style.display = "flex";
        badge.textContent = total;

    }


    // AMIS

    db.collection("friendRequests")

        .where(
            "to",
            "==",
            user.carte
        )

        .where(
            "status",
            "==",
            "pending"
        )

        .onSnapshot((snapshot) => {

            demandes =
                snapshot.size;

            updateBadge();

        });


    // SYSTEME

    db.collection("notifications")

        .where(
            "to",
            "==",
            user.carte
        )

        .where(
            "seen",
            "==",
            false
        )

        .onSnapshot((snapshot) => {

            notificationsNonLues =
                snapshot.size;

            updateBadge();

        });


    // RESTAURANT

    db.collection(
        "restaurantNotifications"
    )

    .where(
        "to",
        "==",
        user.carte
    )

    .where(
        "seen",
        "==",
        false
    )

    .onSnapshot((snapshot) => {

        restaurantNonLues =
            snapshot.size;

        updateBadge();

    });

}