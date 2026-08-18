import"../../../modulepreload-polyfill-Dezn_h7o.js";import{g as e,l as t,m as n,v as r,y as i}from"../../../authService-kcLQHjqZ.js";import{t as a}from"../../../authGuard-NXoHQF1z.js";import{t as o}from"../../../sidebar-BJ2K6kVW.js";import{t as s}from"../../../referentielService-lzYZwhmV.js";a(`agent`,async({profile:a})=>{if(a.service!==`Service de l'Hébergement`)return;await o(a),document.getElementById(`page-title`).textContent=a.affectation;let c=document.getElementById(`historique-body`);if(!c){console.error(`❌ historique-body introuvable`);return}let l=document.getElementById(`historique-search`),u=document.getElementById(`historique-sort`),d=document.getElementById(`historique-type`),f=document.getElementById(`historique-statut`),p=document.getElementById(`historique-periode`),m=document.getElementById(`historique-annee-container`),h=document.getElementById(`historique-annee`),g=document.getElementById(`historique-mois-container`),_=document.getElementById(`historique-mois`),v=[],y=``,b=`recent`,x=`tous`,S=`tous`,C=`toutes`,w=``,T=``,E=[];try{E=await s()}catch(e){console.error(`❌ Erreur récupération types de travaux :`,e)}let D=new Map;E.forEach(e=>{D.set(e.id,e.nom)}),d&&E.forEach(e=>{d.innerHTML+=`

                        <option value="${e.id}">
                            ${e.nom}
                        </option>

                    `});let O=e=>{if(e.date?.toDate)return e.date.toDate();if(e.date){let t=new Date(e.date);if(!isNaN(t.getTime()))return t}return new Date(0)},k=e=>D.get(e.type)||e.type||`-`,A=e=>e.statut===`termine`?`Terminée`:e.statut===`forclos`?`Forclos`:e.statut===`non_termine`?`Non terminée`:e.statut===`en_cours`?`En cours`:`En attente`,j=e=>{let t=new Date(e);return t.setHours(0,0,0,0),t},M=e=>{let t=new Date(e);return t.setHours(23,59,59,999),t},N=e=>{if(C===`toutes`)return!0;let t=new Date;if(C===`aujourd_hui`)return e>=j(t)&&e<=M(t);if(C===`hier`){let n=new Date(t);return n.setDate(n.getDate()-1),e>=j(n)&&e<=M(n)}if(C===`semaine`){let n=new Date(t),r=n.getDay(),i=r===0?6:r-1;n.setDate(n.getDate()-i);let a=new Date(n);return a.setDate(a.getDate()+6),e>=j(n)&&e<=M(a)}return C===`mois`?e.getMonth()===t.getMonth()&&e.getFullYear()===t.getFullYear():C===`choisir_mois`?w===``||T===``?!1:e.getFullYear()===Number(w)&&e.getMonth()===Number(T):C===`annee`?e.getFullYear()===t.getFullYear():C!==`choisir_annee`||w!==``&&e.getFullYear()===Number(w)},P=()=>{if(!h)return;let e=[...new Set(v.map(e=>O(e).getFullYear()).filter(e=>e>1970))].sort((e,t)=>t-e),t=h.value;h.innerHTML=`

                    <option value="">

                        Choisir une année

                    </option>

                `,e.forEach(e=>{h.innerHTML+=`

                            <option value="${e}">

                                ${e}

                            </option>

                        `}),e.includes(Number(t))&&(h.value=t)},F=()=>{let e=[...v],t=y.trim().toLowerCase();if(t&&(e=e.filter(e=>{let n=`${e.prenom||``} ${e.nom||``}`,r=k(e),i=A(e);return[n,e.matricule,e.chambre,r,e.probleme,e.localisation,i,e.cause,e.commentaire].filter(Boolean).join(` `).toLowerCase().includes(t)})),x!==`tous`&&(e=e.filter(e=>e.type===x)),S!==`tous`&&(e=e.filter(e=>e.statut===S)),f&&f.addEventListener(`change`,()=>{S=f.value,F()}),e=e.filter(e=>N(O(e))),e.sort((e,t)=>{let n=O(e),r=O(t);return b===`ancien`?n-r:r-n}),e.length===0){c.innerHTML=`

                        <tr class="empty-row">

                            <td colspan="9">

                                ${t||x!==`tous`||C!==`toutes`?`Aucune demande ne correspond aux critères sélectionnés.`:`Aucun historique disponible.`}

                            </td>

                        </tr>

                    `;return}c.innerHTML=``,e.forEach(e=>{let t=O(e),n=t.getTime()===0?`-`:t.toLocaleDateString(`fr-FR`),r=`${e.prenom||``} ${e.nom||``}`.trim(),i=A(e),a=k(e),o=`-`;e.statut===`termine`&&(o=`En attente`,e.evaluation===1?o=`⭐`:e.evaluation===2?o=`⭐⭐`:e.evaluation===3&&(o=`⭐⭐⭐`));let s=`-`;e.commentaire===`insatisfait`?s=`Insatisfait`:e.commentaire===`satisfait`?s=`Satisfait`:e.commentaire===`tres_satisfait`&&(s=`Très satisfait`),c.innerHTML+=`

                            <tr>

                                <td>
                                    ${n}
                                </td>


                                <td>
                                    ${r||`-`}
                                </td>


                                <td>
                                    ${e.chambre||`-`}
                                </td>


                                <td>
                                    ${a}
                                </td>


                                <td>
                                    ${e.probleme||`-`}
                                </td>


                                <td>
                                    ${i}
                                </td>


                                <td>
                                    ${e.cause||`-`}
                                </td>


                                <td>
                                    ${o}
                                </td>


                                <td>
                                    ${s}
                                </td>

                            </tr>

                        `})};l&&l.addEventListener(`input`,()=>{y=l.value,F()}),u&&u.addEventListener(`change`,()=>{b=u.value,F()}),d&&d.addEventListener(`change`,()=>{x=d.value,F()}),p&&p.addEventListener(`change`,()=>{C=p.value,g&&(g.hidden=C!==`choisir_mois`),m&&(m.hidden=C!==`choisir_mois`&&C!==`choisir_annee`),F()}),h&&h.addEventListener(`change`,()=>{w=h.value,F()}),_&&_.addEventListener(`change`,()=>{T=_.value,F()});let I=a.site,L=a.affectation?.replace(/^Pavillon\s+/i,``).trim();if(console.log(`🏢 Site historique :`,I),console.log(`🏠 Pavillon historique :`,L),!I||!L){c.innerHTML=`

                <tr class="empty-row">

                    <td colspan="9">

                        Impossible de déterminer
                        le site ou le pavillon.

                    </td>

                </tr>

            `,document.body.classList.add(`loaded`);return}n(e(i(t,`demandes_etudiants`),r(`site`,`==`,I),r(`pavillon`,`==`,L)),e=>{console.log(`📚 Historique mis à jour :`,e.size),v=[],e.forEach(e=>{let t=e.data();t.statut!==`termine`&&t.statut!==`forclos`&&t.statut!==`non_termine`||v.push({id:e.id,...t})}),P(),F(),document.body.classList.add(`loaded`)},e=>{console.error(`❌ Erreur historique demandes :`,e),c.innerHTML=`

                    <tr class="empty-row">

                        <td colspan="9">

                            Impossible de charger
                            l'historique des demandes.

                        </td>

                    </tr>

                `,document.body.classList.add(`loaded`)})});