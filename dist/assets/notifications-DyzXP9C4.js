import{b as e,f as t,h as n,l as r,m as i,v as a,x as o,y as s}from"./authService-D_VO4Eli.js";import{t as c}from"./authGuard-CQaJ0AEA.js";var l=[],u=[],d=!1,f=null,p=``,m=`all`;function h(){u.forEach(e=>{try{e()}catch{}}),u=[]}function g(){c(`etudiant`,async({profile:t,anneeAcademique:o})=>{let s=document.getElementById(`notifications-list`);if(!s)return;let c=t?.matricule;if(!c||(f=t,d))return;d=!0,h();function g(e=m){m=e;let t=[...l];e!==`all`&&(t=t.filter(t=>t.type===e)),p&&(t=t.filter(e=>`
                                    ${e.title||``}
                                    ${e.text||``}
                                    ${e.fromNom||``}
                                    `.toLowerCase().includes(p)));let n=new Set;t=t.filter(e=>{let t=`${e.source}-${e.id}`;return e.source===`friends`&&(t=`friend-${e.from||e.id}`),n.has(t)?!1:(n.add(t),!0)}),s.innerHTML=t.map(e=>x(e)).join(``),s.querySelectorAll(`.accept-friend-btn`).forEach(e=>{e.onclick=()=>{v(e,f)}}),s.querySelectorAll(`.reject-friend-btn`).forEach(e=>{e.onclick=()=>{y(e,f)}})}let b=i(n(e(r,`friendRequests`),a(`to`,`==`,c),a(`anneeAcademique`,`==`,o)),e=>{l=l.filter(e=>e.source!==`friends`);let t=new Set;e.forEach(e=>{let n=e.data();if(n.status!==`rejected`&&!(n.from&&t.has(n.from))){if(n.from&&t.add(n.from),n.status===`pending`){l.push({id:e.id,source:`friends`,type:`amis`,title:`Nouvelle demande d'ami`,text:`${n.fromNom||``} souhaite vous ajouter comme ami.`,date:n.date||Date.now(),avatar:n.fromAvatar||``,from:n.from||``,fromNom:n.fromNom||``,status:`pending`,seen:n.seen===!0});return}n.status===`accepted`&&l.push({id:e.id,source:`friends`,type:`amis`,title:`Vous êtes désormais amis`,text:`Vous et ${n.fromNom||``} êtes désormais amis.`,date:n.date||Date.now(),avatar:n.fromAvatar||``,from:n.from||``,fromNom:n.fromNom||``,status:`accepted`,seen:!0})}}),g()},()=>{g()});u.push(b);let S=i(n(e(r,`notifications`),a(`to`,`==`,c),a(`anneeAcademique`,`==`,o)),e=>{l=l.filter(e=>e.source!==`system`),e.forEach(e=>{let t=e.data();t.type===`amis`&&t.title===`Nouvelle demande d'ami`||l.push({id:e.id,source:`system`,type:t.type||`campus`,title:t.title||`Notification`,text:t.text||``,date:t.date||Date.now(),seen:t.seen===!0,from:t.from||``,fromNom:t.fromNom||``,fromAvatar:t.fromAvatar||``,icon:`fa-solid fa-bell`,iconBg:`blue-bg`})}),g()},()=>{g()});u.push(S);let C=i(n(e(r,`restaurantNotifications`),a(`to`,`==`,c),a(`anneeAcademique`,`==`,o)),e=>{l=l.filter(e=>e.source!==`restaurant`),e.forEach(e=>{let t=e.data();l.push({id:e.id,source:`restaurant`,type:`restaurant`,title:t.title||`Restaurant`,text:t.text||``,date:t.date||Date.now(),seen:t.seen===!0,icon:`fa-solid fa-utensils`,iconBg:`purple-bg`})}),g()},()=>{g()});u.push(C);let w=document.getElementById(`notification-search`);w&&!w.dataset.bound&&(w.dataset.bound=`true`,w.addEventListener(`input`,()=>{p=w.value.toLowerCase().trim(),g()})),document.querySelectorAll(`.category-pill`).forEach(e=>{e.dataset.bound||(e.dataset.bound=`true`,e.addEventListener(`click`,()=>{document.querySelectorAll(`.category-pill`).forEach(e=>e.classList.remove(`active-pill`)),e.classList.add(`active-pill`);let t=e.textContent.toLowerCase().trim();t===`tout`&&(t=`all`),g(t)}))}),await _(c,o)})}async function _(i,c){try{let[l,u,d]=await Promise.all([t(n(e(r,`friendRequests`),a(`to`,`==`,i),a(`anneeAcademique`,`==`,c))),t(n(e(r,`notifications`),a(`to`,`==`,i),a(`anneeAcademique`,`==`,c))),t(n(e(r,`restaurantNotifications`),a(`to`,`==`,i),a(`anneeAcademique`,`==`,c)))]),f=s(r),p=0;l.docs.forEach(e=>{let t=e.data();t.status===`pending`&&t.seen!==!0&&(f.update(o(r,`friendRequests`,e.id),{seen:!0}),p++)}),u.docs.forEach(e=>{e.data().seen!==!0&&(f.update(o(r,`notifications`,e.id),{seen:!0}),p++)}),d.docs.forEach(e=>{e.data().seen!==!0&&(f.update(o(r,`restaurantNotifications`,e.id),{seen:!0}),p++)}),p>0&&await f.commit()}catch{}}async function v(e,t){let n=e.dataset.id;if(n){e.disabled=!0,e.innerHTML=`
        <i class="fa-solid fa-spinner fa-spin"></i>
        Acceptation...
    `;try{let r=await fetch(`http://192.168.1.6:3000/api/auth/friend-request/accept`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({requestId:n,matricule:t.matricule})}),i=await r.json();if(!r.ok||!i.success)throw Error(i.message||`Impossible d'accepter la demande.`);let a=e.closest(`.friend-request-card`);a&&(a.innerHTML=`

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

            `)}catch(t){e.disabled=!1,e.innerHTML=`
            <i class="fa-solid fa-check"></i>
            Accepter
        `,alert(t.message||`Impossible d'accepter la demande.`)}}}async function y(e,t){let n=e.dataset.id;if(n){e.disabled=!0,e.innerHTML=`
        <i class="fa-solid fa-spinner fa-spin"></i>
        Refus...
    `;try{let r=await fetch(`http://192.168.1.6:3000/api/auth/friend-request/reject`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({requestId:n,matricule:t.matricule})}),i=await r.json();if(!r.ok||!i.success)throw Error(i.message||`Impossible de refuser la demande.`);let a=e.closest(`.friend-request-card`);a&&a.remove()}catch(t){e.disabled=!1,e.innerHTML=`
            <i class="fa-solid fa-xmark"></i>
            Refuser
        `,alert(t.message||`Impossible de refuser la demande.`)}}}function b(){c(`etudiant`,async({profile:t,anneeAcademique:o})=>{let s=document.getElementById(`notification-badge`);if(!s)return;let c=t?.matricule;if(!c||s.dataset.initialized)return;s.dataset.initialized=`true`;let l=0,d=0,f=0;function p(){let e=l+d+f;if(e<=0){s.style.display=`none`,s.textContent=``;return}s.style.display=`flex`,s.textContent=e>99?`99+`:String(e)}let m=i(n(e(r,`friendRequests`),a(`to`,`==`,c),a(`anneeAcademique`,`==`,o)),e=>{let t=new Set;e.docs.forEach(e=>{let n=e.data();n.status===`pending`&&n.seen!==!0&&t.add(n.from||e.id)}),l=t.size,p()}),h=i(n(e(r,`notifications`),a(`to`,`==`,c),a(`anneeAcademique`,`==`,o)),e=>{d=e.docs.filter(e=>{let t=e.data();return t.type===`amis`&&t.title===`Nouvelle demande d'ami`?!1:t.seen!==!0}).length,p()}),g=i(n(e(r,`restaurantNotifications`),a(`to`,`==`,c),a(`anneeAcademique`,`==`,o)),e=>{f=e.docs.filter(e=>e.data().seen!==!0).length,p()});u.push(m,h,g)})}function x(e){if(e.source===`friends`&&e.status===`accepted`)return`

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

                    ${S(e.avatar,e.fromNom)}

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
                            ${T(e.fromNom)}
                        </b>
                        êtes désormais amis.
                    </p>

                    <small>
                        ${C(e.date)}
                    </small>

                </div>

            </div>

        `;if(e.source===`friends`&&e.status===`pending`)return`

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

                    ${S(e.avatar,e.fromNom)}

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
                            ${T(e.fromNom)}
                        </b>

                        souhaite vous ajouter
                        comme ami.

                    </p>


                    <small>
                        ${C(e.date)}
                    </small>


                    <div
                        class="
                            friend-request-actions
                        "
                    >

                        <button
                            class="accept-friend-btn"
                            data-id="${E(e.id)}"
                        >

                            <i
                                class="fa-solid fa-check"
                            ></i>

                            Accepter

                        </button>


                        <button
                            class="reject-friend-btn"
                            data-id="${E(e.id)}"
                        >

                            <i
                                class="fa-solid fa-xmark"
                            ></i>

                            Refuser

                        </button>

                    </div>

                </div>

            </div>

        `;let t=e.icon||`fa-solid fa-bell`;return`

        <div
            class="
                notification-card
                normal-notification-card
            "
        >

            <div
                class="
                    notification-icon
                    ${e.iconBg||``}
                "
            >

                ${e.type===`amis`&&e.title===`Demande acceptée`?S(e.fromAvatar,e.fromNom):`
                            <i
                                class="${t}"
                            ></i>
                        `}

            </div>


            <div
                class="
                    notification-info
                "
            >

                <strong>
                    ${T(e.title)}
                </strong>


                <p>
                    ${T(e.text)}
                </p>


                <small>
                    ${C(e.date)}
                </small>

            </div>

        </div>

    `}function S(e,t){let n=w(t||``);return e?`

        <img
            src="${E(e)}"
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
            ${n}
        </div>

    `:`
            <div
                class="avatar-fallback"
            >
                ${n}
            </div>
        `}function C(e){return e?typeof e.toDate==`function`?e.toDate().toLocaleString(`fr-FR`):new Date(e).toLocaleString(`fr-FR`):``}function w(e=``){return e.trim().split(/\s+/).slice(0,2).map(e=>e[0]?.toUpperCase()||``).join(``)}function T(e=``){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}function E(e=``){return T(e)}export{g as n,b as t};