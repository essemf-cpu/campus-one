import"../../../modulepreload-polyfill-Dezn_h7o.js";import{_ as e,b as t,g as n,h as r,l as i,m as a,y as o}from"../../../authService-DX3gg-GL.js";import{t as s}from"../../../authGuard-ykA3SEVG.js";import{t as c}from"../../../referentielService-BQbj88SN.js";import{t as l}from"../../../sidebar-n5m1VV9L.js";import{n as u,r as d,t as f}from"../../../bonsService-BymP7wJm.js";s(`agent`,async({profile:s,permissions:p,affectation:m,posteId:h,anneeAcademique:g,lectureSeule:_})=>{if(console.log(`🔐 MODE LECTURE SEULE =`,_),console.log(`1 - requireRole OK`),s.service!==`Service de l'Hébergement`)return;console.log(`2 - service OK`),await l(s),console.log(`3 - sidebar chargée`),document.getElementById(`page-title`).textContent=s.affectation;let v=document.getElementById(`type`);if(v){console.log(`4 - select trouvé`);let e=await c();console.log(`5 - types récupérés`,e),v.innerHTML=``,e.forEach(e=>{v.innerHTML+=`
                        <option value="${e.id}">
                            ${e.nom}
                        </option>
                    `})}let y=document.getElementById(`demandes-body`);if(!y){console.error(`❌ demandes-body introuvable`);return}let b=s.site,x=s.affectation?.replace(/^Pavillon\s+/i,``).trim();if(console.log(`🏢 Site agent :`,b),console.log(`🏠 Pavillon agent :`,x),!b||!x){y.innerHTML=`
                <tr class="empty-row">
                    <td colspan="9">
                        Impossible de déterminer
                        le site ou le pavillon.
                    </td>
                </tr>
            `;return}let S=await c(),C=new Map(S.map(e=>[e.id,e.nom])),w=r(o(i,`demandes_etudiants`),e(`site`,`==`,b),e(`pavillon`,`==`,x),e(`anneeAcademique`,`==`,g)),T=new Map;a(w,e=>{console.log(`📋 Demandes mises à jour :`,e.size),y.innerHTML=``;let t=0;e.forEach(e=>{let n=e.data(),r=e.id;if(T.set(r,n),n.statut&&n.statut!==`en_attente`&&n.statut!==`en_cours`)return;t++;let i=`${n.prenom||``} ${n.nom||``}`.trim(),a=``;!_&&(n.statut||`en_attente`)===`en_attente`?a=`

                                <div class="demande-actions">

                                    <button
                                        type="button"
                                        class="demande-action-btn demande-action-encours"
                                        data-id="${r}"
                                        data-action="encours"
                                    >
                                        En cours
                                    </button>

                                    <button
                                        type="button"
                                        class="demande-action-btn demande-action-forclos"
                                        data-id="${r}"
                                        data-action="forclos"
                                    >
                                        Forclos
                                    </button>

                                    <button
                                        type="button"
                                        class="demande-action-btn demande-action-bon"
                                        data-id="${r}"
                                        data-action="bon"
                                    >
                                        Rédiger un bon
                                    </button>

                                </div>

                            `:!_&&n.statut===`en_cours`&&(a=`

                                <div class="demande-actions">

                                    <button
                                        type="button"
                                        class="demande-action-btn demande-action-termine"
                                        data-id="${r}"
                                        data-action="termine"
                                    >
                                        Terminée
                                    </button>

                                    <button
                                        type="button"
                                        class="demande-action-btn demande-action-nontermine"
                                        data-id="${r}"
                                        data-action="nontermine"
                                    >
                                        Non terminée
                                    </button>

                                    <button
                                        type="button"
                                        class="demande-action-btn demande-action-bon"
                                        data-id="${r}"
                                        data-action="bon"
                                    >
                                        Rédiger un bon
                                    </button>

                                </div>

                            `),y.innerHTML+=`

                            <tr>

                                <!-- ÉTUDIANT -->

                                <td>
                                    <strong>
                                        ${i}
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
                                    ${C.get(n.type)||`-`}
                                </td>


                                <!-- LOCALISATION -->

                                <td>
                                    ${n.localisation||`-`}
                                </td>


                                <!-- NIVEAU -->

                                <td>
                                    ${n.niveau||`-`}
                                </td>


                                <!-- CÔTÉ -->

                                <td>
                                    ${n.cote||`-`}
                                </td>


                                <!-- PROBLÈME -->

                                <td>
                                    ${n.probleme||`-`}
                                </td>


                                <!-- ACTION -->

                                <td>
                                    ${a}
                                </td>

                            </tr>

                        `}),t===0&&(y.innerHTML=`

                        <tr class="empty-row">

                            <td colspan="9">

                                Aucune demande pour le moment

                            </td>

                        </tr>

                    `)},e=>{console.error(`❌ Erreur écoute demandes :`,e),y.innerHTML=`

                    <tr class="empty-row">

                        <td colspan="9">

                            Impossible de charger
                            les demandes.

                        </td>

                    </tr>

                `});let E=document.getElementById(`bonForm`);E?.addEventListener(`submit`,async e=>{if(e.preventDefault(),!_)try{let e=document.getElementById(`date`)?.value,t=document.getElementById(`type`)?.value,n=document.getElementById(`description`)?.value.trim(),r=document.getElementById(`chambre`)?.value.trim(),i=document.getElementById(`toilette`)?.value.trim(),a=document.getElementById(`localisation`)?.value.trim(),o=document.getElementById(`niveau`)?.value.trim(),c=document.getElementById(`cote`)?.value.trim();await f({date:e,site:s.site,pavillon:s.affectation?.replace(/^Pavillon\s+/i,``).trim(),type:t,description:n,chambre:r,toilette:i,localisation:a,niveau:o,cote:c,demandeId:E.dataset.demandeId||null,agentMatricule:s.matricule,agentNom:`${s.prenom||``} ${s.nom||``}`.trim()}),alert(`Bon envoyé avec succès.`),E.reset(),delete E.dataset.demandeId;let l=document.getElementById(`localisation`),u=document.getElementById(`niveau`),d=document.getElementById(`cote`);l&&(l.value=``),u&&(u.value=``),d&&(d.value=``),await O()}catch(e){console.error(`❌ Création du bon :`,e),alert(`Impossible de créer le bon.`)}}),y.addEventListener(`click`,async e=>{if(_){console.warn(`🔒 Action bloquée : session en lecture seule.`);return}let r=e.target.closest(`.demande-action-btn`);if(!r)return;let a=r.dataset.id,o=r.dataset.action;if(o===`bon`){let e=T.get(a);if(!e){alert(`Impossible de retrouver la demande.`);return}let t=document.getElementById(`date`);t&&(t.value=new Date().toISOString().split(`T`)[0]);let n=document.getElementById(`type`);n&&(n.value=e.type||``);let r=document.getElementById(`description`);r&&(r.value=e.probleme||``);let i=document.getElementById(`chambre`);i&&(i.value=String(e.localisation||``).trim().toLowerCase()===`chambre`&&e.chambre||``);let o=document.getElementById(`localisation`);o&&(o.value=e.localisation||``);let s=document.getElementById(`niveau`);s&&(s.value=e.niveau||e.etage||``);let c=document.getElementById(`cote`);c&&(c.value=e.cote||``);let l=document.getElementById(`toilette`);l&&(l.value=e.toilette||``),E&&(E.dataset.demandeId=a),document.querySelector(`.nouveau-card`)?.scrollIntoView({behavior:`smooth`,block:`start`});return}if(!(!a||!o)&&!r.disabled){r.disabled=!0;try{o===`encours`?await n(t(i,`demandes_etudiants`,a),{statut:`en_cours`,cause:``,feedbackAutorise:!1,notificationVue:!0}):o===`forclos`?await n(t(i,`demandes_etudiants`,a),{statut:`forclos`,cause:`Votre demande a déjà été formulée par un(e) de vos camarades / colocataires.`,feedbackAutorise:!1,notificationVue:!0}):o===`termine`?await n(t(i,`demandes_etudiants`,a),{statut:`termine`,cause:``,feedbackAutorise:!0}):o===`nontermine`&&await n(t(i,`demandes_etudiants`,a),{statut:`non_termine`,cause:`Stock de matériel, merci de formuler votre demande dans les jours à venir.`,feedbackAutorise:!1})}catch(e){console.error(`❌ Erreur action demande :`,e),r.disabled=!1,alert(`Impossible de modifier la demande.`)}}});let D=document.getElementById(`bons-body`);async function O(){if(!D){console.error(`❌ bons-body introuvable`);return}try{let e=await d({site:b,pavillon:x}),t=new Date().toISOString().split(`T`)[0],n=e.filter(e=>e.date===t);if(D.innerHTML=``,n.length===0){D.innerHTML=`

                        <tr class="empty-row">

                            <td colspan="13">

                                Aucun bon aujourd'hui

                            </td>

                        </tr>

                    `;return}n.forEach(e=>{let t=!_&&e.statut===`envoye`?`
                            <button
                                type="button"
                                class="bon-delete-btn"
                                data-bon-id="${e.id}"
                            >
                                Supprimer
                            </button>
                        `:``;D.innerHTML+=`

                            <tr>

                                <!-- ID -->

                                <td>
                                    ${e.id||`-`}
                                </td>


                                <!-- DATE -->

                                <td>
                                    ${e.date||`-`}
                                </td>


                                <!-- TYPE -->

                                <td>
                                    ${C.get(e.type)||`-`}
                                </td>


                                <!-- LOCALISATION -->

                                <td>
                                    ${e.localisation||`-`}
                                </td>


                                <!-- NIVEAU -->

                                <td>
                                    ${e.niveau||`-`}
                                </td>


                                <!-- CÔTÉ -->

                                <td>
                                    ${e.cote||`-`}
                                </td>


                                <!-- CHAMBRE -->

                                <td>
                                    ${e.chambre||`-`}
                                </td>


                                <!-- TOILETTE -->

                                <td>
                                    ${e.toilette||`-`}
                                </td>


                                <!-- DESCRIPTION -->

                                <td>
                                    ${e.description||`-`}
                                </td>

                                <!-- PAR -->

                                <td>
                                    ${e.par||`-`}
                                </td>


                                <!-- SUPPRESSION -->

                                <td>
                                    ${t}
                                </td>


                                <!-- STATUT -->

                                <td>
                                    ${e.statut||`-`}
                                </td>


                                <!-- CAUSE -->

                                <td>
                                    ${e.cause||`-`}
                                </td>

                            </tr>

                        `}),_||D.querySelectorAll(`.bon-delete-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.bonId;if(t){if(_){console.warn(`🔒 Suppression bloquée : session en lecture seule.`);return}if(!e.disabled&&confirm(`Voulez-vous vraiment supprimer ce bon ?`)){e.disabled=!0;try{await u(t),await O()}catch(t){console.error(`❌ Suppression du bon :`,t),e.disabled=!1,alert(`Impossible de supprimer le bon.`)}}}})})}catch(e){console.error(`❌ Chargement des bons :`,e),D.innerHTML=`

                    <tr class="empty-row">

                        <td colspan="13">

                            Impossible de charger
                            les bons.

                        </td>

                    </tr>

                `}}await O(),console.log(`6 - page prête`),document.body.classList.add(`loaded`)});