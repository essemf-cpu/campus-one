import"../../../modulepreload-polyfill-Dezn_h7o.js";import{b as e,h as t,l as n,m as r,v as i}from"../../../authService-D_VO4Eli.js";import{t as a}from"../../../authGuard-CQaJ0AEA.js";import{t as o}from"../../../referentielService-19ofs0Bh.js";import{t as s}from"../../../sidebar-C4KV5qly.js";function c(e){if(!e)return`-`;if(e&&typeof e.toDate==`function`){let t=e.toDate();return new Intl.DateTimeFormat(`fr-FR`,{day:`2-digit`,month:`2-digit`,year:`numeric`,hour:`2-digit`,minute:`2-digit`,hour12:!1}).format(t)}let t=String(e).trim(),n=t.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?/);if(n){let e=`${n[3]}/${n[2]}/${n[1]}`;return n[4]!==void 0&&n[5]!==void 0&&(e+=` à ${n[4]}:${n[5]}`),e}let r=new Date(e);return Number.isNaN(r.getTime())?t:new Intl.DateTimeFormat(`fr-FR`,{day:`2-digit`,month:`2-digit`,year:`numeric`,hour:`2-digit`,minute:`2-digit`,hour12:!1}).format(r)}function l(e){if(!e)return null;if(e&&typeof e.toDate==`function`){let t=e.toDate();return Number.isNaN(t.getTime())?null:t}let t=String(e).trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?/);if(t){let e=Number(t[1]),n=Number(t[2])-1,r=Number(t[3]),i=Number(t[4]||0),a=Number(t[5]||0),o=Number(t[6]||0);return new Date(e,n,r,i,a,o)}let n=new Date(e);return Number.isNaN(n.getTime())?null:n}a(`agent`,async({profile:a})=>{if(a.service!==`Service de l'Hébergement`){console.warn(`⛔ Service incorrect :`,a.service);return}await s(a);let u=document.getElementById(`page-title`);u&&(u.textContent=a.affectation||``);let d=a.site,f=a.affectation?.replace(/^Pavillon\s+/i,``).trim();if(console.log(`🏢 Site agent :`,d),console.log(`🏠 Pavillon agent :`,f),!d||!f){console.error(`❌ Impossible de déterminer le site ou le pavillon.`);return}let p=document.getElementById(`typeFiltre`),m=[];try{m=await o()}catch(e){console.error(`❌ Erreur chargement types de travaux :`,e)}let h=new Map(m.map(e=>[e.id,e.nom]));p&&(p.innerHTML=`
                <option value="">
                    Tous les types
                </option>
            `,m.forEach(e=>{p.innerHTML+=`
                        <option value="${e.id}">
                            ${e.nom}
                        </option>
                    `}));let g=document.getElementById(`anneeFiltre`),_=new Date().getFullYear();if(g){g.innerHTML=`
                <option value="">
                    Toutes les années
                </option>
            `;for(let e=_;e>=2023;e--)g.innerHTML+=`
                    <option value="${e}">
                        ${e}
                    </option>
                `}let v=document.getElementById(`anciens-body`),y=document.getElementById(`recherche`),b=document.getElementById(`periode`),x=document.getElementById(`moisFiltre`);if(!v){console.error(`❌ anciens-body introuvable.`);return}let S=[];function C(){let e=y?.value?.trim().toLowerCase()||``,t=p?.value||``,n=b?.value||``,r=g?.value||``,i=x?.value||``,a=new Date,o=new Date(a.getFullYear(),a.getMonth(),a.getDate()),s=S.filter(s=>{if(!s.date)return!1;let u=l(s.date);if(!u||new Date(u.getFullYear(),u.getMonth(),u.getDate()).getTime()===o.getTime()||e&&![s.id,s.localisation,s.niveau,s.cote,s.chambre,s.description,s.par,s.agentNom,s.agentMatricule,s.statut,s.cause,s.type,h.get(s.type),c(s.date)].filter(Boolean).join(` `).toLowerCase().includes(e)||t&&s.type!==t||r&&String(u.getFullYear())!==String(r)||i&&String(u.getMonth()+1).padStart(2,`0`)!==i)return!1;if(n){let e=new Date(a);if(n===`semaine`?e.setDate(a.getDate()-7):n===`mois`?e.setMonth(a.getMonth()-1):n===`annee`&&e.setFullYear(a.getFullYear()-1),e.setHours(0,0,0,0),u<e)return!1}return!0});if(s.sort((e,t)=>{let n=l(e.date),r=l(t.date);return!n&&!r?0:n?r?r.getTime()-n.getTime():-1:1}),v.innerHTML=``,s.length===0){v.innerHTML=`
                    <tr class="empty-row">

                        <td colspan="11">

                            Aucun ancien bon trouvé.

                        </td>

                    </tr>
                `;return}s.forEach(e=>{let t=c(e.date),n=h.get(e.type)||e.type||`-`;v.innerHTML+=`

                        <tr>

                            <!-- ID -->

                            <td>

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

                                ${e.statut||`-`}

                            </td>


                            <!-- CAUSE -->

                            <td>

                                ${e.cause||`-`}

                            </td>

                        </tr>

                    `})}let w=r(t(e(n,`bons`),i(`site`,`==`,d),i(`pavillon`,`==`,f)),e=>{console.log(`📡 Bons du pavillon mis à jour en temps réel :`,e.size),S=e.docs.map(e=>({id:e.id,...e.data()})),S=S.filter(e=>e.supprime!==!0),console.log(`📚 Anciens bons du pavillon :`,S.length),C()},e=>{console.error(`❌ Erreur écoute temps réel des bons :`,e),v.innerHTML=`

                        <tr class="empty-row">

                            <td colspan="11">

                                Impossible de charger
                                les anciens bons.

                            </td>

                        </tr>

                    `});[y,p,b,g,x].forEach(e=>{e?.addEventListener(`input`,C),e?.addEventListener(`change`,C)}),window.addEventListener(`beforeunload`,()=>{typeof w==`function`&&w()}),document.body.classList.add(`loaded`),document.getElementById(`app-loader`)?.classList.add(`hidden`),console.log(`✅ Anciens bons du pavillon : écoute temps réel activée.`)});