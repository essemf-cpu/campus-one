import{_ as e,b as t,f as n,g as r,l as i,m as a,u as o,v as s,y as c}from"./authService-DTiP6P1g.js";import{t as l}from"./authGuard-BnlEFo-L.js";function u(){l(`etudiant`,async({profile:l})=>{let u=document.getElementById(`notifications-list`);if(!u)return;let d=l.matricule;if(!d){console.error(`❌ Matricule introuvable.`,l);return}console.log(`🔔 Notifications pour :`,d);let g=[];async function _(){try{let a=await n(r(c(i,`friendRequests`),s(`to`,`==`,d)));for(let n of a.docs){let r=n.data();r.status===`pending`&&r.seen!==!0&&await e(t(i,`friendRequests`,n.id),{seen:!0})}}catch(e){console.error(`❌ Erreur lecture notifications :`,e)}}function v(e=`all`){u.innerHTML=``;let t=[...g];if(e!==`all`&&(t=t.filter(t=>t.type===e)),t.sort((e,t)=>t.date-e.date),t.length===0){u.innerHTML=`

                        <div
                            class="notification-empty">

                            <i
                                class="fa-solid fa-bell-slash">
                            </i>

                            <p>
                                Aucune notification
                            </p>

                        </div>

                    `;return}t.forEach(e=>{if(e.source===`friends`){if(e.status===`accepted`){u.innerHTML+=`

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
                    Vous et
                    ${m(e.fromNom)}
                    êtes désormais amis
                </strong>

                <p>
                    Vous pouvez maintenant
                    échanger avec
                    ${m(e.fromNom)}.
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

                                <i
                                    class="${e.icon||`fa-solid fa-bell`}">
                                </i>

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

                    `}),document.querySelectorAll(`.accept-friend-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{await y(e,l)})}),document.querySelectorAll(`.reject-friend-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{await b(e)})})}async function y(a,l){let u=a.dataset.id,d=a.dataset.matricule,f=a.dataset.nom,p=a.dataset.avatar;if(u){a.disabled=!0,a.innerHTML=`

                    <i
                        class="
                            fa-solid
                            fa-spinner
                            fa-spin
                        ">
                    </i>

                    Acceptation...

                `;try{let h=t(i,`friendRequests`,u),g=await n(r(c(i,`friendRequests`),s(`__name__`,`==`,u)));if(g.empty)throw Error(`Demande introuvable.`);if(g.docs[0].data().status!==`pending`)throw Error(`Cette demande n'est plus en attente.`);(await n(r(c(i,`friends`),s(`userCarte`,`==`,l.matricule),s(`friendCarte`,`==`,d)))).empty&&(await o(c(i,`friends`),{userCarte:l.matricule,userNom:`${l.prenom} ${l.nom}`,friendCarte:d,friendNom:f,friendAvatar:p||`assets/default-user.png`}),await o(c(i,`friends`),{userCarte:d,userNom:f,friendCarte:l.matricule,friendNom:`${l.prenom} ${l.nom}`,friendAvatar:l.avatar||`assets/default-user.png`})),await e(h,{status:`accepted`,message:`${l.prenom} ${l.nom} a accepté votre demande d'ami.`,date:Date.now()}),console.log(`🔔 NOTIFICATION ACCEPTATION :`,{amiMatricule:d,profileMatricule:l.matricule}),await o(c(i,`notifications`),{to:d,type:`amis`,title:`Demande acceptée`,text:`${l.prenom} ${l.nom} a accepté votre demande d'ami.`,date:Date.now(),seen:!1}),console.log(`✅ Demande acceptée.`),a.closest(`.friend-request-card`).innerHTML=`

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

                        `}catch(e){console.error(`❌ Erreur acceptation :`,e),a.disabled=!1,a.innerHTML=`

                        <i
                            class="
                                fa-solid
                                fa-check
                            ">
                        </i>

                        Accepter

                    `,alert(`Impossible d'accepter la demande.`)}}}async function b(n){let r=n.dataset.id;if(r){n.disabled=!0,n.innerHTML=`

                    <i
                        class="
                            fa-solid
                            fa-spinner
                            fa-spin
                        ">
                    </i>

                    Refus...

                `;try{await e(t(i,`friendRequests`,r),{status:`rejected`,date:Date.now()}),console.log(`✅ Demande refusée.`)}catch(e){console.error(`❌ Erreur refus :`,e),n.disabled=!1,n.innerHTML=`

                        <i
                            class="
                                fa-solid
                                fa-xmark
                            ">
                        </i>

                        Refuser

                    `,alert(`Impossible de refuser la demande.`)}}}await _(),a(r(c(i,`friendRequests`),s(`to`,`==`,d)),e=>{console.log(`👥 Demandes reçues :`,e.size),g=g.filter(e=>e.source!==`friends`),e.forEach(e=>{let t=e.data();t.status!==`rejected`&&g.push({id:e.id,source:`friends`,type:`amis`,title:`Nouvelle demande d'ami`,text:`${t.fromNom} souhaite vous ajouter comme ami.`,date:t.date||Date.now(),avatar:t.fromAvatar||``,from:t.from,fromNom:t.fromNom,status:t.status})}),v()},e=>{console.error(`❌ Erreur demandes d'amis :`,e)}),a(r(c(i,`notifications`),s(`to`,`==`,d)),e=>{console.log(`🔔 Notifications système :`,e.size),g=g.filter(e=>e.source!==`system`),e.forEach(e=>{let t=e.data();t.type!==`amis`&&g.push({id:e.id,source:`system`,type:t.type||`campus`,title:t.title||`Notification`,text:t.text||``,date:t.date||Date.now(),seen:t.seen??!1,icon:`fa-solid fa-bell`,iconBg:`blue-bg`})}),v()},e=>{console.error(`❌ Erreur notifications système :`,e)}),a(r(c(i,`restaurantNotifications`),s(`to`,`==`,d)),e=>{console.log(`🍽️ Notifications restaurant :`,e.size),g=g.filter(e=>e.source!==`restaurant`),e.forEach(e=>{let t=e.data();g.push({id:e.id,source:`restaurant`,type:`restaurant`,title:t.title||`Restaurant`,text:t.text||``,date:t.date||Date.now(),seen:t.seen??!1,icon:`fa-solid fa-utensils`,iconBg:`purple-bg`})}),v()},e=>{console.error(`❌ Erreur restaurant :`,e)});let x=document.getElementById(`notification-search`);x&&x.addEventListener(`input`,()=>{let e=x.value.toLowerCase().trim();document.querySelectorAll(`.notification-card`).forEach(t=>{let n=t.textContent.toLowerCase();t.style.display=n.includes(e)?``:`none`})}),document.querySelectorAll(`.category-pill`).forEach(e=>{e.addEventListener(`click`,()=>{document.querySelectorAll(`.category-pill`).forEach(e=>{e.classList.remove(`active-pill`)}),e.classList.add(`active-pill`);let t=e.textContent.toLowerCase().trim();t===`tout`&&(t=`all`),v(t),x&&x.value&&x.dispatchEvent(new Event(`input`))})})})}function d(){l(`etudiant`,async({profile:e})=>{let t=document.getElementById(`notification-badge`);if(!t)return;let n=e.matricule;if(!n)return;let o=0,l=0,u=0;function d(){let e=o+l+u;if(e<=0){t.style.display=`none`,t.textContent=``;return}t.style.display=`flex`,t.textContent=e}a(r(c(i,`friendRequests`),s(`to`,`==`,n)),e=>{o=e.docs.filter(e=>{let t=e.data();return t.status===`pending`&&t.seen!==!0}).length,d()}),a(r(c(i,`notifications`),s(`to`,`==`,n)),e=>{l=e.docs.filter(e=>e.data().seen===!1).length,d()}),a(r(c(i,`restaurantNotifications`),s(`to`,`==`,n)),e=>{u=e.docs.filter(e=>e.data().seen===!1).length,d()})})}function f(e){return new Date(e).toLocaleString(`fr-FR`)}function p(e=``){return e.trim().split(/\s+/).slice(0,2).map(e=>e[0]?.toUpperCase()||``).join(``)}function m(e=``){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}function h(e=``){return m(e)}export{u as n,d as t};