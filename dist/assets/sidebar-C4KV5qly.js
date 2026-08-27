import{b as e,c as t,h as n,l as r,m as i,n as a,v as o,w as s}from"./authService-D_VO4Eli.js";import{n as c,r as l,t as u}from"./logo coud-0SNPf6hE.js";var d=null;async function f(f){let p=document.getElementById(`sidebar-container`);if(!p)return;p.dataset.loaded||(p.innerHTML=`

<aside class="sidebar">

<div class="top">

<button class="menu-btn">
<i data-lucide="menu"></i>
</button>


<div class="profile">

<div class="profile-header">

<img
    src="${u}"
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
`,p.dataset.loaded=`true`,c({icons:l}));let m=f?.permissions||{},h={"menu-residents":m.voirResidents,"menu-recouvrement":m.voirRecouvrement,"menu-demandes":m.voirDemandes,"menu-suivi":m.suivreBons,"menu-anciens":m.voirAnciensBons,"menu-historique":m.suivreBons,"menu-dashboard":m.voirTableauDeBord};for(let[e,t]of Object.entries(h)){let n=document.getElementById(e);n&&(n.style.display=t?``:`none`)}let g=window.location.pathname,_=[[`/demandes/`,`menu-demandes`],[`/tableau-de-bord/`,`menu-dashboard`],[`/anciens-bons/`,`menu-anciens`],[`/historique-demandes/`,`menu-historique`],[`/residents/`,`menu-residents`]];document.querySelectorAll(`.section a`).forEach(e=>e.classList.remove(`active`));for(let[e,t]of _)g.includes(e)&&document.getElementById(t)?.classList.add(`active`);let v=document.getElementById(`sidebar-affectation`),y=document.getElementById(`sidebar-fonction`),b=document.getElementById(`sidebar-nom`),x=document.getElementById(`sidebar-site`);v&&(v.textContent=f.affectation||``),y&&(y.textContent=f.fonction||``),b&&(b.textContent=`${f.prenom||``} ${f.nom||``}`.trim()),x&&(x.textContent=f.site||``);let S=document.querySelector(`.sidebar`),C=document.querySelector(`.menu-btn`),w=document.getElementById(`mobile-menu-btn`);C&&!C.dataset.binded&&(C.dataset.binded=`true`,C.onclick=()=>{window.innerWidth<=768?S?.classList.toggle(`open`):S?.classList.toggle(`collapsed`)}),w&&!w.dataset.binded&&(w.dataset.binded=`true`,w.onclick=e=>{e.stopPropagation(),S?.classList.toggle(`open`)}),document.body.dataset.sidebarClickBound||(document.body.dataset.sidebarClickBound=`true`,document.addEventListener(`click`,e=>{if(window.innerWidth>768)return;let t=document.querySelector(`.sidebar`),n=document.getElementById(`mobile-menu-btn`);t&&t.classList.contains(`open`)&&!t.contains(e.target)&&e.target!==n&&t.classList.remove(`open`)}));let T=document.getElementById(`menu-suivi`);T&&!T.dataset.binded&&(T.dataset.binded=`true`,T.onclick=e=>{window.location.pathname.includes(`/demandes/`)&&(e.preventDefault(),document.getElementById(`suivi`)?.scrollIntoView({behavior:`smooth`,block:`start`}))});let E=document.getElementById(`logout-btn`);E&&!E.dataset.binded&&(E.dataset.binded=`true`,E.onclick=async e=>{e.preventDefault(),d&&=(d(),null),a(),await s(t),window.location.href=`../../../auth/login.html`});let D=document.getElementById(`notif-count`);if(D&&m.voirDemandes){let t=f.site,a=f.affectation?.replace(/^Pavillon\s+/i,``).trim();t&&a&&(d&&=(d(),null),d=i(n(e(r,`demandes_etudiants`),o(`site`,`==`,t),o(`pavillon`,`==`,a),o(`notificationVue`,`==`,!1)),e=>{let t=e.size;t>0?(D.textContent=t>99?`99+`:String(t),D.classList.remove(`hidden`)):(D.textContent=``,D.classList.add(`hidden`))},()=>{D.textContent=``,D.classList.add(`hidden`)}))}else D&&(D.textContent=``,D.classList.add(`hidden`))}export{f as t};