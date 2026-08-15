import"../../../modulepreload-polyfill-Dezn_h7o.js";function e(){let e=document.getElementById(`notifications-list`);if(!e)return;let t=JSON.parse(localStorage.getItem(`user`));if(!t){console.error(`❌ Aucun utilisateur connecté.`);return}let n=t.matricule||t.carte;if(!n){console.error(`❌ Aucun matricule trouvé.`,t);return}console.log(`🔔 Notifications de :`,n);let r=[];function i(t=`all`){e.innerHTML=``;let n=[...r];if(t!==`all`&&(n=n.filter(e=>e.type===t)),n.sort((e,t)=>t.date-e.date),n.length===0){e.innerHTML=`

                <div class="notification-empty">

                    Aucune notification

                </div>

            `;return}n.forEach(t=>{let n=new Date(t.date).toLocaleString(`fr-FR`);e.innerHTML+=`

                <div class="notification-card">

                    <div
                        class="
                            notification-icon
                            ${t.iconBg||``}
                        "
                    >

                        ${t.source===`friends`?`
                            <img
                                src="${t.avatar||`assets/default-user.png`}"
                                class="notification-avatar"
                                alt="Avatar">
                            `:`
                            <i
                                class="${t.icon||`fa-solid fa-bell`}">
                            </i>
                            `}

                    </div>


                    <div class="notification-info">

                        <strong>

                            ${t.title}

                        </strong>


                        <p>

                            ${t.text}

                        </p>


                        <small>

                            ${n}

                        </small>

                    </div>


                    ${t.button||``}

                </div>

            `})}db.collection(`friendRequests`).where(`to`,`==`,n).onSnapshot(e=>{console.log(`👥 Demandes d'amis :`,e.size),r=r.filter(e=>e.source!==`friends`),e.forEach(e=>{let t=e.data();r.push({id:e.id,source:`friends`,type:`amis`,title:`Amis`,text:t.status===`pending`?`${t.fromNom} souhaite vous ajouter`:t.message||`Vous êtes désormais amis`,date:t.date||Date.now(),avatar:t.fromAvatar||`assets/default-user.png`,status:t.status})}),i()},e=>{console.error(`❌ Erreur demandes d'amis :`,e)}),db.collection(`notifications`).where(`to`,`==`,n).onSnapshot(e=>{console.log(`🔔 Notifications système :`,e.size),r=r.filter(e=>e.source!==`system`),e.forEach(e=>{let t=e.data();r.push({id:e.id,source:`system`,type:t.type||`systeme`,title:t.title||`Notification`,text:t.text||``,date:t.date||Date.now(),seen:t.seen||!1,icon:`fa-solid fa-bell`,iconBg:`blue-bg`})}),i()},e=>{console.error(`❌ Erreur notifications système :`,e)}),db.collection(`restaurantNotifications`).where(`to`,`==`,n).onSnapshot(e=>{console.log(`🍽️ Notifications restaurant :`,e.size),r=r.filter(e=>e.source!==`restaurant`),e.forEach(e=>{let t=e.data();r.push({id:e.id,source:`restaurant`,type:`restaurant`,title:t.title||`Restaurant`,text:t.text||``,date:t.date||Date.now(),seen:t.seen||!1,icon:`fa-solid fa-utensils`,iconBg:`purple-bg`})}),i()},e=>{console.error(`❌ Erreur notifications restaurant :`,e)}),document.querySelectorAll(`.category-pill`).forEach(e=>{e.addEventListener(`click`,()=>{document.querySelectorAll(`.category-pill`).forEach(e=>{e.classList.remove(`active-pill`)}),e.classList.add(`active-pill`);let t=e.textContent.toLowerCase().trim();t===`tout`&&(t=`all`),i(t)})})}function t(){let e=document.getElementById(`notification-badge`);if(!e)return;let t=JSON.parse(localStorage.getItem(`user`));if(!t)return;let n=t.matricule||t.carte;if(!n){console.error(`❌ Impossible d'afficher le badge : aucun matricule.`,t);return}let r=0,i=0,a=0;function o(){let t=r+i+a;if(console.log(`🔴 Badge notifications :`,t),t<=0){e.style.display=`none`,e.textContent=``;return}e.style.display=`flex`,e.textContent=t}db.collection(`friendRequests`).where(`to`,`==`,n).where(`status`,`==`,`pending`).onSnapshot(e=>{r=e.size,o()},e=>{console.error(`❌ Badge demandes amis :`,e)}),db.collection(`notifications`).where(`to`,`==`,n).where(`seen`,`==`,!1).onSnapshot(e=>{i=e.size,o()},e=>{console.error(`❌ Badge notifications :`,e)}),db.collection(`restaurantNotifications`).where(`to`,`==`,n).where(`seen`,`==`,!1).onSnapshot(e=>{a=e.size,o()},e=>{console.error(`❌ Badge restaurant :`,e)})}e(),t();