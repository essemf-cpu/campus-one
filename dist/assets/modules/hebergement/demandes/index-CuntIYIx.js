import"../../../modulepreload-polyfill-Dezn_h7o.js";import{_ as e,b as t,g as n,h as r,l as i,m as a,y as o}from"../../../authService-DX3gg-GL.js";import{t as s}from"../../../authGuard-ykA3SEVG.js";import{t as c}from"../../../referentielService-BQbj88SN.js";import{n as l,r as u}from"../../../bonsService-Cq5syuSe.js";import{t as d}from"../../../sidebar-n5m1VV9L.js";s(`agent`,async({profile:s,permissions:f,affectation:p,posteId:m,anneeAcademique:h,lectureSeule:g})=>{if(console.log(`🔐 MODE LECTURE SEULE =`,g),console.log(`1 - requireRole OK`),s.service!==`Service de l'Hébergement`)return;console.log(`2 - service OK`),await d(s),console.log(`3 - sidebar chargée`),document.getElementById(`page-title`).textContent=s.affectation;let _=document.getElementById(`type`);if(_){console.log(`4 - select trouvé`);let e=await c();console.log(`5 - types récupérés`,e),_.innerHTML=``,e.forEach(e=>{_.innerHTML+=`
                        <option value="${e.id}">
                            ${e.nom}
                        </option>
                    `})}let v=document.getElementById(`demandes-body`);if(!v){console.error(`❌ demandes-body introuvable`);return}let y=s.site,b=s.affectation?.replace(/^Pavillon\s+/i,``).trim();if(console.log(`🏢 Site agent :`,y),console.log(`🏠 Pavillon agent :`,b),!y||!b){v.innerHTML=`
                <tr class="empty-row">
                    <td colspan="9">
                        Impossible de déterminer
                        le site ou le pavillon.
                    </td>
                </tr>
            `;return}let x=await c(),S=new Map(x.map(e=>[e.id,e.nom])),C=r(o(i,`demandes_etudiants`),e(`site`,`==`,y),e(`pavillon`,`==`,b),e(`anneeAcademique`,`==`,h)),w=new Map;a(C,e=>{console.log(`📋 Demandes mises à jour :`,e.size),v.innerHTML=``;let t=0;e.forEach(e=>{let n=e.data(),r=e.id;if(w.set(r,n),n.statut&&n.statut!==`en_attente`&&n.statut!==`en_cours`)return;t++;let i=`${n.prenom||``} ${n.nom||``}`.trim(),a=``;!g&&(n.statut||`en_attente`)===`en_attente`?a=`

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

                            `:!g&&n.statut===`en_cours`&&(a=`

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

                            `),v.innerHTML+=`

                            <tr>

                                <td>
                                    <strong>
                                        ${i}
                                    </strong>
                                </td>

                                <td>
                                    ${n.matricule||`-`}
                                </td>

                                <td>
                                    ${n.chambre||`-`}
                                </td>

                                <td>
                                    ${S.get(n.type)||`-`}
                                </td>

                                <td>
                                    ${n.localisation||`-`}
                                </td>

                                <td>
                                    ${n.niveau||`-`}
                                </td>

                                <td>
                                    ${n.cote||`-`}
                                </td>

                                <td>
                                    ${n.probleme||`-`}
                                </td>

                                <td>
                                    ${a}
                                </td>

                            </tr>

                        `}),t===0&&(v.innerHTML=`

                        <tr class="empty-row">

                            <td colspan="9">

                                Aucune demande pour le moment

                            </td>

                        </tr>

                    `)},e=>{console.error(`❌ Erreur écoute demandes :`,e),v.innerHTML=`

                    <tr class="empty-row">

                        <td colspan="9">

                            Impossible de charger
                            les demandes.

                        </td>

                    </tr>

                `});let T=document.getElementById(`bonForm`);function E(e=new Date){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}function D(){let e=new Date;return e.setDate(e.getDate()+1),E(e)}function O(e){if(!e)return!1;let t=E(),n=D();return e===t||e===n}let k=document.getElementById(`date`);k&&(k.value=E(),k.min=E(),k.max=D()),T?.addEventListener(`submit`,async e=>{if(e.preventDefault(),!g)try{let e=document.getElementById(`date`)?.value;if(!O(e)){alert(`La date du bon doit être aujourd'hui ou demain.`);return}let t=document.getElementById(`type`)?.value,n=document.getElementById(`description`)?.value.trim(),r=document.getElementById(`chambre`)?.value.trim(),i=document.getElementById(`localisation`)?.value.trim(),a=document.getElementById(`niveau`)?.value.trim(),o=document.getElementById(`cote`)?.value.trim();await l({date:e,heureEnvoi:new Date().toLocaleTimeString(`fr-FR`,{hour:`2-digit`,minute:`2-digit`}),site:s.site,pavillon:s.affectation?.replace(/^Pavillon\s+/i,``).trim(),type:t,description:n,chambre:r,localisation:i,niveau:a,cote:o,demandeId:T.dataset.demandeId||null,agentMatricule:s.matricule,agentNom:`${s.prenom||``} ${s.nom||``}`.trim(),anneeAcademique:h}),alert(`Bon envoyé avec succès.`),T.reset(),delete T.dataset.demandeId;let c=document.getElementById(`date`);c&&(c.value=E(),c.min=E(),c.max=D());let u=document.getElementById(`localisation`),d=document.getElementById(`niveau`),f=document.getElementById(`cote`);u&&(u.value=``),d&&(d.value=``),f&&(f.value=``)}catch(e){console.error(`❌ Création du bon :`,e),alert(`Impossible de créer le bon.`)}}),v.addEventListener(`click`,async e=>{if(g){console.warn(`🔒 Action bloquée : session en lecture seule.`);return}let r=e.target.closest(`.demande-action-btn`);if(!r)return;let a=r.dataset.id,o=r.dataset.action;if(o===`bon`){let e=w.get(a);if(!e){alert(`Impossible de retrouver la demande.`);return}let t=document.getElementById(`date`);t&&(t.value=E(),t.min=E(),t.max=D());let n=document.getElementById(`type`);n&&(n.value=e.type||``);let r=document.getElementById(`description`);r&&(r.value=e.probleme||``);let i=document.getElementById(`chambre`);i&&(i.value=String(e.localisation||``).trim().toLowerCase()===`chambre`&&e.chambre||``);let o=document.getElementById(`localisation`);o&&(o.value=e.localisation||``);let s=document.getElementById(`niveau`);s&&(s.value=e.niveau||e.etage||``);let c=document.getElementById(`cote`);c&&(c.value=e.cote||``),T&&(T.dataset.demandeId=a),document.querySelector(`.nouveau-card`)?.scrollIntoView({behavior:`smooth`,block:`start`});return}if(!(!a||!o)&&!r.disabled){r.disabled=!0;try{o===`encours`?await n(t(i,`demandes_etudiants`,a),{statut:`en_cours`,cause:``,feedbackAutorise:!1,notificationVue:!0}):o===`forclos`?await n(t(i,`demandes_etudiants`,a),{statut:`forclos`,cause:`Votre demande a déjà été formulée par un(e) de vos camarades / colocataires.`,feedbackAutorise:!1,notificationVue:!0}):o===`termine`?await n(t(i,`demandes_etudiants`,a),{statut:`termine`,cause:``,feedbackAutorise:!0}):o===`nontermine`&&await n(t(i,`demandes_etudiants`,a),{statut:`non_termine`,cause:`Stock de matériel, merci de formuler votre demande dans les jours à venir.`,feedbackAutorise:!1})}catch(e){console.error(`❌ Erreur action demande :`,e),r.disabled=!1,alert(`Impossible de modifier la demande.`)}}});let A=document.getElementById(`bons-body`);if(!A){console.error(`❌ bons-body introuvable`);return}a(r(o(i,`bons`),e(`site`,`==`,y),e(`pavillon`,`==`,b),e(`anneeAcademique`,`==`,h)),e=>{console.log(`🔄 Bons mis à jour en temps réel :`,e.size);let t=e.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.supprime!==!0),n=E(),r=t.filter(e=>e.date===n);if(r.sort((e,t)=>String(t.date||``).localeCompare(String(e.date||``))),A.innerHTML=``,r.length===0){A.innerHTML=`

                        <tr class="empty-row">

                            <td colspan="12">

                                Aucun bon aujourd'hui

                            </td>

                        </tr>

                    `;return}r.forEach(e=>{let t=!g&&e.statut===`envoye`?`
                                    <button
                                        type="button"
                                        class="bon-delete-btn"
                                        data-bon-id="${e.id}"
                                    >
                                        Supprimer
                                    </button>
                                `:``;A.innerHTML+=`

                            <tr>

                                <td>
                                    ${e.id||`-`}
                                </td>

                                <td>
                                    ${i(e.date)}
                                </td>

                                <td>
                                    ${S.get(e.type)||`-`}
                                </td>

                                <td>
                                    ${e.localisation||`-`}
                                </td>

                                <td>
                                    ${e.niveau||`-`}
                                </td>

                                <td>
                                    ${e.cote||`-`}
                                </td>

                                <td>
                                    ${e.chambre||`-`}
                                </td>

                                <td>
                                    ${e.description||`-`}
                                </td>

                                <td>
                                    ${e.par||`-`}
                                </td>

                                <td>
                                    ${t}
                                </td>

                                <td>
                                    ${e.statut||`-`}
                                </td>

                                <td>
                                    ${e.cause||`-`}
                                </td>

                            </tr>

                        `});function i(e){if(!e)return`-`;let t=new Date(e);return Number.isNaN(t.getTime())?e:new Intl.DateTimeFormat(`fr-FR`,{day:`2-digit`,month:`2-digit`,year:`numeric`,hour:`2-digit`,minute:`2-digit`}).format(t)}g||A.querySelectorAll(`.bon-delete-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.bonId;if(t){if(g){console.warn(`🔒 Suppression bloquée : session en lecture seule.`);return}if(!e.disabled&&confirm(`Voulez-vous vraiment supprimer ce bon ?`)){e.disabled=!0;try{await u(t)}catch(t){console.error(`❌ Suppression du bon :`,t),e.disabled=!1,alert(`Impossible de supprimer le bon.`)}}}})})},e=>{console.error(`❌ Erreur écoute temps réel des bons :`,e),A.innerHTML=`

                    <tr class="empty-row">

                        <td colspan="12">

                            Impossible de charger
                            les bons.

                        </td>

                    </tr>

                `}),console.log(`6 - page prête`),document.body.classList.add(`loaded`)});