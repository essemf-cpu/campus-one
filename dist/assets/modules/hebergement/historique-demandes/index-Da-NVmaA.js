import"../../../modulepreload-polyfill-Dezn_h7o.js";import{t as e}from"../../../authGuard-CW5SVeA8.js";import{t}from"../../../sidebar-CVr9XrKA.js";import{t as n}from"../../../bonsService-C_7dljiX.js";e(`agent`,async({profile:e})=>{if(e.service!==`Service de l'Hébergement`)return;await t(e),document.getElementById(`page-title`).textContent=e.affectation;let r=document.getElementById(`historique-body`),i=await n();r.innerHTML=``,i.length===0?r.innerHTML=`

            <tr class="empty-row">

                <td colspan="10">

                    Aucun historique disponible.

                </td>

            </tr>

        `:(i.sort((e,t)=>new Date(t.date)-new Date(e.date)),i.forEach(e=>{r.innerHTML+=`

                <tr>

                    <td>${e.date||``}</td>

                    <td>${e.nomEtudiant||``}</td>

                    <td>${e.chambre||``}</td>

                    <td>${e.niveau||``}</td>

                    <td>${e.type||``}</td>

                    <td>${e.description||``}</td>

                    <td>${e.statut||``}</td>

                    <td>${e.cause||``}</td>

                    <td>${e.evaluation?`⭐`.repeat(e.evaluation):``}</td>

                    <td>${e.commentaire||``}</td>

                </tr>

            `})),document.body.classList.add(`loaded`)});