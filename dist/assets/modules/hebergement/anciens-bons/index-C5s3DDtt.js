import"../../../modulepreload-polyfill-Dezn_h7o.js";import{t as e}from"../../../authGuard-ykA3SEVG.js";import{t}from"../../../referentielService-BQbj88SN.js";import{t as n}from"../../../sidebar-n5m1VV9L.js";import{r}from"../../../bonsService-BymP7wJm.js";e(`agent`,async({profile:e})=>{if(e.service!==`Service de l'Hébergement`)return;await n(e),document.getElementById(`page-title`).textContent=e.affectation;let i=e.site,a=e.affectation?.replace(/^Pavillon\s+/i,``).trim();if(console.log(`🏢 Site agent :`,i),console.log(`🏠 Pavillon agent :`,a),!i||!a){console.error(`❌ Impossible de déterminer le site ou le pavillon.`);return}let o=document.getElementById(`typeFiltre`),s=await t(),c=new Map(s.map(e=>[e.id,e.nom]));o&&(o.innerHTML=`<option value="">
                    Tous les types
                </option>`,s.forEach(e=>{o.innerHTML+=`
                        <option value="${e.id}">
                            ${e.nom}
                        </option>
                    `}));let l=document.getElementById(`anneeFiltre`),u=new Date().getFullYear();if(l)for(let e=u;e>=2023;e--)l.innerHTML+=`
                    <option value="${e}">
                        ${e}
                    </option>
                `;let d=document.getElementById(`anciens-body`),f=document.getElementById(`recherche`),p=document.getElementById(`periode`),m=document.getElementById(`moisFiltre`),h=[];try{h=await r({site:i,pavillon:a})}catch(e){console.error(`❌ Chargement des anciens bons :`,e),d.innerHTML=`

                <tr class="empty-row">

                    <td colspan="12">

                        Impossible de charger
                        les anciens bons.

                    </td>

                </tr>

            `;return}function g(){let e=f?.value?.trim().toLowerCase()||``,t=o?.value||``,n=p?.value||``,r=l?.value||``,i=m?.value||``,a=new Date,s=a.toISOString().split(`T`)[0],u=h.filter(o=>{if(!o.date)return!1;let c=String(o.date).split(`T`)[0];if(c===s)return!1;let l=new Date(c+`T00:00:00`);if(e&&!c.split(`-`).reverse().join(`/`).includes(e)||t&&o.type!==t||r&&String(l.getFullYear())!==String(r)||i&&String(l.getMonth()+1).padStart(2,`0`)!==i)return!1;if(n){let e=new Date(a);if(n===`semaine`?e.setDate(a.getDate()-7):n===`mois`?e.setMonth(a.getMonth()-1):n===`annee`&&e.setFullYear(a.getFullYear()-1),e.setHours(0,0,0,0),l<e)return!1}return!0});if(d.innerHTML=``,u.length===0){d.innerHTML=`

                    <tr class="empty-row">

                        <td colspan="12">

                            Aucun ancien bon trouvé.

                        </td>

                    </tr>

                `;return}u.forEach(e=>{let t=e.date?String(e.date).split(`T`)[0].split(`-`).reverse().join(`/`):`-`;d.innerHTML+=`

                        <tr>

                            <!-- ID -->

                            <td>
                                ${e.id||`-`}
                            </td>


                            <!-- DATE -->

                            <td>
                                ${t}
                            </td>


                            <!-- TYPE -->

                            <td>
                                ${c.get(e.type)||`-`}
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


                            <!-- STATUT -->

                            <td>
                                ${e.statut||`-`}
                            </td>


                            <!-- CAUSE -->

                            <td>
                                ${e.cause||`-`}
                            </td>

                        </tr>

                    `})}[f,o,p,l,m].forEach(e=>{e?.addEventListener(`input`,g),e?.addEventListener(`change`,g)}),g(),document.body.classList.add(`loaded`)});