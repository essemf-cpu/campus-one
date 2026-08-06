import{t as e}from"./sidebar-CN3sq0y-.js";import"./modulepreload-polyfill-Dezn_h7o.js";import{t}from"./authGuard-DMjBNp27.js";import{t as n}from"./bonsService-DNxlooij.js";t(`agent`,async({profile:t})=>{if(t.service!==`Service de l'Hébergement`)return;await e(t),document.getElementById(`page-title`).textContent=t.affectation;let r=document.getElementById(`historique-body`),i=await n();r.innerHTML=``,i.length===0?r.innerHTML=`

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