import"../../../modulepreload-polyfill-Dezn_h7o.js";function e(){let e=document.getElementById(`notifications-list`);if(!e)return;let t=JSON.parse(localStorage.getItem(`user`));if(!t)return;let n=[];function r(t=`all`){e.innerHTML=``;let r=[...n];if(t!==`all`&&(r=r.filter(e=>e.type===t)),r.sort((e,t)=>t.date-e.date),r.length===0){e.innerHTML=`
                <div class="notification-empty">
                    Aucune notification
                </div>
            `;return}r.forEach(t=>{let n=new Date(t.date).toLocaleString(`fr-FR`);e.innerHTML+=`

                <div class="notification-card">

                    <div class="notification-icon ${t.iconBg||``}">

                        ${t.source===`friends`?`
                            <img
                                src="${t.avatar||``}"
                                class="notification-avatar"
                                alt="Avatar">
                            `:`
                            <i class="${t.icon}"></i>
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

            `})}db.collection(`friendRequests`).where(`to`,`==`,t.carte).onSnapshot(e=>{n=n.filter(e=>e.source!==`friends`),e.forEach(e=>{let t=e.data();n.push({id:e.id,source:`friends`,type:`amis`,title:`Amis`,text:t.status===`pending`?`${t.fromNom} souhaite vous ajouter`:t.message||`Vous êtes désormais amis`,date:t.date||Date.now(),avatar:t.fromAvatar||``})}),r()}),db.collection(`notifications`).where(`to`,`==`,t.carte).onSnapshot(e=>{n=n.filter(e=>e.source!==`system`),e.forEach(e=>{let t=e.data();n.push({id:e.id,source:`system`,type:t.type,title:t.title,text:t.text,date:t.date||Date.now(),icon:`fa-solid fa-bell`,iconBg:`blue-bg`})}),r()}),db.collection(`restaurantNotifications`).where(`to`,`==`,t.carte).onSnapshot(e=>{n=n.filter(e=>e.source!==`restaurant`),e.forEach(e=>{let t=e.data();n.push({id:e.id,source:`restaurant`,type:`restaurant`,title:t.title,text:t.text,date:t.date||Date.now(),icon:`fa-solid fa-utensils`,iconBg:`purple-bg`})}),r()}),document.querySelectorAll(`.category-pill`).forEach(e=>{e.addEventListener(`click`,()=>{document.querySelectorAll(`.category-pill`).forEach(e=>{e.classList.remove(`active-pill`)}),e.classList.add(`active-pill`);let t=e.textContent.toLowerCase().trim();t===`tout`&&(t=`all`),r(t)})})}function t(){let e=document.getElementById(`notification-badge`);if(!e)return;let t=JSON.parse(localStorage.getItem(`user`));if(!t)return;let n=0,r=0,i=0;function a(){let t=n+r+i;if(t<=0){e.style.display=`none`,e.textContent=``;return}e.style.display=`flex`,e.textContent=t}db.collection(`friendRequests`).where(`to`,`==`,t.carte).where(`status`,`==`,`pending`).onSnapshot(e=>{n=e.size,a()}),db.collection(`notifications`).where(`to`,`==`,t.carte).where(`seen`,`==`,!1).onSnapshot(e=>{r=e.size,a()}),db.collection(`restaurantNotifications`).where(`to`,`==`,t.carte).where(`seen`,`==`,!1).onSnapshot(e=>{i=e.size,a()})}e(),t();