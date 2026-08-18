import { createIcons, icons } from "lucide";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase/firebase.js";
import { clearCurrentUserCache } from "../../../auth/authService.js";

import {
    collection,
    query,
    where,
    onSnapshot
} from "firebase/firestore";

import { db } from "../../../firebase/firebase.js";

import logo from "../../../assets/logo coud.png";




export async function loadSidebar(profile) {

    const container =
        document.getElementById(
            "sidebar-container"
        );


    if (
        container &&
        container.innerHTML.trim() === ""
    ) {

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

    }

    console.log(
    "🔐 PERMISSIONS SIDEBAR =",
    profile.permissions
);

    // =====================================================
// PERMISSIONS — SIDEBAR
// =====================================================

const permissions =
    profile.permissions || {};


// Résidents
if (!permissions.voirResidents) {

    document
        .getElementById("menu-residents")
        ?.remove();

}


// Recouvrement
if (!permissions.voirRecouvrement) {

    document
        .getElementById("menu-recouvrement")
        ?.remove();

}


// Demandes
if (!permissions.voirDemandes) {

    document
        .getElementById("menu-demandes")
        ?.remove();

}


// Suivi
if (!permissions.suivreBons) {

    document
        .getElementById("menu-suivi")
        ?.remove();

}


// Anciens bons
if (!permissions.voirAnciensBons) {

    document
        .getElementById("menu-anciens")
        ?.remove();

}


// Historique des demandes
if (!permissions.suivreBons) {

    document
        .getElementById("menu-historique")
        ?.remove();

}


// Tableau de bord
if (!permissions.voirTableauDeBord) {

    document
        .getElementById("menu-dashboard")
        ?.remove();

}



    // =====================================================
    // PAGE ACTIVE
    // =====================================================

    document
        .querySelectorAll(".section a")
        .forEach(
            link => {

                link.classList.remove(
                    "active"
                );

            }
        );


    const page =
        window.location.pathname;



    // =====================================================
    // DEMANDES
    // =====================================================

    if (
        page.includes(
            "/demandes/"
        )
    ) {

        document
            .getElementById(
                "menu-demandes"
            )
            ?.classList.add(
                "active"
            );

    }



    // =====================================================
    // TABLEAU DE BORD
    // =====================================================

    if (
        page.includes(
            "/tableau-de-bord/"
        )
    ) {

        document
            .getElementById(
                "menu-dashboard"
            )
            ?.classList.add(
                "active"
            );

    }



    // =====================================================
    // SUIVI
    // =====================================================

    if (
        page.includes(
            "/suivi/"
        )
    ) {

        document
            .getElementById(
                "menu-suivi"
            )
            ?.classList.add(
                "active"
            );

    }



    // =====================================================
    // ANCIENS BONS
    // =====================================================

    if (
        page.includes(
            "/anciens-bons/"
        )
    ) {

        document
            .getElementById(
                "menu-anciens"
            )
            ?.classList.add(
                "active"
            );

    }



    // =====================================================
    // HISTORIQUE
    // =====================================================

    if (
        page.includes(
            "/historique-demandes/"
        )
    ) {

        document
            .getElementById(
                "menu-historique"
            )
            ?.classList.add(
                "active"
            );

    }



    // =====================================================
    // RÉSIDENTS
    // =====================================================

    if (
        page.includes(
            "/residents/"
        )
    ) {

        document
            .getElementById(
                "menu-residents"
            )
            ?.classList.add(
                "active"
            );

    }



    // =====================================================
    // SUIVI — CLIC DEPUIS DEMANDES
    // =====================================================

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


        suiviLink.onclick =
            (e) => {

                if (
                    page.includes(
                        "/demandes/"
                    )
                ) {

                    e.preventDefault();


                    document
                        .getElementById(
                            "suivi"
                        )
                        ?.scrollIntoView({

                            behavior:
                                "smooth",

                            block:
                                "start"

                        });

                }

            };

    }



    // =====================================================
    // INFORMATIONS AGENT
    // =====================================================

    document
        .getElementById(
            "sidebar-affectation"
        )
        .textContent =
            profile.affectation;


    document
        .getElementById(
            "sidebar-fonction"
        )
        .textContent =
            profile.fonction;


    document
        .getElementById(
            "sidebar-nom"
        )
        .textContent =
            `${profile.prenom} ${profile.nom}`;


    document
        .getElementById(
            "sidebar-site"
        )
        .textContent =
            profile.site;



    // =====================================================
    // ICÔNES
    // =====================================================

    createIcons({
        icons
    });



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
            async (e) => {

                e.preventDefault();


                clearCurrentUserCache();


                await signOut(
                    auth
                );


                window.location.href =
                    "../../../auth/login.html";

            };

    }



    // =====================================================
    // MENU
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



    // =====================================================
    // BOUTON SIDEBAR PC
    // =====================================================

    if (
        menuBtn
    ) {

        menuBtn.onclick =
            () => {

                if (
                    window.innerWidth <=
                    768
                ) {

                    sidebar.classList.toggle(
                        "open"
                    );

                } else {

                    sidebar.classList.toggle(
                        "collapsed"
                    );

                }

            };

    }



    // =====================================================
    // BOUTON HEADER MOBILE
    // =====================================================

    if (
        mobileMenuBtn
    ) {

        mobileMenuBtn.onclick =
            (e) => {

                e.stopPropagation();


                sidebar.classList.toggle(
                    "open"
                );

            };

    }



    // =====================================================
    // FERMER EN CLIQUANT À CÔTÉ
    // =====================================================

    document.addEventListener(
        "click",
        (e) => {

            if (
                window.innerWidth >
                768
            ) {

                return;

            }


            if (

                sidebar.classList.contains(
                    "open"
                ) &&

                !sidebar.contains(
                    e.target
                ) &&

                e.target !==
                mobileMenuBtn

            ) {

                sidebar.classList.remove(
                    "open"
                );

            }

        }
    );



    // =====================================================
    // NOTIFICATIONS — DEMANDES ÉTUDIANTES
    // =====================================================

    const notifCount =
        document.getElementById(
            "notif-count"
        );


    if (
        notifCount
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

            console.log(
                "🔔 Notification agent :",
                {
                    siteAgent,
                    pavillonAgent,
                    affectationOriginale:
                        profile.affectation
                }
            );


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


            onSnapshot(

                notificationsQuery,

                (snapshot) => {

                    console.log(
                        "🔔 Demandes non vues :",
                        snapshot.size
                    );


                    const nombre =
                        snapshot.size;


                    if (
                        nombre > 0
                    ) {

                        notifCount.textContent =
                            nombre > 99
                                ? "99+"
                                : nombre;


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
                        "❌ Erreur compteur notifications :",
                        error
                    );


                    notifCount.textContent =
                        "";


                    notifCount.classList.add(
                        "hidden"
                    );

                }

            );

        }

    }

}