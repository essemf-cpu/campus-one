import"../../../modulepreload-polyfill-Dezn_h7o.js";import{_ as e,f as t,h as n,l as r,y as i}from"../../../authService-DX3gg-GL.js";import{t as a}from"../../../authGuard-ykA3SEVG.js";import{t as o}from"../../../sidebar-n5m1VV9L.js";a(`agent`,async({profile:a,affectation:u,anneeAcademique:d,lectureSeule:f})=>{if(a.service!==`Service de l'Hébergement`)return;await o(a);let p=document.getElementById(`residents-body`),m=document.getElementById(`total-residents`),h=document.getElementById(`search-resident`),g=document.getElementById(`niveau-filter`),_=document.getElementById(`voir-suppleants-btn`),v=document.getElementById(`residents-page-title`),y=document.getElementById(`residents-page-subtitle`),b=document.getElementById(`table-title`),x=document.getElementById(`table-title-container`),S=document.getElementById(`total-label`),C=document.getElementById(`occupant-column-title`),w=document.getElementById(`annee-academique`),T=document.getElementById(`pavillon-concerne`);if(!p){document.body.classList.add(`loaded`);return}let E=u?.site||a.site||``,D=u?.pavillon||s(u?.affectation||a.affectation||``);if(w&&(w.textContent=d),T&&(T.textContent=D),console.log(`🏠 Résidents - affectation :`,{site:E,pavillon:D,anneeAcademique:d}),!E||!D){p.innerHTML=`

                <tr class="empty-row">

                    <td colspan="7">

                        Votre affectation
                        n'est pas correctement définie.

                    </td>

                </tr>

            `,document.body.classList.add(`loaded`);return}let O=[],k=[],A=localStorage.getItem(`residents-mode`)===`suppleants`;try{let a=await t(n(i(r,`hebergements`),e(`site`,`==`,E))),o=await t(i(r,`etudiants`)),s=new Map;o.docs.forEach(e=>{let t=e.data();s.set(t.matricule,{...t,id:e.id})}),O=[],k=[],a.docs.forEach(e=>{let t=e.data();if(t.pavillon!==D||!d||t.anneeAcademique!==d||!f&&t.statutOccupation!==`actif`)return;let n=s.get(t.matricule);if(!n){console.warn(`⚠️ Étudiant introuvable :`,t.matricule);return}let r={...n,hebergement:t,chambre:t.chambre||`-`};if(t.typeOccupation===`suppleant`){k.push(r);return}O.push(r)}),M(O),M(k),m.textContent=O.length,M(O),M(k),N(A?k:O),P(),j()}catch(e){console.error(`❌ Erreur chargement résidents :`,e),p.innerHTML=`

                <tr class="empty-row">

                    <td colspan="7">

                        Impossible de charger
                        les résidents.

                    </td>

                </tr>

            `}finally{document.body.classList.add(`loaded`)}function j(){let e=A?k:O,t=h?h.value.toLowerCase().trim():``,n=g?g.value:``,r=e.filter(e=>{let r=[e.nom,e.prenom,e.matricule,e.numeroEtudiant,e.telephone,e.filiere,e.etablissement,e.faculte].filter(Boolean).join(` `).toLowerCase(),i=!t||r.includes(t),a=!n||e.niveau===n;return i&&a});if(p.innerHTML=``,r.length===0){p.innerHTML=`

                    <tr class="empty-row">

                        <td colspan="7">

                            ${A?`Aucun suppléant trouvé.`:`Aucun résident trouvé.`}

                        </td>

                    </tr>

                `;return}r.forEach((e,t)=>{let n=document.createElement(`tr`);t>0&&r[t-1].chambre!==e.chambre&&n.classList.add(`room-separator`),n.innerHTML=`

                        <td>

                            <strong>

                                ${c(e.chambre||`-`)}

                            </strong>

                        </td>


                        <td>

                            <strong>

                                ${c(e.prenom||``)}

                                ${c(e.nom||``)}

                            </strong>

                        </td>


                        <td>

                            ${c(e.matricule||`-`)}

                        </td>


                    <td>

                        ${f?`—`:c(e.telephone||`-`)}

                    </td>


                        <td>

                            ${c(e.etablissement||`-`)}

                        </td>


                        <td>

                            ${c(e.filiere||`-`)}

                        </td>


                    <td>

                        ${f?`—`:c(e.niveau||`-`)}

                    </td>

                    `,p.appendChild(n)})}function M(e){e.sort((e,t)=>{let n=String(e.chambre||``),r=String(t.chambre||``),i=n.localeCompare(r,`fr`,{numeric:!0});if(i!==0)return i;let a=`${e.prenom||``} ${e.nom||``}`.toLowerCase(),o=`${t.prenom||``} ${t.nom||``}`.toLowerCase();return a.localeCompare(o,`fr`)})}function N(e){g&&(g.innerHTML=`

                <option value="">
                    Tous les niveaux
                </option>

            `,[...new Set(e.map(e=>e.niveau).filter(Boolean))].sort((e,t)=>e.localeCompare(t,`fr`)).forEach(e=>{g.innerHTML+=`

                        <option
                            value="${l(e)}"
                        >

                            ${c(e)}

                        </option>

                    `}))}h&&h.addEventListener(`input`,j),g&&g.addEventListener(`change`,j);function P(){A?(x&&x.classList.add(`suppleants-table-title`),v&&(v.textContent=`Suppléants`),y&&(y.innerHTML=`

                Suppléants de l’année académique
                <span>
                    ${c(d)}
                </span>
                du pavillon
                <span>
                    ${c(D)}
                </span>

            `),b&&(b.textContent=`Liste des suppléants`),S&&(S.textContent=`Nombre total de suppléants :`),_&&(_.textContent=`Voir résidents`),C&&(C.textContent=`Suppléant`),document.querySelector(`.residents-page`)?.classList.add(`suppleants-mode`)):(x&&x.classList.remove(`suppleants-table-title`),v&&(v.textContent=`Résidents`),y&&(y.innerHTML=`

                Résidents de l’année académique
                <span>
                    ${c(d)}
                </span>
                du pavillon
                <span>
                    ${c(D)}
                </span>

            `),b&&(b.textContent=`Liste des résidents`),S&&(S.textContent=`Nombre total de résidents :`),_&&(_.textContent=`Voir suppléants`),C&&(C.textContent=`Résident`),document.querySelector(`.residents-page`)?.classList.remove(`suppleants-mode`)),m.textContent=A?k.length:O.length}_&&_.addEventListener(`click`,()=>{A=!A,localStorage.setItem(`residents-mode`,A?`suppleants`:`residents`),N(A?k:O),P(),j()})});function s(e){let t=String(e).trim().match(/Pavillon\s+(.+)/i);return t?t[1].trim():``}function c(e=``){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}function l(e=``){return c(e)}