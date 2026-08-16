import"../../../modulepreload-polyfill-Dezn_h7o.js";import{f as e,g as t,h as n,l as r,y as i}from"../../../authService-DTiP6P1g.js";import{t as a}from"../../../authGuard-BnlEFo-L.js";import{t as o}from"../../../sidebar-KGnYkfIK.js";import{t as s}from"../../../referentielService-Vwd3uLQj.js";async function c(){return(await e(t(i(r,`bons`),n(`date`,`desc`)))).docs.map(e=>({id:e.id,...e.data()}))}a(`agent`,async({profile:e})=>{if(e.service!==`Service de l'Hébergement`)return;await o(e),document.getElementById(`page-title`).textContent=e.affectation;let t=document.getElementById(`typeFiltre`),n=await s();t.innerHTML=`<option value="">Tous les types</option>`,n.forEach(e=>{t.innerHTML+=`

            <option value="${e.id}">

                ${e.nom}

            </option>

        `});let r=document.getElementById(`anneeFiltre`),i=new Date().getFullYear();for(let e=i;e>=2023;e--)r.innerHTML+=`

            <option value="${e}">

                ${e}

            </option>

        `;let a=document.getElementById(`anciens-body`),l=await c();a.innerHTML=``;let u=new Date().toISOString().split(`T`)[0],d=l.filter(e=>e.date?e.date.split(`T`)[0]!==u:!1);d.length===0?a.innerHTML=`

        <tr class="empty-row">

            <td colspan="7">

                Aucun ancien bon trouvé.

            </td>

        </tr>

    `:d.forEach(e=>{a.innerHTML+=`

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