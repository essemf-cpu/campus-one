import"../../../../modulepreload-polyfill-Dezn_h7o.js";import{b as e,f as t,h as n,l as r,v as i}from"../../../../authService-D_VO4Eli.js";import{t as a}from"../../../../authGuard-CQaJ0AEA.js";import{t as o}from"../../../../sidebar-C4KV5qly.js";var s=`etudiants`,c=`hebergements`,l=`paiementsLoyers`,u=`recouvrements`,d=``,f=``,p=null,m=null,h=[],g=null,_=document.getElementById(`annee-academique`),v=document.getElementById(`student-initials`),y=document.getElementById(`student-name`),b=document.getElementById(`student-card-number`),x=document.getElementById(`student-pavillon`),S=document.getElementById(`student-chambre`),C=document.getElementById(`student-lit`),w=document.getElementById(`total-paye`),T=document.getElementById(`total-du`),E=document.getElementById(`nombre-paiements`),D=document.getElementById(`situation-paiement`),O=document.getElementById(`paiements-body`),k=document.getElementById(`table-total`),A=document.getElementById(`situation-mensuelle`),j=document.getElementById(`retour-btn`),M=[{cle:`novembre`,libelle:`Novembre 2026`,ordre:1,codification:!0},{cle:`decembre`,libelle:`Décembre 2026`,ordre:2,codification:!0},{cle:`janvier`,libelle:`Janvier 2027`,ordre:3},{cle:`fevrier`,libelle:`Février 2027`,ordre:4},{cle:`mars`,libelle:`Mars 2027`,ordre:5},{cle:`avril`,libelle:`Avril 2027`,ordre:6},{cle:`mai`,libelle:`Mai 2027`,ordre:7},{cle:`juin`,libelle:`Juin 2027`,ordre:8},{cle:`juillet`,libelle:`Juillet 2027`,ordre:9}];function N(e){return`${new Intl.NumberFormat(`fr-FR`).format(Number(e)||0)} FCFA`}function P(e){if(!e)return`-`;try{let t=e;typeof e.toDate==`function`&&(t=e.toDate());let n=t instanceof Date?t:new Date(t);return Number.isNaN(n.getTime())?`-`:new Intl.DateTimeFormat(`fr-FR`,{day:`2-digit`,month:`2-digit`,year:`numeric`,hour:`2-digit`,minute:`2-digit`}).format(n)}catch{return`-`}}function F(e){if(!e)return 0;if(typeof e.toDate==`function`)return e.toDate().getTime();let t=new Date(e).getTime();return Number.isNaN(t)?0:t}function I(e){if(e==null)return`-`;let t=String(e).trim();if(!t)return`-`;let n=t.match(/(\d+)$/);return n?n[1]:t}function L(e=``){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}function R(e){return e.quittance||e.reference||e.id||`-`}function z(e){let t=String(e||``).toLowerCase().trim(),n=M.find(e=>e.libelle.toLowerCase().trim()===t);return n?n.ordre:999}async function B(){if(!d)throw Error(`Matricule absent de l'URL.`);let a=await t(n(e(r,s),i(`matricule`,`==`,d)));if(a.empty)throw Error(`Étudiant introuvable : ${d}`);let o=a.docs[0];p={id:o.id,...o.data()}}async function V(){if(!d)return;let a=await t(n(e(r,c),i(`matricule`,`==`,d)));if(a.empty){m=null;return}let o=a.docs.map(e=>({id:e.id,...e.data()}));m=o.find(e=>e.anneeAcademique===f&&(e.statutOccupation===`actif`||e.statutOccupation===void 0))||o.find(e=>e.anneeAcademique===f)||o[0]||null}async function H(){h=(await t(n(e(r,l),i(`matricule`,`==`,d)))).docs.map(e=>({id:e.id,...e.data()})).filter(e=>!f||e.anneeAcademique===f).filter(e=>e.type===`loyer`||!e.type).filter(e=>e.statut===`paye`),h.sort((e,t)=>{let n=z(e.mois),r=z(t.mois);return n===r?F(e.datePaiement)-F(t.datePaiement):n-r})}async function U(){let a=await t(n(e(r,u),i(`anneeAcademique`,`==`,f),i(`matricule`,`==`,d)));if(a.empty){g=W();return}let o=a.docs[0];g={id:o.id,...o.data()}}function W(){let e={};return M.forEach(t=>{e[t.cle]={libelle:t.libelle,statut:t.codification?`codification`:`a_payer`,datePaiement:null,montant:0}}),{matricule:d,anneeAcademique:f,montantMensuel:3e3,mois:e}}function G(){g||=W(),g.mois||={},M.forEach(e=>{g.mois[e.cle]||(g.mois[e.cle]={libelle:e.libelle,statut:e.codification?`codification`:`a_payer`,datePaiement:null,montant:0})}),M.filter(e=>e.codification).forEach(e=>{let t=g.mois[e.cle];t&&t.statut!==`paye`&&(t.statut=`codification`,t.datePaiement=null,t.montant=0)}),h.forEach(e=>{let t=Object.values(g.mois).find(t=>t&&t.libelle===e.mois);t&&(t.statut=`paye`,t.datePaiement=e.datePaiement||null,t.montant=Number(e.montant)||0)})}function K(){if(!p)return;let e=String(p.nom||``).trim(),t=String(p.prenom||``).trim(),n=`${t} ${e}`.trim(),r=((t.charAt(0)||``)+(e.charAt(0)||``)).toUpperCase();v&&(v.textContent=r||`—`),y&&(y.textContent=n||d),b&&(b.textContent=p.numeroEtudiant||p.numeroCarte||p.carte||p.matricule||d),_&&(_.textContent=f||`—`),x&&(x.textContent=m?.pavillon||`—`),S&&(S.textContent=m?.chambre||`—`),C&&(C.textContent=I(m?.lit||m?.numeroLit||m?.bed||``))}function q(){let e=Number(g?.montantMensuel)||3e3;return Object.values(g?.mois||{}).filter(e=>e&&e.statut===`a_payer`).reduce(t=>t+e,0)}function J(){let e=h.reduce((e,t)=>e+(Number(t.montant)||0),0),t=q();w&&(w.textContent=N(e)),T&&(T.textContent=N(t)),E&&(E.textContent=h.length),D&&(D.textContent=t===0?`À jour`:`Montant dû`,D.className=t===0?`status`:`status status-due`)}function Y(){let e=document.querySelector(`.payment-table`);if(!e)return;let t=e.querySelector(`thead tr`);if(!t||t.querySelector(`.reference-header`))return;let n=document.createElement(`th`);n.className=`reference-header`,n.textContent=`Quittance / Référence`;let r=t.children[t.children.length-1];t.insertBefore(n,r)}function X(){if(!O)return;if(Y(),O.innerHTML=``,h.length===0){O.innerHTML=`

            <tr class="empty-row">

                <td colspan="6">

                    Aucun paiement enregistré
                    pour cet étudiant.

                </td>

            </tr>

        `,k&&(k.textContent=`0 FCFA`);return}h.forEach((e,t)=>{let n=document.createElement(`tr`),r=R(e);n.innerHTML=`

                <td>

                    ${t+1}

                </td>


                <td>

                    <strong>

                        ${L(e.mois||`-`)}

                    </strong>

                </td>


                <td>

                    ${L(P(e.datePaiement))}

                </td>


                <td>

                    ${N(e.montant)}

                </td>


                <td>

                    <strong>

                        ${L(r)}

                    </strong>

                </td>


                <td>

                    <span class="payment-status">

                        Payé

                    </span>

                </td>

            `,O.appendChild(n)});let e=h.reduce((e,t)=>e+(Number(t.montant)||0),0);k&&(k.textContent=N(e))}function Z(){A&&(A.innerHTML=``,M.map(e=>{let t=Object.values(g?.mois||{}).find(t=>t&&t.libelle===e.libelle);return{...e,...t||{libelle:e.libelle,statut:e.codification?`codification`:`a_payer`,datePaiement:null,montant:0}}}).forEach(e=>{let t=e.statut===`paye`,n=e.statut===`codification`,r=document.createElement(`div`);r.className=`month-card`;let i=``;i=t?`

                    <span class="month-paid">

                        Payé · ${N(e.montant)}

                    </span>

                `:n?`

                    <span class="month-codification">

                        Codification

                    </span>

                `:`

                    <span class="month-unpaid">

                        À payer

                    </span>

                `;let a=``;a=t?P(e.datePaiement):n?`Début d'année académique`:`Aucun paiement enregistré`,r.innerHTML=`

                <div class="month-info">

                    <strong>

                        ${L(e.libelle)}

                    </strong>


                    <span>

                        ${L(a)}

                    </span>

                </div>


                <div>

                    ${i}

                </div>

            `,A.appendChild(r)}))}j&&j.addEventListener(`click`,()=>{window.location.href=`../index.html`});var Q=new URLSearchParams(window.location.search);d=String(Q.get(`matricule`)||``).trim(),a(`agent`,async({profile:e,affectation:t,anneeAcademique:n})=>{try{if(e.service!==`Service de l'Hébergement`){console.error(`❌ Accès refusé : service incorrect.`);return}if(await o(e),f=n||``,!d)throw Error(`Aucun matricule fourni.`);console.log(`💰 Détails recouvrement :`,{matricule:d,anneeAcademique:f}),await B(),await Promise.all([V(),H(),U()]),G(),K(),J(),X(),Z(),console.log(`💰 Paiements de l'étudiant :`,h)}catch(e){console.error(`❌ Erreur chargement détails :`,e),y&&(y.textContent=`Impossible de charger les données`),O&&(O.innerHTML=`

                    <tr class="empty-row">

                        <td colspan="6">

                            Impossible de charger
                            les informations de paiement.

                        </td>

                    </tr>

                `),A&&(A.innerHTML=`

                    <div class="monthly-empty">

                        Impossible de charger
                        la situation mensuelle.

                    </div>

                `)}finally{document.body.classList.add(`loaded`)}});