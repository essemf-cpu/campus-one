import"../../../modulepreload-polyfill-Dezn_h7o.js";import{b as e,f as t,h as n,l as r,m as i,v as a}from"../../../authService-D_VO4Eli.js";import{t as o}from"../../../authGuard-CQaJ0AEA.js";import{t as s}from"../../../sidebar-C4KV5qly.js";var c=[{id:`2026ABC_2026-2027`,matricule:`2026ABC`,anneeAcademique:`2026-2027`,montantMensuel:3e3,caution:{montant:3e3,statut:`paye`,datePaiement:null},mois:{novembre:{libelle:`Novembre 2026`,statut:`paye`,datePaiement:null},decembre:{libelle:`Décembre 2026`,statut:`paye`,datePaiement:null},janvier:{libelle:`Janvier 2027`,statut:`a_payer`,datePaiement:null},fevrier:{libelle:`Février 2027`,statut:`a_payer`,datePaiement:null},mars:{libelle:`Mars 2027`,statut:`a_payer`,datePaiement:null},avril:{libelle:`Avril 2027`,statut:`a_payer`,datePaiement:null},mai:{libelle:`Mai 2027`,statut:`a_payer`,datePaiement:null},juin:{libelle:`Juin 2027`,statut:`a_payer`,datePaiement:null},juillet:{libelle:`Juillet 2027`,statut:`a_payer`,datePaiement:null}},dernierPaiement:{date:null,montant:0,mois:[],mode:null},statut:`en_cours`,creeLe:null,modifieLe:null}],l=`recouvrements`,u=`paiementsLoyers`,d=`../dashboard/index.html`,f=[],p=new Map,m=new Map,h=[],g=[],_=null,v=document.getElementById(`recouvrement-body`),y=document.getElementById(`total-etudiants`),b=document.getElementById(`total-recouvrement`),x=document.getElementById(`total-paye`),S=document.getElementById(`total-du`),C=document.getElementById(`search-recouvrement`),w=document.getElementById(`chambre-filter`),T=document.getElementById(`statut-filter`),E=document.getElementById(`annee-academique`),D=document.getElementById(`pavillon-concerne`);function O(e){return`${new Intl.NumberFormat(`fr-FR`).format(Number(e)||0)} FCFA`}async function k(i){try{let o=await t(n(e(r,l),a(`anneeAcademique`,`==`,i)));if(!o.empty)return o.docs.map(e=>({id:e.id,...e.data()}))}catch(e){console.warn(`⚠️ Impossible de lire les recouvrements Firestore. Utilisation du seed.`,e)}return c.filter(e=>e.anneeAcademique===i)}async function A(i){try{h=(await t(n(e(r,u),a(`anneeAcademique`,`==`,i),a(`statut`,`==`,`paye`)))).docs.map(e=>({id:e.id,...e.data()})),console.log(`💰 Paiements loyers :`,h.length)}catch(e){console.error(`❌ Impossible de charger les paiements de loyers :`,e),h=[]}}function j(t){typeof _==`function`&&(_(),_=null),_=i(n(e(r,u),a(`anneeAcademique`,`==`,t),a(`statut`,`==`,`paye`)),e=>{h=e.docs.map(e=>({id:e.id,...e.data()})),console.log(`🔄 Paiements loyers mis à jour en temps réel :`,h.length),M()},e=>{console.error(`❌ Erreur écoute temps réel paiementsLoyers :`,e)})}function M(){f=g,f=Array.from(m.values()).map(z).filter(Boolean),f.sort((e,t)=>{let n=String(e.chambre),r=String(t.chambre),i=n.localeCompare(r,`fr`,{numeric:!0});return i===0?String(e.lit).localeCompare(String(t.lit),`fr`,{numeric:!0}):i}),H(),U()}function N(e,t){!e||!e.mois||h.filter(e=>String(e.matricule)===String(t)&&e.statut===`paye`).forEach(n=>{let r=Object.values(e.mois).find(e=>e&&e.libelle===n.mois);if(!r){console.warn(`⚠️ Mois de paiement introuvable dans le recouvrement :`,{matricule:t,moisPaiement:n.mois});return}r.statut=`paye`,r.datePaiement=n.datePaiement||null,r.montant=Number(n.montant)||0})}async function P(){let n=await t(e(r,`etudiants`));p.clear(),n.docs.forEach(e=>{let t=e.data();t.matricule&&p.set(String(t.matricule),{...t,id:e.id})})}async function F(i,o,s,c){let l=await t(n(e(r,`hebergements`),a(`site`,`==`,i)));m.clear(),l.docs.forEach(e=>{let t=e.data();t.pavillon===o&&t.typeOccupation!==`suppleant`&&t.anneeAcademique===s&&(!c&&t.statutOccupation!==`actif`||t.matricule&&m.set(String(t.matricule),{...t,id:e.id}))})}function I(e){if(!e)return 0;let t=String(e.matricule||``);return h.filter(e=>String(e.matricule)===t&&e.statut===`paye`).reduce((e,t)=>e+(Number(t.montant)||0),0)}function L(e){if(!e)return 0;let t=Number(e.montantMensuel)||0,n=0;return e.mois&&Object.values(e.mois).forEach(e=>{e&&e.statut===`a_payer`&&(n+=t)}),n}function R(e,t){let n=[[`novembre`,`Novembre 2026`],[`decembre`,`Décembre 2026`],[`janvier`,`Janvier 2027`],[`fevrier`,`Février 2027`],[`mars`,`Mars 2027`],[`avril`,`Avril 2027`],[`mai`,`Mai 2027`],[`juin`,`Juin 2027`],[`juillet`,`Juillet 2027`]],r={};return n.forEach(([e,t])=>{r[e]={libelle:t,statut:`a_payer`,datePaiement:null,montant:0}}),{id:`${t}_${e}`,matricule:e,anneeAcademique:t,montantMensuel:3e3,mois:r,dernierPaiement:{date:null,montant:0,mois:[],mode:null},statut:`en_cours`}}function z(e){let t=String(e.matricule||``),n=p.get(t);if(!n)return null;let r=g.find(e=>String(e.matricule)===t);r||=R(t,e.anneeAcademique),N(r,t);let i=I(r),a=L(r),o=Object.values(r.mois||{}).filter(e=>e&&e.statut===`a_payer`);return{matricule:t,chambre:e.chambre||`-`,lit:B(e.lit||e.numeroLit||e.bed||``),carte:n.numeroEtudiant||n.numeroCarte||n.carte||n.matricule||`-`,nom:n.nom||``,prenom:n.prenom||``,montantPaye:i,montantDu:a,moisEnRetard:o,recouvrement:r}}function B(e){if(e==null)return`-`;let t=String(e).trim();if(!t)return`-`;let n=t.match(/(\d+)$/);return n?n[1]:t}function V(e=``){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}function H(){if(!w)return;let e=[...new Set(f.map(e=>String(e.chambre)).filter(e=>e&&e!==`-`))];e.sort((e,t)=>e.localeCompare(t,`fr`,{numeric:!0}));let t=w.value;w.innerHTML=`
        <option value="">
            Toutes les chambres
        </option>
    `,e.forEach(e=>{let t=document.createElement(`option`);t.value=e,t.textContent=e,w.appendChild(t)}),e.includes(t)&&(w.value=t)}function U(){if(!v)return;let e=C?C.value.toLowerCase().trim():``,t=w?w.value:``,n=T?T.value:``,r=f.filter(r=>{let i=[r.chambre,r.lit,r.carte,r.matricule,r.prenom,r.nom].filter(Boolean).join(` `).toLowerCase(),a=!e||i.includes(e),o=!t||String(r.chambre)===String(t),s=!0;return n===`paye`&&(s=r.montantDu===0),n===`du`&&(s=r.montantDu>0),a&&o&&s});v.innerHTML=``;let i=f.length,a=f.reduce((e,t)=>e+(Number(t.montantPaye)||0),0),o=f.reduce((e,t)=>e+(Number(t.montantDu)||0),0);if(y&&(y.textContent=i),b&&(b.textContent=r.length),x&&(x.textContent=O(a)),S&&(S.textContent=O(o)),r.length===0){v.innerHTML=`

            <tr class="empty-row">

                <td colspan="8">

                    Aucun étudiant trouvé.

                </td>

            </tr>

        `;return}r.forEach((e,t)=>{let n=document.createElement(`tr`);t>0&&r[t-1].chambre!==e.chambre&&n.classList.add(`room-separator`);let i=`${e.prenom} ${e.nom}`.trim(),a=e.montantDu>0;n.innerHTML=`

                <td>

                    <strong>

                        ${V(e.chambre)}

                    </strong>

                </td>


                <td>

                    ${V(e.lit)}

                </td>


                <td>

                    ${V(e.carte)}

                </td>


                <td>

                    <strong>

                        ${V(i||e.matricule)}

                    </strong>

                </td>


                <td class="montant-paye">

                    ${O(e.montantPaye)}

                </td>


                <td
                    class="
                        montant-du
                        ${a?`dette`:`a-jour`}
                    "
                >

                    ${O(e.montantDu)}

                </td>


                <td>

                    ${a?`
                                <button
                                    type="button"
                                    class="rappel-btn"
                                    data-matricule="${V(e.matricule)}"
                                >
                                    ENVOYER
                                </button>
                            `:`
                                <span
                                    class="rappel-ok"
                                >
                                    À jour
                                </span>
                            `}

                </td>


                <td>

                    <button
                        type="button"
                        class="details-btn"
                        data-matricule="${V(e.matricule)}"
                    >

                        Voir

                    </button>

                </td>

            `,v.appendChild(n)}),v.querySelectorAll(`.rappel-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.matricule,n=f.find(e=>String(e.matricule)===String(t));n&&W(n)})}),v.querySelectorAll(`.details-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.matricule;t&&(window.location.href=`./details/index.html?matricule=${encodeURIComponent(t)}`)})})}function W(e){let t=document.createElement(`div`);t.className=`rappel-menu-overlay`,t.innerHTML=`

        <div class="rappel-menu">

            <div class="rappel-menu-header">

                <h3>
                    Envoyer un rappel
                </h3>

                <button
                    type="button"
                    class="rappel-menu-close"
                >
                    ×
                </button>

            </div>


            <p>

                Choisissez le moyen de rappel
                pour

                <strong>
                    ${V(`${e.prenom} ${e.nom}`.trim()||e.matricule)}
                </strong>.

            </p>


            <div class="rappel-menu-actions">

                <button
                    type="button"
                    class="rappel-choice notification"
                    data-action="notification"
                >

                    <span>
                        <i class="fa-solid fa-bell"></i>
                    </span>

                    <div>

                        <strong>
                            Notification
                        </strong>

                        <small>
                            Envoyer dans Campus One
                        </small>

                    </div>

                </button>


                <button
                    type="button"
                    class="rappel-choice sms"
                    data-action="sms"
                >

                    <span>
                        <i class="fa-solid fa-message"></i>
                    </span>

                    <div>

                        <strong>
                            SMS
                        </strong>

                        <small>
                            Disponible prochainement
                        </small>

                    </div>

                </button>

            </div>

        </div>

    `,document.body.appendChild(t);let n=()=>{t.remove()};t.querySelector(`.rappel-menu-close`).addEventListener(`click`,n),t.addEventListener(`click`,e=>{e.target===t&&n()}),t.querySelector(`[data-action="notification"]`).addEventListener(`click`,async()=>{await G(e),n()}),t.querySelector(`[data-action="sms"]`).addEventListener(`click`,()=>{alert(`L'envoi de SMS sera disponible prochainement.`)})}async function G(e){console.log(`📩 Notification de rappel demandée :`,{matricule:e.matricule,nom:`${e.prenom} ${e.nom}`.trim(),montantDu:e.montantDu,moisEnRetard:e.moisEnRetard.map(e=>e.libelle)}),alert(`Notification de rappel préparée pour ${e.matricule}.`)}function K(){window.location.href=d}var q=document.getElementById(`voir-tableau-bord`);q&&q.addEventListener(`click`,K),C&&C.addEventListener(`input`,U),w&&w.addEventListener(`change`,U),T&&T.addEventListener(`change`,U),o(`agent`,async({profile:e,affectation:t,anneeAcademique:n,lectureSeule:r})=>{try{if(e.service!==`Service de l'Hébergement`){console.error(`❌ Accès refusé : service incorrect.`);return}await s(e);let i=t?.site||e.site||``,a=t?.pavillon||J(t?.affectation||e.affectation||``);if(E&&(E.textContent=n||`-`),D&&(D.textContent=a||`-`),!i||!a){v.innerHTML=`

                    <tr class="empty-row">

                        <td colspan="8">

                            Votre affectation
                            n'est pas correctement
                            définie.

                        </td>

                    </tr>

                `;return}console.log(`💰 Recouvrement - affectation :`,{site:i,pavillon:a,anneeAcademique:n});let[o]=await Promise.all([k(n),A(n),P(),F(i,a,n,r)]);g=o,M(),j(n),console.log(`💰 Étudiants affichés :`,f.length),console.log(`💰 Paiements utilisés :`,h.length)}catch(e){console.error(`❌ Erreur chargement recouvrement :`,e),v&&(v.innerHTML=`

                    <tr class="empty-row">

                        <td colspan="8">

                            Impossible de charger
                            les données de recouvrement.

                        </td>

                    </tr>

                `)}finally{document.body.classList.add(`loaded`)}});function J(e){let t=String(e||``).trim().match(/Pavillon\s+(.+)/i);return t?t[1].trim():``}