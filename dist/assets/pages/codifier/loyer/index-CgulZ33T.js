import"../../../modulepreload-polyfill-Dezn_h7o.js";var e={anneeAcademique:`2026-2027`,montantMensuel:3e3,mois:[{nom:`Novembre 2026`,statut:`paye`},{nom:`Décembre 2026`,statut:`paye`},{nom:`Janvier 2027`,statut:`a_payer`},{nom:`Février 2027`,statut:`a_payer`},{nom:`Mars 2027`,statut:`a_payer`},{nom:`Avril 2027`,statut:`a_payer`},{nom:`Mai 2027`,statut:`a_payer`},{nom:`Juin 2027`,statut:`a_payer`},{nom:`Juillet 2027`,statut:`a_payer`}]},t=document.getElementById(`annee-academique`),n=document.getElementById(`montant-total`),r=document.getElementById(`mois-a-payer`),i=document.getElementById(`paiements-list`);function a(e){return`${new Intl.NumberFormat(`fr-FR`).format(e)} FCFA`}function o(){return e.mois.find(e=>e.statut===`a_payer`)}function s(){let i=o();t.textContent=e.anneeAcademique,i?(n.textContent=a(e.montantMensuel),r.textContent=i.nom):(n.textContent=`0 FCFA`,r.textContent=`Aucun mois en attente`)}function c(){i.innerHTML=``,e.mois.forEach(e=>{let t=e.statut===`paye`,n=document.createElement(`div`);n.className=`paiement-row`,n.innerHTML=`

                <div class="paiement-mois">

                    <div
                        class="
                            paiement-status
                            ${t?`status-paye`:`status-attente`}
                        "
                    >

                        <i
                            class="
                                fa-solid
                                ${t?`fa-check`:`fa-clock`}
                            "
                        ></i>

                    </div>

                    <span>
                        ${e.nom}
                    </span>

                </div>


                <div
                    class="
                        paiement-etat
                        ${t?`etat-paye`:`etat-attente`}
                    "
                >

                    ${t?`Payé`:`À payer`}

                </div>

            `,i.appendChild(n)})}var l=document.getElementById(`paiement-modal`),u=document.getElementById(`plusieurs-modal`),d=document.getElementById(`recap-modal`);function f(e){e.classList.add(`show`),document.body.classList.add(`modal-open`)}function p(e){e.classList.remove(`show`),document.querySelector(`.modal.show`)||document.body.classList.remove(`modal-open`)}document.getElementById(`payer-btn`).addEventListener(`click`,()=>{let t=o();if(!t){alert(`Votre situation est à jour.`);return}document.getElementById(`modal-mois`).textContent=t.nom,document.getElementById(`montant-mois`).textContent=a(e.montantMensuel),f(l)}),document.getElementById(`payer-seul-btn`).addEventListener(`click`,()=>{let e=o();if(!e){alert(`Aucun mois à régulariser.`);return}m=[e],b(m),p(l),f(d)}),document.getElementById(`payer-plusieurs-btn`).addEventListener(`click`,()=>{p(l),h(),f(u)});var m=[];function h(){let t=document.getElementById(`mois-selection`);t.innerHTML=``,m=[];let n=e.mois.filter(e=>e.statut===`a_payer`);n.forEach((n,r)=>{let i=document.createElement(`button`);i.type=`button`,i.className=`mois-option`,i.dataset.index=r,i.innerHTML=`

                <div>

                    <strong>
                        ${n.nom}
                    </strong>

                    <span>
                        ${a(e.montantMensuel)}
                    </span>

                </div>

                <i
                    class="
                        fa-solid
                        fa-circle-check
                    "
                ></i>

            `,i.addEventListener(`click`,()=>{g(r)}),t.appendChild(i)}),n.length>0&&(m=[n[0]]),_(),y()}function g(t){let n=e.mois.filter(e=>e.statut===`a_payer`)[t];if(!n)return;let r=m.indexOf(n);if(r!==-1){if(r!==m.length-1)return;m.splice(r,1)}else{if(t!==m.length)return;m.push(n)}_(),y()}function _(){document.querySelectorAll(`.mois-option`).forEach((e,t)=>{let n=t<m.length;e.classList.toggle(`selected`,n),e.classList.remove(`disabled`)})}function v(t){return t.length*e.montantMensuel}function y(){let e=v(m);document.getElementById(`total-selection`).textContent=a(e)}document.getElementById(`continuer-paiement-btn`).addEventListener(`click`,()=>{if(m.length===0){alert(`Veuillez sélectionner au moins un mois.`);return}b(m),p(u),f(d)});function b(t){let n=document.getElementById(`recap-list`);n.innerHTML=``,t.forEach(t=>{let r=document.createElement(`div`);r.className=`recap-row`,r.innerHTML=`

                <span>
                    ${t.nom}
                </span>

                <strong>
                    ${a(e.montantMensuel)}
                </strong>

            `,n.appendChild(r)}),document.getElementById(`recap-total`).textContent=a(v(t))}document.getElementById(`confirmer-paiement-btn`).addEventListener(`click`,()=>{if(m.length===0){alert(`Aucun mois sélectionné.`);return}let e=v(m);confirm(`Confirmer le paiement fictif de ${a(e)} ?`)&&(m.forEach(e=>{e.statut=`paye`}),alert(`Paiement effectué avec succès.\n\nMontant : ${a(e)}`),s(),c(),m=[],p(d))}),document.getElementById(`reglement-btn`).addEventListener(`click`,()=>{alert(`L'article du règlement intérieur sera disponible prochainement.`)}),document.getElementById(`close-modal`).addEventListener(`click`,()=>{p(l)}),document.getElementById(`close-plusieurs-modal`).addEventListener(`click`,()=>{p(u)}),document.getElementById(`close-recap-modal`).addEventListener(`click`,()=>{p(d)}),document.querySelectorAll(`.modal`).forEach(e=>{e.addEventListener(`click`,t=>{t.target===e&&p(e)})}),document.getElementById(`back-btn`).addEventListener(`click`,()=>{window.history.back()}),s(),c();