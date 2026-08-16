import"../../../modulepreload-polyfill-Dezn_h7o.js";import{_ as e,b as t,g as n,l as r,m as i,v as a,y as o}from"../../../authService-DTiP6P1g.js";import{t as s}from"../../../authGuard-BnlEFo-L.js";import{t as c}from"../../../sidebar-KGnYkfIK.js";import{t as l}from"../../../referentielService-Vwd3uLQj.js";s(`agent`,async({profile:s})=>{if(console.log(`1 - requireRole OK`),s.service!==`Service de l'Hébergement`)return;console.log(`2 - service OK`),await c(s),console.log(`3 - sidebar chargée`),document.getElementById(`page-title`).textContent=s.affectation;let u=document.getElementById(`type`);if(u){console.log(`4 - select trouvé`);let e=await l();console.log(`5 - types récupérés`,e),u.innerHTML=``,e.forEach(e=>{u.innerHTML+=`

                        <option value="${e.id}">
                            ${e.nom}
                        </option>

                    `})}let d=document.getElementById(`demandes-body`);if(!d){console.error(`❌ demandes-body introuvable`);return}let f=s.site,p=s.affectation?.replace(/^Pavillon\s+/i,``).trim();if(console.log(`🏢 Site agent :`,f),console.log(`🏠 Pavillon agent :`,p),!f||!p){d.innerHTML=`

                <tr class="empty-row">

                    <td colspan="10">

                        Impossible de déterminer
                        le site ou le pavillon.

                    </td>

                </tr>

            `;return}let m=await l(),h=new Map(m.map(e=>[e.id,e.nom]));i(n(o(r,`demandes_etudiants`),a(`site`,`==`,f),a(`pavillon`,`==`,p)),e=>{console.log(`📋 Demandes mises à jour :`,e.size),d.innerHTML=``;let t=0;e.forEach(e=>{let n=e.data();if(n.statut&&n.statut!==`en_attente`&&n.statut!==`en_cours`)return;t++;let r=`${n.prenom||``} ${n.nom||``}`.trim(),i=``;(n.statut||`en_attente`)===`en_attente`?i=`

                        <div class="demande-actions">

                            <button
                                type="button"
                                class="demande-action-btn demande-action-encours"
                                data-id="${e.id}"
                                data-action="encours"
                            >
                                En cours
                            </button>

                            <button
                                type="button"
                                class="demande-action-btn demande-action-forclos"
                                data-id="${e.id}"
                                data-action="forclos"
                            >
                                Forclos
                            </button>

                        </div>

                    `:n.statut===`en_cours`&&(i=`

                        <div class="demande-actions">

                            <button
                                type="button"
                                class="demande-action-btn demande-action-termine"
                                data-id="${e.id}"
                                data-action="termine"
                            >
                                Terminée
                            </button>

                            <button
                                type="button"
                                class="demande-action-btn demande-action-nontermine"
                                data-id="${e.id}"
                                data-action="nontermine"
                            >
                                Non terminée
                            </button>

                        </div>

                    `),d.innerHTML+=`

                    <tr>

                        <!-- ÉTUDIANT -->

                        <td>

                            <strong>
                                ${r}
                            </strong>

                        </td>


                        <!-- CARTE -->

                        <td>
                            ${n.matricule||`-`}
                        </td>


                        <!-- CHAMBRE -->

                        <td>
                            ${n.chambre||`-`}
                        </td>


                        <!-- TYPE -->

                        <td>
                           ${h.get(n.type)||`-`}
                        </td>


                        <!-- LOCALISATION -->

                        <td>
                            ${n.localisation||`-`}
                        </td>


                        <!-- PROBLÈME -->

                        <td>
                            ${n.probleme||`-`}
                        </td>


                        <!-- ACTION -->

                        <td>
                            ${i}
                        </td>

                    </tr>

                `}),t===0&&(d.innerHTML=`

                <tr class="empty-row">

                    <td colspan="7">

                        Aucune demande pour le moment

                    </td>

                </tr>

            `)},e=>{console.error(`❌ Erreur écoute demandes :`,e),d.innerHTML=`

            <tr class="empty-row">

                <td colspan="7">

                    Impossible de charger
                    les demandes.

                </td>

            </tr>

        `}),d.addEventListener(`click`,async n=>{let i=n.target.closest(`.demande-action-btn`);if(!i)return;let a=i.dataset.id,o=i.dataset.action;if(!(!a||!o)&&!i.disabled){i.disabled=!0;try{o===`encours`?await e(t(r,`demandes_etudiants`,a),{statut:`en_cours`,cause:``,feedbackAutorise:!1,notificationVue:!0}):o===`forclos`?await e(t(r,`demandes_etudiants`,a),{statut:`forclos`,cause:`Votre demande a déjà été formulée par un(e) de vos camarades / colocataires.`,feedbackAutorise:!1,notificationVue:!0}):o===`termine`?await e(t(r,`demandes_etudiants`,a),{statut:`termine`,cause:``,feedbackAutorise:!0}):o===`nontermine`&&await e(t(r,`demandes_etudiants`,a),{statut:`non_termine`,cause:`Stock de matériel, merci de formuler votre demande dans les jours à venir.`,feedbackAutorise:!1})}catch(e){console.error(`❌ Erreur action demande :`,e),i.disabled=!1,alert(`Impossible de modifier la demande.`)}}}),console.log(`6 - page prête`),document.body.classList.add(`loaded`)});