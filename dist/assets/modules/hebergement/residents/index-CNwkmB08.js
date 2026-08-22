import"../../../modulepreload-polyfill-Dezn_h7o.js";import{_ as e,f as t,h as n,l as r,y as i}from"../../../authService-DX3gg-GL.js";import{t as a}from"../../../authGuard-ykA3SEVG.js";import{t as o}from"../../../sidebar-n5m1VV9L.js";a(`agent`,async({profile:a,anneeAcademique:u})=>{if(a.service!==`Service de l'Hébergement`)return;await o(a);let d=document.getElementById(`residents-body`),f=document.getElementById(`total-residents`),p=document.getElementById(`search-resident`),m=document.getElementById(`niveau-filter`),h=document.getElementById(`voir-suppleants-btn`),g=document.getElementById(`residents-page-title`),_=document.getElementById(`residents-page-subtitle`),v=document.getElementById(`table-title`),y=document.getElementById(`table-title-container`),b=document.getElementById(`total-label`),x=document.getElementById(`occupant-column-title`),S=document.getElementById(`annee-academique`),C=document.getElementById(`pavillon-concerne`);if(!d){document.body.classList.add(`loaded`);return}let w=a.site||``,T=s(a.affectation||``);if(S&&(S.textContent=u),C&&(C.textContent=T),console.log(`🏠 Résidents - affectation :`,{site:w,pavillon:T,anneeAcademique:u}),!w||!T){d.innerHTML=`

                <tr class="empty-row">

                    <td colspan="7">

                        Votre affectation
                        n'est pas correctement définie.

                    </td>

                </tr>

            `,document.body.classList.add(`loaded`);return}let E=[],D=[],O=localStorage.getItem(`residents-mode`)===`suppleants`;try{let a=await t(n(i(r,`hebergements`),e(`site`,`==`,w))),o=await t(i(r,`etudiants`)),s=new Map;o.docs.forEach(e=>{let t=e.data();s.set(t.matricule,{...t,id:e.id})}),E=[],D=[],a.docs.forEach(e=>{let t=e.data();if(t.pavillon!==T||t.statutOccupation!==`actif`||u&&t.anneeAcademique&&t.anneeAcademique!==u)return;let n=s.get(t.matricule);if(!n){console.warn(`⚠️ Étudiant introuvable :`,t.matricule);return}let r={...n,hebergement:t,chambre:t.chambre||`-`};if(t.typeOccupation===`suppleant`){D.push(r);return}E.push(r)}),A(E),A(D),f.textContent=E.length,A(E),A(D),j(O?D:E),M(),k()}catch(e){console.error(`❌ Erreur chargement résidents :`,e),d.innerHTML=`

                <tr class="empty-row">

                    <td colspan="7">

                        Impossible de charger
                        les résidents.

                    </td>

                </tr>

            `}finally{document.body.classList.add(`loaded`)}function k(){let e=O?D:E,t=p?p.value.toLowerCase().trim():``,n=m?m.value:``,r=e.filter(e=>{let r=[e.nom,e.prenom,e.matricule,e.numeroEtudiant,e.telephone,e.filiere,e.etablissement,e.faculte].filter(Boolean).join(` `).toLowerCase(),i=!t||r.includes(t),a=!n||e.niveau===n;return i&&a});if(d.innerHTML=``,r.length===0){d.innerHTML=`

                    <tr class="empty-row">

                        <td colspan="7">

                            ${O?`Aucun suppléant trouvé.`:`Aucun résident trouvé.`}

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

                            ${c(e.telephone||`-`)}

                        </td>


                        <td>

                            ${c(e.etablissement||`-`)}

                        </td>


                        <td>

                            ${c(e.filiere||`-`)}

                        </td>


                        <td>

                            ${c(e.niveau||`-`)}

                        </td>

                    `,d.appendChild(n)})}function A(e){e.sort((e,t)=>{let n=String(e.chambre||``),r=String(t.chambre||``),i=n.localeCompare(r,`fr`,{numeric:!0});if(i!==0)return i;let a=`${e.prenom||``} ${e.nom||``}`.toLowerCase(),o=`${t.prenom||``} ${t.nom||``}`.toLowerCase();return a.localeCompare(o,`fr`)})}function j(e){m&&(m.innerHTML=`

                <option value="">
                    Tous les niveaux
                </option>

            `,[...new Set(e.map(e=>e.niveau).filter(Boolean))].sort((e,t)=>e.localeCompare(t,`fr`)).forEach(e=>{m.innerHTML+=`

                        <option
                            value="${l(e)}"
                        >

                            ${c(e)}

                        </option>

                    `}))}p&&p.addEventListener(`input`,k),m&&m.addEventListener(`change`,k);function M(){O?(y&&y.classList.add(`suppleants-table-title`),g&&(g.textContent=`Suppléants`),_&&(_.innerHTML=`

                Suppléants de l’année académique
                <span>
                    ${c(u)}
                </span>
                du pavillon
                <span>
                    ${c(T)}
                </span>

            `),v&&(v.textContent=`Liste des suppléants`),b&&(b.textContent=`Nombre total de suppléants :`),h&&(h.textContent=`Voir résidents`),x&&(x.textContent=`Suppléant`),document.querySelector(`.residents-page`)?.classList.add(`suppleants-mode`)):(y&&y.classList.remove(`suppleants-table-title`),g&&(g.textContent=`Résidents`),_&&(_.innerHTML=`

                Résidents de l’année académique
                <span>
                    ${c(u)}
                </span>
                du pavillon
                <span>
                    ${c(T)}
                </span>

            `),v&&(v.textContent=`Liste des résidents`),b&&(b.textContent=`Nombre total de résidents :`),h&&(h.textContent=`Voir suppléants`),x&&(x.textContent=`Résident`),document.querySelector(`.residents-page`)?.classList.remove(`suppleants-mode`)),f.textContent=O?D.length:E.length}h&&h.addEventListener(`click`,()=>{O=!O,localStorage.setItem(`residents-mode`,O?`suppleants`:`residents`),j(O?D:E),M(),k()})});function s(e){let t=String(e).trim().match(/Pavillon\s+(.+)/i);return t?t[1].trim():``}function c(e=``){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}function l(e=``){return c(e)}