import"../../../modulepreload-polyfill-Dezn_h7o.js";import{_ as e,b as t,g as n,h as r,l as i,m as a,x as o,y as s}from"../../../authService-DX3gg-GL.js";import{t as c}from"../../../authGuard-ykA3SEVG.js";import{t as l}from"../../../sidebar-BnpGu-uR.js";import{t as u}from"../../../referentielService-BQbj88SN.js";var d=[`Stock de matériels`,`Personnel adéquat en descente`,`Intervention nécessitant une pièce`,`Intervention reportée`,`Intervention nécessitant une intervention externe`,`Autre`];function f(e){if(!e)return`-`;let t=String(e).trim(),n=t.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(n)return`${n[3]}/${n[2]}/${n[1]}`;let r=new Date(e);return Number.isNaN(r.getTime())?t:new Intl.DateTimeFormat(`fr-FR`).format(r)}c(`agent`,async({profile:c,permissions:p,affectation:m,posteId:h,anneeAcademique:g,lectureSeule:_})=>{if(console.log(`🔐 MODE LECTURE SEULE =`,_),console.log(`🏭 Module Atelier chargé`),h!==`chef_atelier`){console.warn(`⛔ Accès refusé : poste incorrect.`);return}await l(c);let v=document.getElementById(`page-site`);v&&(v.textContent=c?.site?` ${c.site}`:``);let y=document.getElementById(`bons-body`);if(!y){console.error(`❌ bons-body introuvable.`);return}let b=c?.site;if(!b){y.innerHTML=`
                <tr class="empty-row">

                    <td colspan="13">
                        Impossible de déterminer
                        le site de l'Atelier.
                    </td>

                </tr>
            `;return}let x=new Map;try{let e=await u();x=new Map(e.map(e=>[e.id,e.nom])),console.log(`📚 Types de travaux chargés :`,e)}catch(e){console.error(`❌ Erreur chargement référentiel des types :`,e)}a(r(s(i,`bons`),e(`site`,`==`,b)),e=>{console.log(`📋 Bons du site :`,e.size);let t=e.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.supprime!==!0&&(e.statut===`envoye`||e.statut===`recu`||e.statut===`en_cours`));if(t.sort((e,t)=>{let n=String(e.date||``);return String(t.date||``).localeCompare(n)}),y.innerHTML=``,t.length===0){y.innerHTML=`
                        <tr class="empty-row">

                            <td colspan="13">
                                Aucun bon de travail reçu.
                            </td>

                        </tr>
                    `;return}t.forEach(e=>{let t=x.get(e.type)||e.type||`-`,n=f(e.date),r=`-`,i=``;e.statut===`envoye`?(r=`Reçu`,i=`statut-envoye`):e.statut===`recu`?(r=`Reçu`,i=`statut-recu`):e.statut===`en_cours`&&(r=`En cours`,i=`statut-en-cours`);let a=``;_?a=`
                                <span class="lecture-seule">
                                    Lecture seule
                                </span>
                            `:e.statut===`envoye`?a=`
                                <div class="bon-actions">

                                    <button
                                        type="button"
                                        class="bon-action-btn bon-action-recu"
                                        data-id="${e.id}"
                                        data-action="recu"
                                    >
                                        Reçu
                                    </button>

                                </div>
                            `:e.statut===`recu`?a=`
                                <div class="bon-actions">

                                    <button
                                        type="button"
                                        class="bon-action-btn bon-action-encours"
                                        data-id="${e.id}"
                                        data-action="encours"
                                    >
                                        En cours
                                    </button>

                                </div>
                            `:e.statut===`en_cours`&&(a=`
                                <div class="bon-actions">

                                    <button
                                        type="button"
                                        class="bon-action-btn bon-action-termine"
                                        data-id="${e.id}"
                                        data-action="termine"
                                    >
                                        Terminée
                                    </button>

                                    <button
                                        type="button"
                                        class="bon-action-btn bon-action-nontermine"
                                        data-id="${e.id}"
                                        data-action="nontermine"
                                    >
                                        Non terminée
                                    </button>

                                </div>
                            `),y.innerHTML+=`

                            <tr>

                                <!-- 1 — ID -->

                                <td>
                                    ${e.id||`-`}
                                </td>


                                <!-- 2 — DATE -->

                                <td>
                                    ${n}
                                </td>


                                <!-- 3 — TYPE -->

                                <td>
                                    ${t}
                                </td>


                                <!-- 4 — PAVILLON -->

                                <td>
                                    ${e.pavillon||`-`}
                                </td>


                                <!-- 5 — LOCALISATION -->

                                <td>
                                    ${e.localisation||`-`}
                                </td>


                                <!-- 6 — NIVEAU -->

                                <td>
                                    ${e.niveau||`-`}
                                </td>


                                <!-- 7 — CÔTÉ -->

                                <td>
                                    ${e.cote||`-`}
                                </td>


                                <!-- 8 — CHAMBRE -->

                                <td>
                                    ${e.chambre||`-`}
                                </td>


                                <!-- 9 — TOILETTE -->

                                <td>
                                    ${e.toilette||`-`}
                                </td>


                                <!-- 10 — DESCRIPTION -->

                                <td>
                                    ${e.description||`-`}
                                </td>


                                <!-- 11 — PAR -->

                                <td>
                                    ${e.par||e.agentNom||e.agentMatricule||`-`}
                                </td>


                                <!-- 12 — STATUT -->

                                <td>

                                    <span
                                        class="statut-badge ${i}"
                                    >
                                        ${r}
                                    </span>

                                </td>


                                <!-- 13 — ACTION -->

                                <td>
                                    ${a}
                                </td>

                            </tr>

                        `})},e=>{console.error(`❌ Erreur chargement des bons :`,e),y.innerHTML=`

                    <tr class="empty-row">

                        <td colspan="13">
                            Impossible de charger
                            les bons de travail.
                        </td>

                    </tr>

                `}),y.addEventListener(`click`,async e=>{if(_){console.warn(`🔒 Action bloquée : lecture seule.`);return}let r=e.target.closest(`.bon-action-btn`);if(!r)return;let a=r.dataset.id,s=r.dataset.action;if(!(!a||!s)&&!r.disabled){r.disabled=!0;try{if(s===`recu`)await n(t(i,`bons`,a),{statut:`recu`,cause:``,atelierAgentMatricule:c.matricule||``,atelierAgentNom:`${c.prenom||``} ${c.nom||``}`.trim(),atelierReceptionAt:o()});else if(s===`encours`)await n(t(i,`bons`,a),{statut:`en_cours`,cause:``,atelierAgentMatricule:c.matricule||``,atelierAgentNom:`${c.prenom||``} ${c.nom||``}`.trim(),atelierPriseEnChargeAt:o()});else if(s===`termine`)await n(t(i,`bons`,a),{statut:`termine`,cause:``,atelierAgentMatricule:c.matricule||``,atelierAgentNom:`${c.prenom||``} ${c.nom||``}`.trim(),atelierTermineAt:o()});else if(s===`nontermine`){let e=prompt(`Sélectionnez la cause du bon non terminé :

`+d.map((e,t)=>`${t+1}. ${e}`).join(`
`));if(e===null){r.disabled=!1;return}let s=Number(e.trim())-1;if(!Number.isInteger(s)||s<0||s>=d.length){alert(`Choix invalide.`),r.disabled=!1;return}let l=d[s];await n(t(i,`bons`,a),{statut:`non_termine`,cause:l,atelierAgentMatricule:c.matricule||``,atelierAgentNom:`${c.prenom||``} ${c.nom||``}`.trim(),atelierNonTermineAt:o()})}}catch(e){console.error(`❌ Erreur traitement du bon :`,e),r.disabled=!1,alert(`Impossible de modifier le bon.`)}}}),console.log(`🏭 Module Atelier prêt.`),document.body.classList.add(`loaded`),document.getElementById(`app-loader`)?.classList.add(`hidden`)});