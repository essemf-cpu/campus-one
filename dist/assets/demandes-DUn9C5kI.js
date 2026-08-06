import{t as e}from"./sidebar-DrnrPw2u.js";import"./modulepreload-polyfill-Dezn_h7o.js";import{t}from"./authGuard-DIbRRCGk.js";import{t as n}from"./referentielService-DdZT0jix.js";t(`agent`,async({profile:t})=>{if(console.log(`1 - requireRole OK`),t.service!==`Service de l'Hébergement`)return;console.log(`2 - service OK`),await e(t),console.log(`3 - sidebar chargée`),document.getElementById(`page-title`).textContent=t.affectation;let r=document.getElementById(`type`);if(r){console.log(`4 - select trouvé`);let e=await n();console.log(`5 - types récupérés`,e),r.innerHTML=``,e.forEach(e=>{r.innerHTML+=`
                <option value="${e.id}">
                    ${e.nom}
                </option>
            `})}console.log(`6 - page prête`),document.body.classList.add(`loaded`)});