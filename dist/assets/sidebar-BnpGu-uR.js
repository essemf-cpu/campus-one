import{C as e,_ as t,c as n,h as r,l as i,m as a,n as o,y as s}from"./authService-DX3gg-GL.js";import{n as c,r as l,t as u}from"./logo coud-0SNPf6hE.js";var d=null;async function f(f){let p=document.getElementById(`sidebar-container`);if(!p)return;p.dataset.loaded||(p.innerHTML=`

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
                                src="${u}"
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

        `,p.dataset.loaded=`true`,c({icons:l}));let m=f?.permissions||{},h={"menu-stocks":!0,"menu-bons":m.gererBons||m.suivreBons,"menu-dashboard":m.voirTableauDeBord,"menu-anciens":m.voirAnciensBons,"menu-notifications":!0,"menu-parametres":!0};for(let[e,t]of Object.entries(h)){let n=document.getElementById(e);n&&(n.style.display=t?``:`none`)}let g=window.location.pathname,_=[[`/stocks/`,`menu-stocks`],[`/bons/`,`menu-bons`],[`/tableau-de-bord/`,`menu-dashboard`],[`/anciens-bons/`,`menu-anciens`],[`/notifications/`,`menu-notifications`],[`/parametres/`,`menu-parametres`]];document.querySelectorAll(`.section a`).forEach(e=>e.classList.remove(`active`));for(let[e,t]of _)g.includes(e)&&document.getElementById(t)?.classList.add(`active`);let v=document.getElementById(`sidebar-affectation`),y=document.getElementById(`sidebar-fonction`),b=document.getElementById(`sidebar-nom`),x=document.getElementById(`sidebar-site`);v&&(v.textContent=`Atelier ${f?.site||``}`.trim()),y&&(y.textContent=f?.fonction||`Chef d'atelier`),b&&(b.textContent=`${f?.prenom||``} ${f?.nom||``}`.trim()||`Agent`),x&&(x.textContent=f?.site||``);let S=document.querySelector(`.sidebar`),C=document.querySelector(`.menu-btn`),w=document.getElementById(`mobile-menu-btn`);C&&!C.dataset.binded&&(C.dataset.binded=`true`,C.onclick=()=>{window.innerWidth<=768?S?.classList.toggle(`open`):S?.classList.toggle(`collapsed`)}),w&&!w.dataset.binded&&(w.dataset.binded=`true`,w.onclick=e=>{e.stopPropagation(),S?.classList.toggle(`open`)}),document.body.dataset.sidebarClickBound||(document.body.dataset.sidebarClickBound=`true`,document.addEventListener(`click`,e=>{if(window.innerWidth>768)return;let t=document.querySelector(`.sidebar`),n=document.getElementById(`mobile-menu-btn`);t&&t.classList.contains(`open`)&&!t.contains(e.target)&&e.target!==n&&t.classList.remove(`open`)}));let T=document.getElementById(`logout-btn`);T&&!T.dataset.binded&&(T.dataset.binded=`true`,T.onclick=async t=>{t.preventDefault(),d&&=(d(),null),o(),await e(n),window.location.href=`../../../auth/login.html`});let E=document.getElementById(`notif-count`);if(E){let e=f?.site;e?(d&&=(d(),null),d=a(r(s(i,`demandes_etudiants`),t(`site`,`==`,e),t(`notificationVue`,`==`,!1)),e=>{let t=e.size;t>0?(E.textContent=t>99?`99+`:String(t),E.classList.remove(`hidden`)):(E.textContent=``,E.classList.add(`hidden`))},e=>{console.error(`❌ Notifications Atelier :`,e),E.textContent=``,E.classList.add(`hidden`)})):(E.textContent=``,E.classList.add(`hidden`))}}export{f as t};