import{_ as e,b as t,d as n,h as r,p as i,u as a,v as o,x as s,y as c}from"./authService-CdYSz198.js";import{t as l}from"./authGuard-BeXI_65M.js";function u(){l(`etudiant`,async({profile:l})=>{let u=document.getElementById(`notifications-list`);if(!u)return;let d=l.matricule;if(!d){console.error(`❌ Matricule introuvable.`,l);return}console.log(`🔔 Notifications pour :`,d);let g=[];async function _(){try{let n=await i(e(t(a,`friendRequests`),c(`to`,`==`,d)));for(let e of n.docs){let t=e.data();t.status===`pending`&&t.seen!==!0&&await o(s(a,`friendRequests`,e.id),{seen:!0})}let r=await i(e(t(a,`notifications`),c(`to`,`==`,d)));for(let e of r.docs)e.data().seen!==!0&&await o(s(a,`notifications`,e.id),{seen:!0});let l=await i(e(t(a,`restaurantNotifications`),c(`to`,`==`,d)));for(let e of l.docs)e.data().seen!==!0&&await o(s(a,`restaurantNotifications`,e.id),{seen:!0});console.log(`✅ Notifications marquées comme lues.`)}catch(e){console.error(`❌ Erreur lecture notifications :`,e)}}function v(e=`all`){u.innerHTML=``;let t=[...g];e!==`all`&&(t=t.filter(t=>t.type===e)),t=t.filter(e=>{if(e.source===`friends`){if(e.status===`accepted`){u.innerHTML+=`

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

                        `}),document.querySelectorAll(`.accept-friend-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{await y(e,l)})}),document.querySelectorAll(`.reject-friend-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{await b(e)})})}async function y(r,l){let u=r.dataset.id,d=r.dataset.matricule,f=r.dataset.nom,p=r.dataset.avatar;if(u){r.disabled=!0,r.innerHTML=`

                    <i
                        class="
                            fa-solid
                            fa-spinner
                            fa-spin
                        ">
                    </i>

                    Acceptation...

                `;try{let h=s(a,`friendRequests`,u),g=await i(e(t(a,`friendRequests`),c(`__name__`,`==`,u)));if(g.empty)throw Error(`Demande introuvable.`);if(g.docs[0].data().status!==`pending`)throw Error(`Cette demande n'est plus en attente.`);(await i(e(t(a,`friends`),c(`userCarte`,`==`,l.matricule),c(`friendCarte`,`==`,d)))).empty&&(await n(t(a,`friends`),{userCarte:l.matricule,userNom:`${l.prenom} ${l.nom}`,friendCarte:d,friendNom:f,friendAvatar:p||`assets/default-user.png`}),await n(t(a,`friends`),{userCarte:d,userNom:f,friendCarte:l.matricule,friendNom:`${l.prenom} ${l.nom}`,friendAvatar:l.avatar||`assets/default-user.png`})),await o(h,{status:`accepted`,seen:!0,message:`${l.prenom} ${l.nom} a accepté votre demande d'ami.`,date:Date.now()}),await n(t(a,`notifications`),{to:d,type:`amis`,title:`Demande acceptée`,text:`${l.prenom} ${l.nom} a accepté votre demande d'ami.`,from:l.matricule,fromNom:`${l.prenom} ${l.nom}`,fromAvatar:l.avatar||``,date:Date.now(),seen:!1}),console.log(`✅ Demande acceptée.`);let _=r.closest(`.friend-request-card`);_&&(_.innerHTML=`

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
                                        ${m(f)}
                                        a été ajouté à vos amis.
                                    </p>

                                </div>

                            </div>

                        `)}catch(e){console.error(`❌ Erreur acceptation :`,e),r.disabled=!1,r.innerHTML=`

                        <i
                            class="
                                fa-solid
                                fa-check
                            ">
                        </i>

                        Accepter

                    `,alert(`Impossible d'accepter la demande.`)}}}async function b(e){let t=e.dataset.id;if(t){e.disabled=!0,e.innerHTML=`

                    <i
                        class="
                            fa-solid
                            fa-spinner
                            fa-spin
                        ">
                    </i>

                    Refus...

                `;try{await o(s(a,`friendRequests`,t),{status:`rejected`,seen:!0,date:Date.now()}),console.log(`✅ Demande refusée.`)}catch(t){console.error(`❌ Erreur refus :`,t),e.disabled=!1,e.innerHTML=`

                        <i
                            class="
                                fa-solid
                                fa-xmark
                            ">
                        </i>

                        Refuser

                    `,alert(`Impossible de refuser la demande.`)}}}r(e(t(a,`friendRequests`),c(`to`,`==`,d)),e=>{console.log(`👥 Demandes reçues :`,e.size),g=g.filter(e=>e.source!==`friends`);let t=new Set;e.forEach(e=>{let n=e.data();if(n.status!==`rejected`&&!(n.from&&t.has(n.from))){if(n.from&&t.add(n.from),n.status===`pending`){g.push({id:e.id,source:`friends`,type:`amis`,title:`Nouvelle demande d'ami`,text:`${n.fromNom} souhaite vous ajouter comme ami.`,date:n.date||Date.now(),avatar:n.fromAvatar||``,from:n.from,fromNom:n.fromNom,status:`pending`,seen:n.seen??!1});return}n.status===`accepted`&&g.push({id:e.id,source:`friends`,type:`amis`,title:`Vous êtes désormais amis`,text:`Vous et ${n.fromNom} êtes désormais amis.`,date:n.date||Date.now(),avatar:n.fromAvatar||``,from:n.from,fromNom:n.fromNom,status:`accepted`,seen:!0})}}),v()},e=>{console.error(`❌ Erreur demandes d'amis :`,e)}),r(e(t(a,`notifications`),c(`to`,`==`,d)),e=>{console.log(`🔔 Notifications système :`,e.size),g=g.filter(e=>e.source!==`system`),e.forEach(e=>{let t=e.data();t.type===`amis`&&t.title===`Nouvelle demande d'ami`||g.push({id:e.id,source:`system`,type:t.type||`campus`,title:t.title||`Notification`,text:t.text||``,date:t.date||Date.now(),seen:t.seen??!1,from:t.from||``,fromNom:t.fromNom||``,fromAvatar:t.fromAvatar||``,icon:`fa-solid fa-bell`,iconBg:`blue-bg`})}),v()},e=>{console.error(`❌ Erreur notifications système :`,e)}),r(e(t(a,`restaurantNotifications`),c(`to`,`==`,d)),e=>{console.log(`🍽️ Notifications restaurant :`,e.size),g=g.filter(e=>e.source!==`restaurant`),e.forEach(e=>{let t=e.data();g.push({id:e.id,source:`restaurant`,type:`restaurant`,title:t.title||`Restaurant`,text:t.text||``,date:t.date||Date.now(),seen:t.seen??!1,icon:`fa-solid fa-utensils`,iconBg:`purple-bg`})}),v()},e=>{console.error(`❌ Erreur restaurant :`,e)});let x=document.getElementById(`notification-search`);x&&x.addEventListener(`input`,()=>{let e=x.value.toLowerCase().trim();document.querySelectorAll(`.notification-card`).forEach(t=>{let n=t.textContent.toLowerCase();t.style.display=n.includes(e)?``:`none`})}),document.querySelectorAll(`.category-pill`).forEach(e=>{e.addEventListener(`click`,()=>{document.querySelectorAll(`.category-pill`).forEach(e=>{e.classList.remove(`active-pill`)}),e.classList.add(`active-pill`);let t=e.textContent.toLowerCase().trim();t===`tout`&&(t=`all`),v(t),x&&x.value&&x.dispatchEvent(new Event(`input`))})}),await _()})}function d(){l(`etudiant`,async({profile:n})=>{let i=document.getElementById(`notification-badge`);if(!i)return;let o=n.matricule;if(!o)return;let s=0,l=0,u=0;function d(){let e=s+l+u;if(console.log(`🔔 BADGE :`,{demandes:s,notificationsNonLues:l,restaurantNonLues:u,total:e}),e<=0){i.style.display=`none`,i.textContent=``;return}i.style.display=`flex`,i.textContent=e}r(e(t(a,`friendRequests`),c(`to`,`==`,o)),e=>{let t=new Set;e.docs.forEach(e=>{let n=e.data();n.status===`pending`&&n.seen!==!0&&t.add(n.from||e.id)}),s=t.size,d()},e=>{console.error(`❌ Erreur badge demandes :`,e)}),r(e(t(a,`notifications`),c(`to`,`==`,o)),e=>{l=e.docs.filter(e=>{let t=e.data();return t.type===`amis`&&t.title===`Nouvelle demande d'ami`?!1:t.seen!==!0}).length,d()},e=>{console.error(`❌ Erreur badge notifications :`,e)}),r(e(t(a,`restaurantNotifications`),c(`to`,`==`,o)),e=>{u=e.docs.filter(e=>e.data().seen!==!0).length,d()},e=>{console.error(`❌ Erreur badge restaurant :`,e)})})}function f(e){return new Date(e).toLocaleString(`fr-FR`)}function p(e=``){return e.trim().split(/\s+/).slice(0,2).map(e=>e[0]?.toUpperCase()||``).join(``)}function m(e=``){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}function h(e=``){return m(e)}export{u as n,d as t};