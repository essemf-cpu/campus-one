import{_ as e,b as t,f as n,g as r,m as i,u as a,v as o,y as s}from"./authService-DlvHUxoR.js";import{t as c}from"./authGuard-CR_v3-ld.js";function l(){c(`etudiant`,async({profile:c,anneeAcademique:l})=>{let u=document.getElementById(`notifications-list`);if(!u)return;let h=c.matricule;if(!h){console.error(`❌ Matricule introuvable.`,c);return}console.log(`🔔 Notifications pour :`,h);let g=[];async function _(){try{let i=await n(r(s(a,`friendRequests`),o(`to`,`==`,h),o(`anneeAcademique`,`==`,l)));for(let n of i.docs){let r=n.data();r.status===`pending`&&r.seen!==!0&&await e(t(a,`friendRequests`,n.id),{seen:!0})}let c=await n(r(s(a,`notifications`),o(`to`,`==`,h),o(`anneeAcademique`,`==`,l)));for(let n of c.docs)n.data().seen!==!0&&await e(t(a,`notifications`,n.id),{seen:!0});let u=await n(r(s(a,`restaurantNotifications`),o(`to`,`==`,h),o(`anneeAcademique`,`==`,l)));for(let n of u.docs)n.data().seen!==!0&&await e(t(a,`restaurantNotifications`,n.id),{seen:!0});console.log(`✅ Notifications marquées comme lues.`)}catch(e){console.error(`❌ Erreur lecture notifications :`,e)}}function v(e=`all`){u.innerHTML=``;let t=[...g];e!==`all`&&(t=t.filter(t=>t.type===e)),t=t.filter(e=>{if(e.source===`friends`){if(e.status===`accepted`){u.innerHTML+=`

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

                    ${e.avatar?`
                        <img
                            src="${e.avatar}"
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
                            ${f(e.fromNom)}
                        </div>
                        `:`
                        <div
                            class="
                                avatar-fallback
                            "
                        >
                            ${f(e.fromNom)}
                        </div>
                        `}

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
                            ${p(e.fromNom)}
                        </b>
                        êtes désormais amis.
                    </p>

                    <small>
                        ${d(e.date)}
                    </small>

                </div>

            </div>

        `;return}u.innerHTML+=`

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

                ${e.avatar?`
                    <img
                        src="${e.avatar}"
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
                        ${f(e.fromNom)}
                    </div>
                    `:`
                    <div
                        class="
                            avatar-fallback
                        "
                    >
                        ${f(e.fromNom)}
                    </div>
                    `}

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
                        ${p(e.fromNom)}
                    </b>

                    souhaite vous ajouter
                    comme ami.

                </p>


                <small>
                    ${d(e.date)}
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
                        data-id="${e.id}"
                        data-matricule="${e.from}"
                        data-nom="${m(e.fromNom)}"
                        data-avatar="${m(e.avatar||``)}"
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
                        data-id="${e.id}"
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

    `;return}u.innerHTML+=`

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

    ${e.type===`amis`&&e.title===`Demande acceptée`?e.fromAvatar?`
            <img
                src="${m(e.fromAvatar)}"
                alt="${m(e.fromNom||``)}"
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
                ${f(e.fromNom||``)}
            </span>
            `:`
            <span
                class="notification-user-initial"
            >
                ${f(e.fromNom||``)}
            </span>
            `:`
        <i
            class="${e.icon||`fa-solid fa-bell`}">
        </i>
        `}

</div>


                                <div
                                    class="
                                        notification-info
                                    "
                                >

                                    <strong>
                                        ${p(e.title)}
                                    </strong>


                                    <p>
                                        ${p(e.text)}
                                    </p>


                                    <small>
                                        ${d(e.date)}
                                    </small>

                                </div>

                            </div>

                        `}),document.querySelectorAll(`.accept-friend-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{await y(e,c,l)})}),document.querySelectorAll(`.reject-friend-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{await b(e,c)})})}async function y(e,t){let n=e.dataset.id;if(n){e.disabled=!0,e.innerHTML=`

        <i
            class="
                fa-solid
                fa-spinner
                fa-spin
            ">
        </i>

        Acceptation...

    `;try{let r=await fetch(`http://192.168.1.10:3000/api/auth/friend-request/accept`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({requestId:n,matricule:t.matricule})}),i=await r.json();if(!r.ok||!i.success)throw Error(i.message||`Impossible d'accepter la demande.`);console.log(`✅ Demande acceptée.`);let a=e.closest(`.friend-request-card`);a&&(a.innerHTML=`

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

            `)}catch(t){console.error(`❌ Erreur acceptation :`,t),e.disabled=!1,e.innerHTML=`

            <i
                class="
                    fa-solid
                    fa-check
                ">
            </i>

            Accepter

        `,alert(t.message||`Impossible d'accepter la demande.`)}}}async function b(e,t){let n=e.dataset.id;if(n){e.disabled=!0,e.innerHTML=`

        <i
            class="
                fa-solid
                fa-spinner
                fa-spin
            ">
        </i>

        Refus...

    `;try{let r=await fetch(`http://192.168.1.10:3000/api/auth/friend-request/reject`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({requestId:n,matricule:t.matricule})}),i=await r.json();if(!r.ok||!i.success)throw Error(i.message||`Impossible de refuser la demande.`);console.log(`✅ Demande refusée.`);let a=e.closest(`.friend-request-card`);a&&a.remove()}catch(t){console.error(`❌ Erreur refus :`,t),e.disabled=!1,e.innerHTML=`

            <i
                class="
                    fa-solid
                    fa-xmark
                ">
            </i>

            Refuser

        `,alert(t.message||`Impossible de refuser la demande.`)}}}i(r(s(a,`friendRequests`),o(`to`,`==`,h),o(`anneeAcademique`,`==`,l)),e=>{console.log(`👥 Demandes reçues :`,e.size),g=g.filter(e=>e.source!==`friends`);let t=new Set;e.forEach(e=>{let n=e.data();if(n.status!==`rejected`&&!(n.from&&t.has(n.from))){if(n.from&&t.add(n.from),n.status===`pending`){g.push({id:e.id,source:`friends`,type:`amis`,title:`Nouvelle demande d'ami`,text:`${n.fromNom} souhaite vous ajouter comme ami.`,date:n.date||Date.now(),avatar:n.fromAvatar||``,from:n.from,fromNom:n.fromNom,status:`pending`,seen:n.seen??!1});return}n.status===`accepted`&&g.push({id:e.id,source:`friends`,type:`amis`,title:`Vous êtes désormais amis`,text:`Vous et ${n.fromNom} êtes désormais amis.`,date:n.date||Date.now(),avatar:n.fromAvatar||``,from:n.from,fromNom:n.fromNom,status:`accepted`,seen:!0})}}),v()},e=>{console.error(`❌ Erreur demandes d'amis :`,e)}),i(r(s(a,`notifications`),o(`to`,`==`,h),o(`anneeAcademique`,`==`,l)),e=>{console.log(`🔔 Notifications système :`,e.size),g=g.filter(e=>e.source!==`system`),e.forEach(e=>{let t=e.data();t.type===`amis`&&t.title===`Nouvelle demande d'ami`||g.push({id:e.id,source:`system`,type:t.type||`campus`,title:t.title||`Notification`,text:t.text||``,date:t.date||Date.now(),seen:t.seen??!1,from:t.from||``,fromNom:t.fromNom||``,fromAvatar:t.fromAvatar||``,icon:`fa-solid fa-bell`,iconBg:`blue-bg`})}),v()},e=>{console.error(`❌ Erreur notifications système :`,e)}),i(r(s(a,`restaurantNotifications`),o(`to`,`==`,h),o(`anneeAcademique`,`==`,l)),e=>{console.log(`🍽️ Notifications restaurant :`,e.size),g=g.filter(e=>e.source!==`restaurant`),e.forEach(e=>{let t=e.data();g.push({id:e.id,source:`restaurant`,type:`restaurant`,title:t.title||`Restaurant`,text:t.text||``,date:t.date||Date.now(),seen:t.seen??!1,icon:`fa-solid fa-utensils`,iconBg:`purple-bg`})}),v()},e=>{console.error(`❌ Erreur restaurant :`,e)});let x=document.getElementById(`notification-search`);x&&x.addEventListener(`input`,()=>{let e=x.value.toLowerCase().trim();document.querySelectorAll(`.notification-card`).forEach(t=>{let n=t.textContent.toLowerCase();t.style.display=n.includes(e)?``:`none`})}),document.querySelectorAll(`.category-pill`).forEach(e=>{e.addEventListener(`click`,()=>{document.querySelectorAll(`.category-pill`).forEach(e=>{e.classList.remove(`active-pill`)}),e.classList.add(`active-pill`);let t=e.textContent.toLowerCase().trim();t===`tout`&&(t=`all`),v(t),x&&x.value&&x.dispatchEvent(new Event(`input`))})}),await _()})}function u(){c(`etudiant`,async({profile:e,anneeAcademique:t})=>{let n=document.getElementById(`notification-badge`);if(!n)return;let c=e.matricule;if(!c)return;let l=0,u=0,d=0;function f(){let e=l+u+d;if(console.log(`🔔 BADGE :`,{anneeAcademique:t,demandes:l,notificationsNonLues:u,restaurantNonLues:d,total:e}),e<=0){n.style.display=`none`,n.textContent=``;return}n.style.display=`flex`,n.textContent=e}i(r(s(a,`friendRequests`),o(`to`,`==`,c),o(`anneeAcademique`,`==`,t)),e=>{let t=new Set;e.docs.forEach(e=>{let n=e.data();n.status===`pending`&&n.seen!==!0&&t.add(n.from||e.id)}),l=t.size,f()},e=>{console.error(`❌ Erreur badge demandes :`,e)}),i(r(s(a,`notifications`),o(`to`,`==`,c),o(`anneeAcademique`,`==`,t)),e=>{u=e.docs.filter(e=>{let t=e.data();return t.type===`amis`&&t.title===`Nouvelle demande d'ami`?!1:t.seen!==!0}).length,f()},e=>{console.error(`❌ Erreur badge notifications :`,e)}),i(r(s(a,`restaurantNotifications`),o(`to`,`==`,c),o(`anneeAcademique`,`==`,t)),e=>{d=e.docs.filter(e=>e.data().seen!==!0).length,f()},e=>{console.error(`❌ Erreur badge restaurant :`,e)})})}function d(e){return new Date(e).toLocaleString(`fr-FR`)}function f(e=``){return e.trim().split(/\s+/).slice(0,2).map(e=>e[0]?.toUpperCase()||``).join(``)}function p(e=``){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}function m(e=``){return p(e)}export{l as n,u as t};