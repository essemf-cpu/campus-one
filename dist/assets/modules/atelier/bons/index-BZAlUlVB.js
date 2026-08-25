import"../../../modulepreload-polyfill-Dezn_h7o.js";import{_ as e,h as t,l as n,m as r,y as i}from"../../../authService-DX3gg-GL.js";import{t as a}from"../../../authGuard-ykA3SEVG.js";import{t as o}from"../../../sidebar-BnpGu-uR.js";import{t as s}from"../../../referentielService-BQbj88SN.js";import{i as c,t as l}from"../../../bonsService-Cq5syuSe.js";function u(e){if(!e)return`-`;let t;if(e&&typeof e.toDate==`function`)t=e.toDate();else if(e instanceof Date)t=e;else{let n=String(e).trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);if(n){let e=n[3],t=n[2],r=n[1];return n[4]===void 0||n[5]===void 0?`${e}/${t}/${r}`:`${e}/${t}/${r} à ${n[4]}:${n[5]}`}t=new Date(e)}return!t||Number.isNaN(t.getTime())?String(e):`${new Intl.DateTimeFormat(`fr-FR`,{day:`2-digit`,month:`2-digit`,year:`numeric`}).format(t)} à ${new Intl.DateTimeFormat(`fr-FR`,{hour:`2-digit`,minute:`2-digit`,hour12:!1}).format(t)}`}function d(e,t){return t.get(e.type)||e.type||`-`}a(`agent`,async({profile:a,permissions:f,affectation:p,posteId:m,anneeAcademique:h,lectureSeule:g})=>{if(console.log(`🔐 MODE LECTURE SEULE =`,g),console.log(`🏭 Module Atelier chargé`),console.log(`👤 profile =`,a),console.log(`🏭 posteId =`,m),m!==`chef_atelier`){console.warn(`⛔ Accès refusé : poste incorrect.`),document.body.classList.add(`loaded`),document.getElementById(`app-loader`)?.classList.add(`hidden`);return}await o({...a,permissions:f,affectation:p?.affectation||a?.affectation||``,posteId:m,anneeAcademique:h,lectureSeule:g});let _=document.getElementById(`page-site`);_&&(_.textContent=a?.site?` ${a.site}`:``);let v=document.getElementById(`bons-body`);if(!v){console.error(`❌ bons-body introuvable.`),document.body.classList.add(`loaded`);return}let y=a?.site;if(!y){v.innerHTML=`
                <tr class="empty-row">

                    <td colspan="12">
                        Impossible de déterminer
                        le site de l'Atelier.
                    </td>

                </tr>
            `,document.body.classList.add(`loaded`);return}let b=new Map;try{let e=await s();b=new Map(e.map(e=>[e.id,e.nom])),console.log(`📚 Types de travaux chargés :`,e)}catch(e){console.error(`❌ Erreur chargement référentiel :`,e)}let x=r(t(i(n,`bons`),e(`site`,`==`,y)),e=>{console.log(`📋 Bons du site :`,e.size);let t=e.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.supprime===!0||e.archive===!0?!1:e.statut===l.ENVOYE||e.statut===l.RECU||e.statut===l.EN_COURS);if(t.sort((e,t)=>{let n=String(e.date||``);return String(t.date||``).localeCompare(n)}),v.innerHTML=``,t.length===0){v.innerHTML=`
                            <tr class="empty-row">

                                <td colspan="12">
                                    Aucun bon de travail reçu.
                                </td>

                            </tr>
                        `;return}t.forEach(e=>{let t=d(e,b),n=u(e.date),r=`-`,i=``;e.statut===l.ENVOYE?(r=`Reçu`,i=`statut-envoye`):e.statut===l.RECU?(r=`Reçu`,i=`statut-recu`):e.statut===l.EN_COURS&&(r=`En cours`,i=`statut-en-cours`);let a=``;g?a=`
                                    <span class="lecture-seule">
                                        Lecture seule
                                    </span>
                                `:e.statut===l.ENVOYE?a=`
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
                                `:e.statut===l.RECU?a=`
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
                                `:e.statut===l.EN_COURS&&(a=`
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
                                `),v.innerHTML+=`

                                <tr>

                                    <!-- ID -->

                                    <td>
                                        ${e.id||`-`}
                                    </td>


                                    <!-- DATE -->

                                    <td>
                                        ${n}
                                    </td>


                                    <!-- TYPE -->

                                    <td>
                                        ${t}
                                    </td>


                                    <!-- PAVILLON -->

                                    <td>
                                        ${e.pavillon||`-`}
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


                                    <!-- DESCRIPTION -->

                                    <td>
                                        ${e.description||`-`}
                                    </td>


                                    <!-- PAR -->

                                    <td>
                                        ${e.par||e.agentNom||e.agentMatricule||`-`}
                                    </td>


                                    <!-- STATUT -->

                                    <td>

                                        <span
                                            class="statut-badge ${i}"
                                        >
                                            ${r}
                                        </span>

                                    </td>


                                    <!-- ACTION -->

                                    <td>
                                        ${a}
                                    </td>

                                </tr>

                            `})},e=>{console.error(`❌ Erreur chargement des bons :`,e),v.innerHTML=`

                        <tr class="empty-row">

                            <td colspan="12">

                                Impossible de charger
                                les bons de travail.

                            </td>

                        </tr>

                    `});v.addEventListener(`click`,async e=>{if(g){console.warn(`🔒 Action bloquée : lecture seule.`);return}let t=e.target.closest(`.bon-action-btn`);if(!t)return;let n=t.dataset.id,r=t.dataset.action;if(!(!n||!r)&&!t.disabled){t.disabled=!0;try{if(r===`recu`)await c(n,l.RECU,``,a);else if(r===`encours`)await c(n,l.EN_COURS,``,a);else if(r===`termine`)await c(n,l.TERMINE,``,a);else if(r===`nontermine`){let e=document.getElementById(`cause-modal`),r=document.getElementById(`cause-select`),i=document.getElementById(`autre-cause-container`),o=document.getElementById(`autre-cause`),s=document.getElementById(`confirm-cause`),u=document.getElementById(`cancel-cause`),d=document.getElementById(`close-cause-modal`);if(!e||!r||!s){console.error(`❌ Modale de cause introuvable.`),t.disabled=!1;return}r.value=``,o&&(o.value=``),i&&(i.hidden=!0),e.hidden=!1;let f=()=>{e.hidden=!0,t.disabled=!1,r.value=``,o&&(o.value=``),i&&(i.hidden=!0),r.removeEventListener(`change`,p)},p=()=>{i&&(i.hidden=r.value!==`Autre`),r.value===`Autre`&&o?.focus()};r.addEventListener(`change`,p),u?.addEventListener(`click`,f,{once:!0}),d?.addEventListener(`click`,f,{once:!0}),s.onclick=async()=>{if(!r.value){alert(`Veuillez sélectionner une cause.`);return}let i=r.value;if(i===`Autre`&&(i=o?.value?.trim()||``,!i)){alert(`Veuillez préciser la cause.`),o?.focus();return}s.disabled=!0;try{await c(n,l.NON_TERMINE,i,a),e.hidden=!0,t.disabled=!1}catch(e){console.error(`❌ Erreur bon non terminé :`,e),alert(`Impossible d'enregistrer la cause.`),s.disabled=!1,t.disabled=!1}}}}catch(e){console.error(`❌ Erreur traitement du bon :`,e),t.disabled=!1,alert(`Impossible de modifier le bon.`)}}}),window.addEventListener(`beforeunload`,()=>{typeof x==`function`&&x()}),console.log(`🏭 Module Atelier prêt.`),document.body.classList.add(`loaded`),document.getElementById(`app-loader`)?.classList.add(`hidden`)});