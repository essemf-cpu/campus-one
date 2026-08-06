import{t as e}from"./sidebar-DrnrPw2u.js";import"./modulepreload-polyfill-Dezn_h7o.js";import{t}from"./authGuard-DIbRRCGk.js";import{t as n}from"./referentielService-DdZT0jix.js";import{t as r}from"./bonsService-BRAjs5uZ.js";t(`agent`,async({profile:t})=>{if(t.service!==`Service de l'Hébergement`)return;await e(t),document.getElementById(`page-title`).textContent=t.affectation;let i=document.getElementById(`typeFiltre`),a=await n();i.innerHTML=`<option value="">Tous les types</option>`,a.forEach(e=>{i.innerHTML+=`

            <option value="${e.id}">

                ${e.nom}

            </option>

        `});let o=document.getElementById(`anneeFiltre`),s=new Date().getFullYear();for(let e=s;e>=2023;e--)o.innerHTML+=`

            <option value="${e}">

                ${e}

            </option>

        `;let c=document.getElementById(`anciens-body`),l=await r();c.innerHTML=``;let u=new Date().toISOString().split(`T`)[0],d=l.filter(e=>e.date?e.date.split(`T`)[0]!==u:!1);d.length===0?c.innerHTML=`

        <tr class="empty-row">

            <td colspan="7">

                Aucun ancien bon trouvé.

            </td>

        </tr>

    `:d.forEach(e=>{c.innerHTML+=`

            <tr>

                <td>${e.id}</td>

                <td>${e.date}</td>

                <td>${e.type||``}</td>

                <td>${e.description||``}</td>

                <td>${e.pavillon||``}</td>

                <td>${e.statut||``}</td>

                <td>${e.cause||``}</td>

            </tr>

        `}),document.body.classList.add(`loaded`)});