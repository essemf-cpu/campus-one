import { createIcons, icons } from "lucide";
import { signOut } from "firebase/auth";

import { auth, db } from "../../../firebase/firebase.js";
import { clearCurrentUserCache } from "../../../auth/authService.js";

import {
    collection,
    query,
    where,
    onSnapshot
} from "firebase/firestore";

import logo from "../../../assets/logo coud.png";


// =====================================================
// LISTENER NOTIFICATION UNIQUE
// =====================================================

let notificationsUnsubscribe = null;


// =====================================================
// CHARGEMENT SIDEBAR
// =====================================================

export async function loadSidebar(profile) {

    const container =
        document.getElementById("sidebar-container");

    if (!container) {
        return;
    }


    // =================================================
    // CRÉER LA SIDEBAR UNE SEULE FOIS
    // =================================================

    if (!container.dataset.loaded) {

        container.innerHTML = `

<aside class="sidebar">

<div class="top">

<button class="menu-btn">
<i data-lucide="menu"></i>
</button>


<div class="profile">

<div class="profile-header">

<img
    src="${logo}"
    class="logo"
    id="sidebar-logo"
>

<button class="notif-btn">

<i data-lucide="bell"></i>

<span
    class="badge hidden"
    id="notif-count"
></span>

</button>

</div>


<div class="profile-info">

<h3 id="sidebar-affectation"></h3>

<p id="sidebar-fonction"></p>

</div>

</div>


<div class="section">

<h4>VOIR AUSSI</h4>

<a
    id="menu-lingerie"
    href="../lingerie/index.html"
>
<i data-lucide="shirt"></i>
<span>Lingerie</span>
</a>


<a
    id="menu-residents"
    href="../residents/index.html"
>
<i data-lucide="users"></i>
<span>Résidents</span>
</a>


<a
    id="menu-recouvrement"
    href="../recouvrement/index.html"
>
<i data-lucide="wallet"></i>
<span>Recouvrement</span>
</a>

</div>


<div class="section">

<h4>BON DE TRAVAIL</h4>

<a
    id="menu-demandes"
    href="../demandes/index.html"
>
<i data-lucide="clipboard-list"></i>
<span>Demandes</span>
</a>


<a
    id="menu-suivi"
    href="../demandes/index.html#suivi"
>
<i data-lucide="clipboard-check"></i>
<span>Suivi</span>
</a>


<a
    id="menu-anciens"
    href="../anciens-bons/index.html"
>
<i data-lucide="archive"></i>
<span>Anciens bons</span>
</a>


<a
    id="menu-historique"
    href="../historique-demandes/index.html"
>
<i data-lucide="history"></i>
<span>Historique des demandes</span>
</a>

</div>


<div class="section">

<h4>GESTION</h4>

<a
    id="menu-dashboard"
    href="../tableau-de-bord/index.html"
>
<i data-lucide="layout-dashboard"></i>
<span>Mon tableau de bord</span>
</a>

</div>

</div>


<div class="bottom">

<a
    href="#"
    id="logout-btn"
>
<i data-lucide="log-out"></i>
<span>Déconnexion</span>
</a>


<div class="agent-card">

<div class="agent-avatar">
<i data-lucide="user"></i>
</div>


<div class="agent-info">

<strong
    class="agent-name"
    id="sidebar-nom"
></strong>

<small
    class="agent-site"
    id="sidebar-site"
></small>

</div>


<button class="agent-menu">
<i data-lucide="chevron-down"></i>
</button>

</div>

</div>

</aside>
`;

        container.dataset.loaded = "true";


        // Les icônes ne sont créées qu'une seule fois
        createIcons({
            icons
        });

    }


    // =================================================
    // PERMISSIONS
    // =================================================

    const permissions =
        profile?.permissions || {};


    const menus = {

        "menu-residents":
            permissions.voirResidents,

        "menu-recouvrement":
            permissions.voirRecouvrement,

        "menu-demandes":
            permissions.voirDemandes,

        "menu-suivi":
            permissions.suivreBons,

        "menu-anciens":
            permissions.voirAnciensBons,

        "menu-historique":
            permissions.suivreBons,

        "menu-dashboard":
            permissions.voirTableauDeBord

    };


    for (
        const [id, autorise]
        of Object.entries(menus)
    ) {

        const element =
            document.getElementById(id);

        if (!element) {
            continue;
        }

        element.style.display =
            autorise ? "" : "none";

    }


    // =================================================
    // PAGE ACTIVE
    // =================================================

    const page =
        window.location.pathname;


    const pages = [

        ["/demandes/", "menu-demandes"],

        ["/tableau-de-bord/", "menu-dashboard"],

        ["/anciens-bons/", "menu-anciens"],

        ["/historique-demandes/", "menu-historique"],

        ["/residents/", "menu-residents"]

    ];


    document
        .querySelectorAll(".section a")
        .forEach(
            link =>
                link.classList.remove("active")
        );


    for (
        const [fragment, id]
        of pages
    ) {

        if (
            page.includes(fragment)
        ) {

            document
                .getElementById(id)
                ?.classList.add("active");

        }

    }


    // =================================================
    // INFORMATIONS AGENT
    // =================================================

    const affectation =
        document.getElementById(
            "sidebar-affectation"
        );

    const fonction =
        document.getElementById(
            "sidebar-fonction"
        );

    const nom =
        document.getElementById(
            "sidebar-nom"
        );

    const site =
        document.getElementById(
            "sidebar-site"
        );


    if (affectation) {
        affectation.textContent =
            profile.affectation || "";
    }


    if (fonction) {
        fonction.textContent =
            profile.fonction || "";
    }


    if (nom) {
        nom.textContent =
            `${profile.prenom || ""} ${profile.nom || ""}`.trim();
    }


    if (site) {
        site.textContent =
            profile.site || "";
    }


    // =================================================
    // ÉVÉNEMENTS
    // =================================================

    const sidebar =
        document.querySelector(".sidebar");

    const menuBtn =
        document.querySelector(".menu-btn");

    const mobileMenuBtn =
        document.getElementById("mobile-menu-btn");


    // -------------------------------------------------
    // MENU SIDEBAR
    // -------------------------------------------------

    if (
        menuBtn &&
        !menuBtn.dataset.binded
    ) {

        menuBtn.dataset.binded =
            "true";

        menuBtn.onclick = () => {

            if (
                window.innerWidth <= 768
            ) {

                sidebar?.classList.toggle(
                    "open"
                );

            } else {

                sidebar?.classList.toggle(
                    "collapsed"
                );

            }

        };

    }


    // -------------------------------------------------
    // MENU MOBILE
    // -------------------------------------------------

    if (
        mobileMenuBtn &&
        !mobileMenuBtn.dataset.binded
    ) {

        mobileMenuBtn.dataset.binded =
            "true";

        mobileMenuBtn.onclick = (event) => {

            event.stopPropagation();

            sidebar?.classList.toggle(
                "open"
            );

        };

    }


    // -------------------------------------------------
    // CLIC EXTÉRIEUR MOBILE
    // -------------------------------------------------

    if (
        !document.body.dataset.sidebarClickBound
    ) {

        document.body.dataset.sidebarClickBound =
            "true";

        document.addEventListener(
            "click",
            (event) => {

                if (
                    window.innerWidth > 768
                ) {
                    return;
                }

                const currentSidebar =
                    document.querySelector(
                        ".sidebar"
                    );

                const currentMobileButton =
                    document.getElementById(
                        "mobile-menu-btn"
                    );

                if (
                    currentSidebar &&
                    currentSidebar.classList.contains("open") &&
                    !currentSidebar.contains(event.target) &&
                    event.target !== currentMobileButton
                ) {

                    currentSidebar.classList.remove(
                        "open"
                    );

                }

            }
        );

    }


    // =================================================
    // SUIVI DEPUIS DEMANDES
    // =================================================

    const suiviLink =
        document.getElementById(
            "menu-suivi"
        );


    if (
        suiviLink &&
        !suiviLink.dataset.binded
    ) {

        suiviLink.dataset.binded =
            "true";

        suiviLink.onclick = (event) => {

            if (
                window.location.pathname.includes(
                    "/demandes/"
                )
            ) {

                event.preventDefault();

                document
                    .getElementById("suivi")
                    ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

            }

        };

    }


    // =================================================
    // DÉCONNEXION
    // =================================================

    const logout =
        document.getElementById(
            "logout-btn"
        );


    if (
        logout &&
        !logout.dataset.binded
    ) {

        logout.dataset.binded =
            "true";

        logout.onclick =
            async (event) => {

                event.preventDefault();

                if (
                    notificationsUnsubscribe
                ) {

                    notificationsUnsubscribe();

                    notificationsUnsubscribe =
                        null;

                }

                clearCurrentUserCache();

                await signOut(auth);

                window.location.href =
                    "../../../auth/login.html";

            };

    }


    // =================================================
    // NOTIFICATIONS
    // =================================================

    const notifCount =
        document.getElementById(
            "notif-count"
        );


    if (
        notifCount &&
        permissions.voirDemandes
    ) {

        const siteAgent =
            profile.site;


        const pavillonAgent =
            profile.affectation
                ?.replace(
                    /^Pavillon\s+/i,
                    ""
                )
                .trim();


        if (
            siteAgent &&
            pavillonAgent
        ) {

            // -----------------------------------------
            // ÉVITER LES DOUBLES LISTENERS
            // -----------------------------------------

            if (
                notificationsUnsubscribe
            ) {

                notificationsUnsubscribe();

                notificationsUnsubscribe =
                    null;

            }


            const notificationsQuery =
                query(

                    collection(
                        db,
                        "demandes_etudiants"
                    ),

                    where(
                        "site",
                        "==",
                        siteAgent
                    ),

                    where(
                        "pavillon",
                        "==",
                        pavillonAgent
                    ),

                    where(
                        "notificationVue",
                        "==",
                        false
                    )

                );


            notificationsUnsubscribe =
                onSnapshot(

                    notificationsQuery,

                    (snapshot) => {

                        const nombre =
                            snapshot.size;


                        if (
                            nombre > 0
                        ) {

                            notifCount.textContent =
                                nombre > 99
                                    ? "99+"
                                    : String(nombre);

                            notifCount.classList.remove(
                                "hidden"
                            );

                        } else {

                            notifCount.textContent =
                                "";

                            notifCount.classList.add(
                                "hidden"
                            );

                        }

                    },

                    () => {

                        notifCount.textContent =
                            "";

                        notifCount.classList.add(
                            "hidden"
                        );

                    }

                );

        }

    } else if (notifCount) {

        notifCount.textContent = "";

        notifCount.classList.add(
            "hidden"
        );

    }

}