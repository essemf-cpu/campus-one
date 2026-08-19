import{_ as e,b as t,d as n,f as r,g as i,m as a,u as o,v as s,y as c}from"./authService-BFXktNCZ.js";import{t as l}from"./authGuard-PwbLRTEo.js";function u(){l(`etudiant`,async({profile:l,anneeAcademique:u})=>{let d=document.getElementById(`notifications-list`);if(!d)return;let g=l.matricule;if(!g){console.error(`❌ Matricule introuvable.`,l);return}console.log(`🔔 Notifications pour :`,g);let _=[];async function v(){try{let n=await r(i(c(o,`friendRequests`),s(`to`,`==`,g),s(`anneeAcademique`,`==`,u)));for(let r of n.docs){let n=r.data();n.status===`pending`&&n.seen!==!0&&await e(t(o,`friendRequests`,r.id),{seen:!0})}let a=await r(i(c(o,`notifications`),s(`to`,`==`,g),s(`anneeAcademique`,`==`,u)));for(let n of a.docs)n.data().seen!==!0&&await e(t(o,`notifications`,n.id),{seen:!0});let l=await r(i(c(o,`restaurantNotifications`),s(`to`,`==`,g),s(`anneeAcademique`,`==`,u)));for(let n of l.docs)n.data().seen!==!0&&await e(t(o,`restaurantNotifications`,n.id),{seen:!0});console.log(`✅ Notifications marquées comme lues.`)}catch(e){console.error(`❌ Erreur lecture notifications :`,e)}}function y(e=`all`){d.innerHTML=``;let t=[..._];e!==`all`&&(t=t.filter(t=>t.type===e)),t=t.filter(e=>{if(e.source===`friends`){if(e.status===`accepted`){d.innerHTML+=`

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
                            ${p(e.fromNom)}
                        </div>
                        `:`
                        <div
                            class="
                                avatar-fallback
                            "
                        >
                            ${p(e.fromNom)}
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
                            ${m(e.fromNom)}
                        </b>
                        êtes désormais amis.
                    </p>

                    <small>
                        ${f(e.date)}
                    </small>

                </div>

            </div>

        `;return}d.innerHTML+=`

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
                        ${p(e.fromNom)}
                    </div>
                    `:`
                    <div
                        class="
                            avatar-fallback
                        "
                    >
                        ${p(e.fromNom)}
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
                        ${m(e.fromNom)}
                    </b>

                    souhaite vous ajouter
                    comme ami.

                </p>


                <small>
                    ${f(e.date)}
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
                        data-nom="${h(e.fromNom)}"
                        data-avatar="${h(e.avatar||``)}"
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

    `;return}d.innerHTML+=`

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
                src="${h(e.fromAvatar)}"
                alt="${h(e.fromNom||``)}"
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
                ${p(e.fromNom||``)}
            </span>
            `:`
            <span
                class="notification-user-initial"
            >
                ${p(e.fromNom||``)}
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
                                        ${m(e.title)}
                                    </strong>


                                    <p>
                                        ${m(e.text)}
                                    </p>


                                    <small>
                                        ${f(e.date)}
                                    </small>

                                </div>

                            </div>

                        `}),document.querySelectorAll(`.accept-friend-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{await b(e,l,u)})}),document.querySelectorAll(`.reject-friend-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{await x(e)})})}async function b(a,l,u){let d=a.dataset.id,f=a.dataset.matricule,p=a.dataset.nom,h=a.dataset.avatar;if(d){a.disabled=!0,a.innerHTML=`

                    <i
                        class="
                            fa-solid
                            fa-spinner
                            fa-spin
                        ">
                    </i>

                    Acceptation...

                `;try{let g=t(o,`friendRequests`,d),_=await r(i(c(o,`friendRequests`),s(`__name__`,`==`,d)));if(_.empty)throw Error(`Demande introuvable.`);if(_.docs[0].data().status!==`pending`)throw Error(`Cette demande n'est plus en attente.`);(await r(i(c(o,`friends`),s(`userCarte`,`==`,l.matricule),s(`friendCarte`,`==`,f)))).empty&&(await n(c(o,`friends`),{userCarte:l.matricule,userNom:`${l.prenom} ${l.nom}`,friendCarte:f,friendNom:p,friendAvatar:h||`assets/default-user.png`}),await n(c(o,`friends`),{userCarte:f,userNom:p,friendCarte:l.matricule,friendNom:`${l.prenom} ${l.nom}`,friendAvatar:l.avatar||`assets/default-user.png`})),await e(g,{status:`accepted`,seen:!0,message:`${l.prenom} ${l.nom} a accepté votre demande d'ami.`,date:Date.now()}),await n(c(o,`notifications`),{to:f,anneeAcademique:u,type:`amis`,title:`Demande acceptée`,text:`${l.prenom} ${l.nom} a accepté votre demande d'ami.`,from:l.matricule,fromNom:`${l.prenom} ${l.nom}`,fromAvatar:l.avatar||``,date:Date.now(),seen:!1}),console.log(`✅ Demande acceptée.`);let v=a.closest(`.friend-request-card`);v&&(v.innerHTML=`

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
                                        ${m(p)}
                                        a été ajouté à vos amis.
                                    </p>

                                </div>

                            </div>

                        `)}catch(e){console.error(`❌ Erreur acceptation :`,e),a.disabled=!1,a.innerHTML=`

                        <i
                            class="
                                fa-solid
                                fa-check
                            ">
                        </i>

                        Accepter

                    `,alert(`Impossible d'accepter la demande.`)}}}async function x(n){let r=n.dataset.id;if(r){n.disabled=!0,n.innerHTML=`

                    <i
                        class="
                            fa-solid
                            fa-spinner
                            fa-spin
                        ">
                    </i>

                    Refus...

                `;try{await e(t(o,`friendRequests`,r),{status:`rejected`,seen:!0,date:Date.now()}),console.log(`✅ Demande refusée.`)}catch(e){console.error(`❌ Erreur refus :`,e),n.disabled=!1,n.innerHTML=`

                        <i
                            class="
                                fa-solid
                                fa-xmark
                            ">
                        </i>

                        Refuser

                    `,alert(`Impossible de refuser la demande.`)}}}a(i(c(o,`friendRequests`),s(`to`,`==`,g),s(`anneeAcademique`,`==`,u)),e=>{console.log(`👥 Demandes reçues :`,e.size),_=_.filter(e=>e.source!==`friends`);let t=new Set;e.forEach(e=>{let n=e.data();if(n.status!==`rejected`&&!(n.from&&t.has(n.from))){if(n.from&&t.add(n.from),n.status===`pending`){_.push({id:e.id,source:`friends`,type:`amis`,title:`Nouvelle demande d'ami`,text:`${n.fromNom} souhaite vous ajouter comme ami.`,date:n.date||Date.now(),avatar:n.fromAvatar||``,from:n.from,fromNom:n.fromNom,status:`pending`,seen:n.seen??!1});return}n.status===`accepted`&&_.push({id:e.id,source:`friends`,type:`amis`,title:`Vous êtes désormais amis`,text:`Vous et ${n.fromNom} êtes désormais amis.`,date:n.date||Date.now(),avatar:n.fromAvatar||``,from:n.from,fromNom:n.fromNom,status:`accepted`,seen:!0})}}),y()},e=>{console.error(`❌ Erreur demandes d'amis :`,e)}),a(i(c(o,`notifications`),s(`to`,`==`,g),s(`anneeAcademique`,`==`,u)),e=>{console.log(`🔔 Notifications système :`,e.size),_=_.filter(e=>e.source!==`system`),e.forEach(e=>{let t=e.data();t.type===`amis`&&t.title===`Nouvelle demande d'ami`||_.push({id:e.id,source:`system`,type:t.type||`campus`,title:t.title||`Notification`,text:t.text||``,date:t.date||Date.now(),seen:t.seen??!1,from:t.from||``,fromNom:t.fromNom||``,fromAvatar:t.fromAvatar||``,icon:`fa-solid fa-bell`,iconBg:`blue-bg`})}),y()},e=>{console.error(`❌ Erreur notifications système :`,e)}),a(i(c(o,`restaurantNotifications`),s(`to`,`==`,g),s(`anneeAcademique`,`==`,u)),e=>{console.log(`🍽️ Notifications restaurant :`,e.size),_=_.filter(e=>e.source!==`restaurant`),e.forEach(e=>{let t=e.data();_.push({id:e.id,source:`restaurant`,type:`restaurant`,title:t.title||`Restaurant`,text:t.text||``,date:t.date||Date.now(),seen:t.seen??!1,icon:`fa-solid fa-utensils`,iconBg:`purple-bg`})}),y()},e=>{console.error(`❌ Erreur restaurant :`,e)});let S=document.getElementById(`notification-search`);S&&S.addEventListener(`input`,()=>{let e=S.value.toLowerCase().trim();document.querySelectorAll(`.notification-card`).forEach(t=>{let n=t.textContent.toLowerCase();t.style.display=n.includes(e)?``:`none`})}),document.querySelectorAll(`.category-pill`).forEach(e=>{e.addEventListener(`click`,()=>{document.querySelectorAll(`.category-pill`).forEach(e=>{e.classList.remove(`active-pill`)}),e.classList.add(`active-pill`);let t=e.textContent.toLowerCase().trim();t===`tout`&&(t=`all`),y(t),S&&S.value&&S.dispatchEvent(new Event(`input`))})}),await v()})}function d(){l(`etudiant`,async({profile:e,anneeAcademique:t})=>{let n=document.getElementById(`notification-badge`);if(!n)return;let r=e.matricule;if(!r)return;let l=0,u=0,d=0;function f(){let e=l+u+d;if(console.log(`🔔 BADGE :`,{anneeAcademique:t,demandes:l,notificationsNonLues:u,restaurantNonLues:d,total:e}),e<=0){n.style.display=`none`,n.textContent=``;return}n.style.display=`flex`,n.textContent=e}a(i(c(o,`friendRequests`),s(`to`,`==`,r),s(`anneeAcademique`,`==`,t)),e=>{let t=new Set;e.docs.forEach(e=>{let n=e.data();n.status===`pending`&&n.seen!==!0&&t.add(n.from||e.id)}),l=t.size,f()},e=>{console.error(`❌ Erreur badge demandes :`,e)}),a(i(c(o,`notifications`),s(`to`,`==`,r),s(`anneeAcademique`,`==`,t)),e=>{u=e.docs.filter(e=>{let t=e.data();return t.type===`amis`&&t.title===`Nouvelle demande d'ami`?!1:t.seen!==!0}).length,f()},e=>{console.error(`❌ Erreur badge notifications :`,e)}),a(i(c(o,`restaurantNotifications`),s(`to`,`==`,r),s(`anneeAcademique`,`==`,t)),e=>{d=e.docs.filter(e=>e.data().seen!==!0).length,f()},e=>{console.error(`❌ Erreur badge restaurant :`,e)})})}function f(e){return new Date(e).toLocaleString(`fr-FR`)}function p(e=``){return e.trim().split(/\s+/).slice(0,2).map(e=>e[0]?.toUpperCase()||``).join(``)}function m(e=``){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}function h(e=``){return m(e)}export{u as n,d as t};