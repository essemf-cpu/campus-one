import"../../../modulepreload-polyfill-Dezn_h7o.js";import{_ as e,b as t,g as n,m as r,u as i,v as a,y as o}from"../../../authService-DlvHUxoR.js";import{t as s}from"../../../authGuard-CR_v3-ld.js";import{t as c}from"../../../sidebar-CvJdERsX.js";import{t as l}from"../../../referentielService-DNYTMZbL.js";s(`agent`,async({profile:s,permissions:u,affectation:d,posteId:f,anneeAcademique:p,lectureSeule:m})=>{if(console.log(`🔐 MODE LECTURE SEULE =`,m),console.log(`1 - requireRole OK`),s.service!==`Service de l'Hébergement`)return;console.log(`2 - service OK`),await c(s),console.log(`3 - sidebar chargée`),document.getElementById(`page-title`).textContent=s.affectation;let h=document.getElementById(`type`);if(h){console.log(`4 - select trouvé`);let e=await l();console.log(`5 - types récupérés`,e),h.innerHTML=``,e.forEach(e=>{h.innerHTML+=`

                        <option value="${e.id}">
                            ${e.nom}
                        </option>

                    `})}let g=document.getElementById(`demandes-body`);if(!g){console.error(`❌ demandes-body introuvable`);return}let _=s.site,v=s.affectation?.replace(/^Pavillon\s+/i,``).trim();if(console.log(`🏢 Site agent :`,_),console.log(`🏠 Pavillon agent :`,v),!_||!v){g.innerHTML=`

                <tr class="empty-row">

                    <td colspan="10">

                        Impossible de déterminer
                        le site ou le pavillon.

                    </td>

                </tr>

            `;return}let y=await l(),b=new Map(y.map(e=>[e.id,e.nom]));r(n(o(i,`demandes_etudiants`),a(`site`,`==`,_),a(`pavillon`,`==`,v),a(`anneeAcademique`,`==`,p)),e=>{console.log(`📋 Demandes mises à jour :`,e.size),g.innerHTML=``;let t=0;e.forEach(e=>{let n=e.data();if(n.statut&&n.statut!==`en_attente`&&n.statut!==`en_cours`)return;t++;let r=`${n.prenom||``} ${n.nom||``}`.trim(),i=``;!m&&(n.statut||`en_attente`)===`en_attente`?i=`

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

                    `:!m&&n.statut===`en_cours`&&(i=`

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

                    `),g.innerHTML+=`

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
                           ${b.get(n.type)||`-`}
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

                `}),t===0&&(g.innerHTML=`

                <tr class="empty-row">

                    <td colspan="7">

                        Aucune demande pour le moment

                    </td>

                </tr>

            `)},e=>{console.error(`❌ Erreur écoute demandes :`,e),g.innerHTML=`

            <tr class="empty-row">

                <td colspan="7">

                    Impossible de charger
                    les demandes.

                </td>

            </tr>

        `}),g.addEventListener(`click`,async n=>{if(m){console.warn(`🔒 Action bloquée : session en lecture seule.`);return}let r=n.target.closest(`.demande-action-btn`);if(!r)return;let a=r.dataset.id,o=r.dataset.action;if(!(!a||!o)&&!r.disabled){r.disabled=!0;try{o===`encours`?await e(t(i,`demandes_etudiants`,a),{statut:`en_cours`,cause:``,feedbackAutorise:!1,notificationVue:!0}):o===`forclos`?await e(t(i,`demandes_etudiants`,a),{statut:`forclos`,cause:`Votre demande a déjà été formulée par un(e) de vos camarades / colocataires.`,feedbackAutorise:!1,notificationVue:!0}):o===`termine`?await e(t(i,`demandes_etudiants`,a),{statut:`termine`,cause:``,feedbackAutorise:!0}):o===`nontermine`&&await e(t(i,`demandes_etudiants`,a),{statut:`non_termine`,cause:`Stock de matériel, merci de formuler votre demande dans les jours à venir.`,feedbackAutorise:!1})}catch(e){console.error(`❌ Erreur action demande :`,e),r.disabled=!1,alert(`Impossible de modifier la demande.`)}}}),console.log(`6 - page prête`),document.body.classList.add(`loaded`)});