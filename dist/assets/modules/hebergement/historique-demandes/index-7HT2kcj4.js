import"../../../modulepreload-polyfill-Dezn_h7o.js";import{b as e,h as t,l as n,m as r,v as i}from"../../../authService-D_VO4Eli.js";import{t as a}from"../../../authGuard-CQaJ0AEA.js";import{t as o}from"../../../referentielService-19ofs0Bh.js";import{t as s}from"../../../sidebar-C4KV5qly.js";a(`agent`,async({profile:a})=>{if(a.service!==`Service de l'Hébergement`)return;await s(a);let c=document.getElementById(`page-title`);c&&(c.textContent=a.affectation||``);let l=document.getElementById(`historique-body`);if(!l){console.error(`❌ historique-body introuvable`);return}let u=document.getElementById(`historique-search`),d=document.getElementById(`historique-sort`),f=document.getElementById(`historique-type`),p=document.getElementById(`historique-statut`),m=document.getElementById(`historique-periode`),h=document.getElementById(`historique-annee-container`),g=document.getElementById(`historique-annee`),_=document.getElementById(`historique-mois-container`),v=document.getElementById(`historique-mois`),y=[],b=``,x=`recent`,S=`tous`,C=`tous`,w=`toutes`,T=``,E=``,D=[];try{D=await o()}catch(e){console.error(`❌ Erreur récupération types de travaux :`,e)}let O=new Map;D.forEach(e=>{O.set(e.id,e.nom)}),f&&(f.innerHTML=`
                <option value="tous">
                    Tous les types
                </option>
            `,D.forEach(e=>{f.innerHTML+=`
                        <option value="${e.id}">
                            ${e.nom}
                        </option>
                    `}));let k=e=>{if(e?.date&&typeof e.date.toDate==`function`)return e.date.toDate();if(e?.date instanceof Date)return e.date;if(e?.date){let t=new Date(e.date);if(!Number.isNaN(t.getTime()))return t}return new Date(0)},A=e=>!e||e.getTime()===0?`-`:`${String(e.getDate()).padStart(2,`0`)}/${String(e.getMonth()+1).padStart(2,`0`)}/${e.getFullYear()} à ${String(e.getHours()).padStart(2,`0`)}:${String(e.getMinutes()).padStart(2,`0`)}`,j=e=>O.get(e.type)||e.type||`-`,M=e=>e.statut===`termine`?`Terminée`:e.statut===`forclos`?`Forclos`:e.statut===`non_termine`?`Non terminée`:e.statut===`en_cours`?`En cours`:`En attente`,N=e=>{let t=new Date(e);return t.setHours(0,0,0,0),t},P=e=>{let t=new Date(e);return t.setHours(23,59,59,999),t},F=e=>{if(w===`toutes`)return!0;let t=new Date;if(w===`aujourd_hui`)return e>=N(t)&&e<=P(t);if(w===`hier`){let n=new Date(t);return n.setDate(n.getDate()-1),e>=N(n)&&e<=P(n)}if(w===`semaine`){let n=new Date(t),r=n.getDay(),i=r===0?6:r-1;n.setDate(n.getDate()-i);let a=new Date(n);return a.setDate(a.getDate()+6),e>=N(n)&&e<=P(a)}return w===`mois`?e.getMonth()===t.getMonth()&&e.getFullYear()===t.getFullYear():w===`choisir_mois`?T===``||E===``?!1:e.getFullYear()===Number(T)&&e.getMonth()===Number(E):w===`annee`?e.getFullYear()===t.getFullYear():w!==`choisir_annee`||T!==``&&e.getFullYear()===Number(T)},I=()=>{if(!g)return;let e=[...new Set(y.map(e=>k(e).getFullYear()).filter(e=>e>1970))].sort((e,t)=>t-e),t=g.value;g.innerHTML=`
                    <option value="">
                        Choisir une année
                    </option>
                `,e.forEach(e=>{g.innerHTML+=`
                            <option value="${e}">
                                ${e}
                            </option>
                        `}),e.includes(Number(t))&&(g.value=t)},L=()=>{let e=[...y],t=b.trim().toLowerCase();if(t&&(e=e.filter(e=>{let n=`${e.prenom||``} ${e.nom||``}`,r=j(e),i=M(e);return[n,e.matricule,e.localisation,e.niveau,e.cote,e.chambre,r,e.probleme,e.description,i,e.cause,e.commentaire].filter(Boolean).join(` `).toLowerCase().includes(t)})),S!==`tous`&&(e=e.filter(e=>e.type===S)),C!==`tous`&&(e=e.filter(e=>e.statut===C)),e=e.filter(e=>F(k(e))),e.sort((e,t)=>{let n=k(e),r=k(t);return x===`ancien`?n-r:r-n}),e.length===0){l.innerHTML=`

                        <tr class="empty-row">

                            <td colspan="12">

                                ${t||S!==`tous`||C!==`tous`||w!==`toutes`?`Aucune demande ne correspond aux critères sélectionnés.`:`Aucun historique disponible.`}

                            </td>

                        </tr>

                    `;return}l.innerHTML=``,e.forEach(e=>{let t=k(e),n=A(t),r=`${e.prenom||``} ${e.nom||``}`.trim(),i=j(e),a=M(e),o=`-`;e.statut===`termine`&&(o=`En attente`,e.evaluation===1?o=`⭐`:e.evaluation===2?o=`⭐⭐`:e.evaluation===3&&(o=`⭐⭐⭐`));let s=`-`;e.commentaire===`insatisfait`?s=`Insatisfait`:e.commentaire===`satisfait`?s=`Satisfait`:e.commentaire===`tres_satisfait`?s=`Très satisfait`:e.commentaire&&(s=e.commentaire),l.innerHTML+=`

                            <tr>

                                <!-- 1 — DATE ET HEURE -->

                                <td>
                                    ${n}
                                </td>


                                <!-- 2 — NOM -->

                                <td>
                                    ${r||`-`}
                                </td>


                                <!-- 3 — TYPE -->

                                <td>
                                    ${i}
                                </td>


                                <!-- 4 — LOCALISATION -->

                                <td>
                                    ${e.localisation||`-`}
                                </td>


                                <!-- 5 — NIVEAU -->

                                <td>
                                    ${e.niveau||`-`}
                                </td>


                                <!-- 6 — CÔTÉ -->

                                <td>
                                    ${e.cote||`-`}
                                </td>


                                <!-- 7 — CHAMBRE -->

                                <td>
                                    ${e.chambre||`-`}
                                </td>


                                <!-- 8 — DESCRIPTION -->

                                <td>
                                    ${e.description||e.probleme||`-`}
                                </td>


                                <!-- 9 — STATUT -->

                                <td>
                                    ${a}
                                </td>


                                <!-- 10 — CAUSE -->

                                <td>
                                    ${e.cause||`-`}
                                </td>


                                <!-- 11 — ÉVALUATION -->

                                <td>
                                    ${o}
                                </td>


                                <!-- 12 — COMMENTAIRE -->

                                <td>
                                    ${s}
                                </td>

                            </tr>

                        `})};u&&u.addEventListener(`input`,()=>{b=u.value,L()}),d&&d.addEventListener(`change`,()=>{x=d.value,L()}),f&&f.addEventListener(`change`,()=>{S=f.value,L()}),p&&p.addEventListener(`change`,()=>{C=p.value,L()}),m&&m.addEventListener(`change`,()=>{w=m.value,_&&(_.hidden=w!==`choisir_mois`),h&&(h.hidden=w!==`choisir_mois`&&w!==`choisir_annee`),L()}),g&&g.addEventListener(`change`,()=>{T=g.value,L()}),v&&v.addEventListener(`change`,()=>{E=v.value,L()});let R=a.site,z=a.affectation?.replace(/^Pavillon\s+/i,``).trim();if(console.log(`🏢 Site historique :`,R),console.log(`🏠 Affectation historique :`,z),!R||!z){l.innerHTML=`

                <tr class="empty-row">

                    <td colspan="12">

                        Impossible de déterminer
                        le site ou l'affectation.

                    </td>

                </tr>

            `,document.body.classList.add(`loaded`);return}let B=r(t(e(n,`demandes_etudiants`),i(`site`,`==`,R),i(`pavillon`,`==`,z)),e=>{console.log(`📡 Historique mis à jour en temps réel :`,e.size),y=[],e.forEach(e=>{let t=e.data();t.statut!==`termine`&&t.statut!==`forclos`&&t.statut!==`non_termine`||y.push({id:e.id,...t})}),console.log(`📚 Demandes historiques :`,y.length),I(),L(),document.body.classList.add(`loaded`)},e=>{console.error(`❌ Erreur historique demandes :`,e),l.innerHTML=`

                        <tr class="empty-row">

                            <td colspan="12">

                                Impossible de charger
                                l'historique des demandes.

                            </td>

                        </tr>

                    `,document.body.classList.add(`loaded`)});window.addEventListener(`beforeunload`,()=>{typeof B==`function`&&B()}),console.log(`✅ Historique des demandes : écoute temps réel activée.`)});