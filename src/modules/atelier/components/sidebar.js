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
        document.getElementById(
            "sidebar-container"
        );

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

                    <!-- =====================================
                         MENU MOBILE
                    ====================================== -->

                    <button class="menu-btn">
                        <i data-lucide="menu"></i>
                    </button>


                    <!-- =====================================
                         PROFIL / IDENTITÉ
                    ====================================== -->

                    <div class="profile">

                        <div class="profile-header">

                            <img
                                src="${logo}"
                                class="logo"
                                id="sidebar-logo"
                                alt="Campus One"
                            >

                            <button
                                class="notif-btn"
                                type="button"
                                title="Notifications"
                            >

                                <i data-lucide="bell"></i>

                                <span
                                    class="badge hidden"
                                    id="notif-count"
                                ></span>

                            </button>

                        </div>


                        <div class="profile-info">

                            <h3
                                id="sidebar-affectation"
                            ></h3>

                            <p
                                id="sidebar-fonction"
                            ></p>

                        </div>

                    </div>


                <!-- =====================================
                    NAVIGATION ATELIER
                ====================================== -->

                <!-- STOCKAGE -->
                <div class="section">

                    <h4>
                        STOCKAGE
                    </h4>

                    <a
                        id="menu-stocks"
                        href="../stocks/index.html"
                    >
                        <i data-lucide="package"></i>

                        <span>
                            Gestion des stocks
                        </span>
                    </a>

                </div>


                <!-- TRAVAIL -->
                <div class="section">

                    <h4>
                        TRAVAIL
                    </h4>

                    <!-- BONS DE TRAVAIL -->
                    <a
                        id="menu-bons"
                        href="../bons/index.html"
                    >
                        <i data-lucide="clipboard-list"></i>

                        <span>
                            Bons de travail
                        </span>
                    </a>


                    <!-- TABLEAU DE BORD -->
                    <a
                        id="menu-dashboard"
                        href="../tableau-de-bord/index.html"
                    >
                        <i data-lucide="layout-dashboard"></i>

                        <span>
                            Tableau de bord
                        </span>
                    </a>


                    <!-- ANCIENS BONS -->
                    <a
                        id="menu-anciens"
                        href="../anciens-bons/index.html"
                    >
                        <i data-lucide="archive"></i>

                        <span>
                            Anciens bons
                        </span>
                    </a>

                </div>


                <!-- SUIVI -->
                <div class="section">

                    <h4>
                        SUIVI
                    </h4>

                    <!-- NOTIFICATIONS -->
                    <a
                        id="menu-notifications"
                        href="../notifications/index.html"
                    >
                        <i data-lucide="bell"></i>

                        <span>
                            Notifications
                        </span>
                    </a>

                </div>


                <!-- COMPTE -->
                <div class="section">

                    <h4>
                        COMPTE
                    </h4>

                    <!-- PARAMÈTRES -->
                    <a
                        id="menu-parametres"
                        href="../parametres/index.html"
                    >
                        <i data-lucide="settings"></i>

                        <span>
                            Paramètres
                        </span>
                    </a>


                                        <!-- =====================================
                         DÉCONNEXION
                    ====================================== -->

                    <a
                        href="#"
                        id="logout-btn"
                    >

                        <i data-lucide="log-out"></i>

                        <span>
                            Déconnexion
                        </span>

                    </a>

                </div>

                </div>


                <!-- =========================================
                     BAS DE SIDEBAR
                ========================================== -->

                <div class="bottom">


                    <!-- =====================================
                         PROFIL AGENT
                    ====================================== -->

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


                        <button
                            class="agent-menu"
                            type="button"
                        >

                            <i
                                data-lucide="chevron-down"
                            ></i>

                        </button>

                    </div>


                </div>

            </aside>

        `;


        container.dataset.loaded =
            "true";


        // =================================================
        // CRÉATION DES ICÔNES
        // =================================================

        createIcons({
            icons
        });

    }


    // =====================================================
    // PERMISSIONS
    // =====================================================

    const permissions =
        profile?.permissions || {};


    const menus = {

        "menu-stocks":
            true,

        "menu-bons":
            permissions.gererBons ||
            permissions.suivreBons,

        "menu-dashboard":
            permissions.voirTableauDeBord,

        "menu-anciens":
            permissions.voirAnciensBons,

        "menu-notifications":
            true,

        "menu-parametres":
            true

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


    // =====================================================
    // PAGE ACTIVE
    // =====================================================

    const page =
        window.location.pathname;


    const pages = [

        [
            "/stocks/",
            "menu-stocks"
        ],

        [
            "/bons/",
            "menu-bons"
        ],

        [
            "/tableau-de-bord/",
            "menu-dashboard"
        ],

        [
            "/anciens-bons/",
            "menu-anciens"
        ],

        [
            "/notifications/",
            "menu-notifications"
        ],

        [
            "/parametres/",
            "menu-parametres"
        ]

    ];


    document
        .querySelectorAll(
            ".section a"
        )
        .forEach(
            link =>
                link.classList.remove(
                    "active"
                )
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
                ?.classList.add(
                    "active"
                );

        }

    }


    // =====================================================
    // INFORMATIONS AGENT
    // =====================================================

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
            `Atelier ${profile?.site || ""}`.trim();
    }


    if (fonction) {

        fonction.textContent =
            profile?.fonction ||
            "Chef d'atelier";

    }


    if (nom) {

        nom.textContent =
            `${profile?.prenom || ""} ${profile?.nom || ""}`
                .trim() ||
            "Agent";

    }


    if (site) {

        site.textContent =
            profile?.site ||
            "";

    }


    // =====================================================
    // ÉVÉNEMENTS
    // =====================================================

    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    const menuBtn =
        document.querySelector(
            ".menu-btn"
        );


    const mobileMenuBtn =
        document.getElementById(
            "mobile-menu-btn"
        );


    // =================================================
    // MENU SIDEBAR
    // =================================================

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


    // =================================================
    // MENU MOBILE
    // =================================================

    if (
        mobileMenuBtn &&
        !mobileMenuBtn.dataset.binded
    ) {

        mobileMenuBtn.dataset.binded =
            "true";


        mobileMenuBtn.onclick = (
            event
        ) => {

            event.stopPropagation();


            sidebar?.classList.toggle(
                "open"
            );

        };

    }


    // =================================================
    // CLIC EXTÉRIEUR MOBILE
    // =================================================

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
                    currentSidebar.classList.contains(
                        "open"
                    ) &&
                    !currentSidebar.contains(
                        event.target
                    ) &&
                    event.target !==
                        currentMobileButton
                ) {

                    currentSidebar.classList.remove(
                        "open"
                    );

                }

            }
        );

    }


    // =====================================================
    // DÉCONNEXION
    // =====================================================

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


    // =====================================================
    // NOTIFICATIONS
    // =====================================================

    const notifCount =
        document.getElementById(
            "notif-count"
        );


    if (
        notifCount
    ) {

        const siteAgent =
            profile?.site;


        /*
         * Pour l'Atelier, les notifications
         * restent liées au site.
         *
         * Le chef d'atelier travaille donc
         * sur les demandes de son site.
         */

        if (siteAgent) {

            // ---------------------------------------------
            // ÉVITER LES DOUBLES LISTENERS
            // ---------------------------------------------

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

                    (error) => {

                        console.error(
                            "❌ Notifications Atelier :",
                            error
                        );


                        notifCount.textContent =
                            "";

                        notifCount.classList.add(
                            "hidden"
                        );

                    }

                );

        } else {

            notifCount.textContent =
                "";

            notifCount.classList.add(
                "hidden"
            );

        }

    }

}