import"../../../modulepreload-polyfill-Dezn_h7o.js";import{_ as e,h as t,l as n,m as r,y as i}from"../../../authService-DX3gg-GL.js";import{t as a}from"../../../authGuard-ykA3SEVG.js";import{t as o}from"../../../sidebar-BnpGu-uR.js";import{t as s}from"../../../referentielService-BQbj88SN.js";import"../../../bonsService-Cq5syuSe.js";a(`agent`,async({profile:a,permissions:c,affectation:l,posteId:u,anneeAcademique:d,lectureSeule:f})=>{if(console.log(`1 - requireRole OK`),console.log(`👤 profile :`,a),a.service!==`Service de l'Entretien et de la Maintenance`){console.warn(`⛔ Service incorrect :`,a.service),document.body.classList.add(`loaded`),document.getElementById(`app-loader`)?.classList.add(`hidden`);return}if(console.log(`2 - service OK`),a.posteId!==`chef_atelier`){console.warn(`⛔ Poste incorrect :`,a.posteId),document.body.classList.add(`loaded`),document.getElementById(`app-loader`)?.classList.add(`hidden`);return}console.log(`3 - poste OK`),await o({...a,permissions:c,affectation:l?.affectation||a?.affectation||``,posteId:u,anneeAcademique:d,lectureSeule:f});let p=document.getElementById(`page-title`);p&&(p.textContent=`Atelier ${a.site||``}`.trim());let m=a.site;if(!m){console.error(`❌ Impossible de déterminer le site de l'Atelier.`),document.body.classList.add(`loaded`),document.getElementById(`app-loader`)?.classList.add(`hidden`);return}console.log(`🏭 Site Atelier :`,m);let h=[];try{h=await s()}catch(e){console.error(`❌ Erreur chargement types de travaux :`,e)}let g=new Map(h.map(e=>[e.id,e.nom])),_=document.getElementById(`typeFiltre`);_&&(_.innerHTML=`
                <option value="">
                    Tous les types
                </option>
            `,h.forEach(e=>{_.innerHTML+=`
                        <option value="${e.id}">
                            ${e.nom}
                        </option>
                    `}));let v=document.getElementById(`anneeFiltre`),y=new Date().getFullYear();if(v){v.innerHTML=`
                <option value="">
                    Toutes les années
                </option>
            `;for(let e=y;e>=2023;e--)v.innerHTML+=`
                    <option value="${e}">
                        ${e}
                    </option>
                `}let b=document.getElementById(`anciens-body`),x=document.getElementById(`recherche`),S=document.getElementById(`periode`),C=document.getElementById(`moisFiltre`);if(!b){console.error(`❌ anciens-body introuvable.`),document.body.classList.add(`loaded`),document.getElementById(`app-loader`)?.classList.add(`hidden`);return}let w=[];function T(e){if(!e)return`-`;let t=String(e).trim(),n=t.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?/);if(n){let e=`${n[3]}/${n[2]}/${n[1]}`;return n[4]!==void 0&&n[5]!==void 0&&(e+=` à ${n[4]}:${n[5]}`),e}let r;return r=e&&typeof e.toDate==`function`?e.toDate():new Date(e),Number.isNaN(r.getTime())?t:`${new Intl.DateTimeFormat(`fr-FR`,{day:`2-digit`,month:`2-digit`,year:`numeric`}).format(r)} à ${new Intl.DateTimeFormat(`fr-FR`,{hour:`2-digit`,minute:`2-digit`,hour12:!1}).format(r)}`}function E(e){if(!e)return null;if(e&&typeof e.toDate==`function`)return e.toDate();let t=String(e).trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);if(t){let e=Number(t[1]),n=Number(t[2])-1,r=Number(t[3]),i=Number(t[4]||0),a=Number(t[5]||0);return new Date(e,n,r,i,a)}let n=new Date(e);return Number.isNaN(n.getTime())?null:n}function D(e){switch(e){case`envoye`:return`Envoyé`;case`recu`:return`Reçu`;case`en_cours`:return`En cours`;case`termine`:return`Terminée`;case`non_termine`:return`Non terminée`;default:return e||`-`}}function O(){let e=x?.value?.trim().toLowerCase()||``,t=_?.value||``,n=S?.value||``,r=v?.value||``,i=C?.value||``,a=new Date,o=w.filter(o=>{if(!o.date)return!1;let s=E(o.date);if(!s||e&&![o.id,o.pavillon,o.localisation,o.niveau,o.cote,o.chambre,o.description,o.par,o.agentNom,o.agentMatricule,o.cause,o.type,g.get(o.type)].filter(Boolean).join(` `).toLowerCase().includes(e)||t&&o.type!==t||r&&String(s.getFullYear())!==String(r)||i&&String(s.getMonth()+1).padStart(2,`0`)!==i)return!1;if(n){let e=new Date(a);if(n===`semaine`?e.setDate(a.getDate()-7):n===`mois`?e.setMonth(a.getMonth()-1):n===`annee`&&e.setFullYear(a.getFullYear()-1),e.setHours(0,0,0,0),s<e)return!1}return!0});if(o.sort((e,t)=>{let n=E(e.date),r=E(t.date);return!n&&!r?0:n?r?r.getTime()-n.getTime():-1:1}),b.innerHTML=``,o.length===0){b.innerHTML=`
                    <tr class="empty-row">

                        <td colspan="12">
                            Aucun ancien bon trouvé.
                        </td>

                    </tr>
                `;return}o.forEach(e=>{let t=T(e.date),n=g.get(e.type)||e.type||`-`,r=e.statut||`-`;b.innerHTML+=`

                        <tr>

                            <!-- ID -->

                            <td class="bon-id">
                                ${e.id||`-`}
                            </td>


                            <!-- DATE + HEURE -->

                            <td>
                                ${t}
                            </td>


                            <!-- TYPE -->

                            <td>
                                ${n}
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

                            <td class="description-cell">
                                ${e.description||`-`}
                            </td>


                            <!-- PAR -->

                            <td>
                                ${e.par||e.agentNom||e.agentMatricule||`-`}
                            </td>


                            <!-- STATUT -->

                            <td>

                                <span
                                    class="statut statut-${r}"
                                >
                                    ${D(r)}
                                </span>

                            </td>


                            <!-- CAUSE -->

                            <td class="cause-cell">

                                ${e.cause||`-`}

                            </td>

                        </tr>

                    `})}r(t(i(n,`bons`),e(`site`,`==`,m)),e=>{console.log(`📡 Bons mis à jour en temps réel :`,e.size),w=e.docs.map(e=>({id:e.id,...e.data()})),w=w.filter(e=>!(e.supprime===!0||e.archive!==!0)),console.log(`📚 Anciens bons archivés :`,w.length),O()},e=>{console.error(`❌ Écoute temps réel des anciens bons :`,e),b.innerHTML=`

                        <tr class="empty-row">

                            <td colspan="12">

                                Impossible de charger
                                les anciens bons.

                            </td>

                        </tr>

                    `}),[x,_,S,v,C].forEach(e=>{e?.addEventListener(`input`,O),e?.addEventListener(`change`,O)}),document.body.classList.add(`loaded`),document.getElementById(`app-loader`)?.classList.add(`hidden`),console.log(`✅ Anciens bons : écoute temps réel activée.`)});