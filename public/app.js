import {initMotion, animateFixtures} from './motion.js';
import {games,filterGames,nextGame} from './fixtures.js';
const official='https://www.fussball.de/mannschaft/fc-besa-fc-besa-05-westfalen/-/saison/2627/team-id/02NUS2VENK000000VS5489B2VU92J92M';
const dateFormat=new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'short',year:'numeric',timeZone:'Europe/Berlin'});
const timeFormat=new Intl.DateTimeFormat('de-DE',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Berlin'});
const weekday=new Intl.DateTimeFormat('de-DE',{weekday:'short',timeZone:'Europe/Berlin'});
const arrow='<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
function render(filter='all'){
 document.querySelector('#fixtures').innerHTML=filterGames(games,filter).map(([date,home,away])=>{
 const d=new Date(date),atHome=home==='FC Besa';
 return `<article class="fixture"><time datetime="${date}"><strong>${dateFormat.format(d)}</strong><span>${weekday.format(d)} · ${timeFormat.format(d)} Uhr</span></time><div class="teams"><span class="${atHome?'besa':''}">${home}</span><small>vs.</small><span class="${!atHome?'besa':''}">${away}</span></div><span class="venue ${atHome?'is-home':''}">${atHome?'Heim':'Auswärts'}</span><a class="fixture-link" href="${official}" target="_blank" rel="noopener" aria-label="${home} gegen ${away} auf FUSSBALL.DE prüfen">${arrow}</a></article>`;
 }).join('')||'<p>Für diese Auswahl sind keine Termine hinterlegt.</p>';
}
function crest(team){return team==='FC Besa'?'<img src="/assets/logo-128.webp" width="64" height="64" alt="Wappen FC Besa 05">':'<span class="opponent-mark" aria-hidden="true">'+team.split(' ').filter(w=>w.length>2).slice(0,2).map(w=>w[0]).join('')+'</span>';}
function renderNextGame(){
 const game=nextGame(games),container=document.querySelector('#next-game');
 if(!game){container.innerHTML='<h2>Das nächste Spiel folgt.</h2><p>Aktuelle Termine findest du auf FUSSBALL.DE.</p><a class="text-link" href="'+official+'" target="_blank" rel="noopener">Zum Spielplan '+arrow+'</a>';return;}
 const [date,home,away]=game,d=new Date(date);
 container.innerHTML=`<div class="match-heading"><h2>Nächster Anpfiff</h2><span>Kreisliga C2 Lemgo</span></div><div class="match-teams"><div class="match-team">${crest(home)}<strong>${home}</strong></div><div class="match-time"><time datetime="${date}">${dateFormat.format(d)}<b>${timeFormat.format(d)}<small> Uhr</small></b></time><span>${home==='FC Besa'?'Heimspiel':'Auswärtsspiel'}</span></div><div class="match-team">${crest(away)}<strong>${away}</strong></div></div><a class="match-source" href="${official}" target="_blank" rel="noopener">Ansetzung prüfen ${arrow}</a>`;
}
render();renderNextGame();
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});render(button.dataset.filter);animateFixtures();}));
const menu=document.querySelector('.menu'),nav=document.querySelector('#navigation');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open');document.querySelector('main').inert=false;document.querySelector('footer').inert=false;}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);document.body.classList.toggle('menu-open',open);document.querySelector('main').inert=open;document.querySelector('footer').inert=open;});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
matchMedia('(min-width: 761px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){nav.querySelectorAll('a').forEach(a=>{const active=a.getAttribute('href')==='#'+entry.target.id;a.classList.toggle('current',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}}),{rootMargin:'-20% 0px -55% 0px'});
document.querySelectorAll('main section[id]').forEach(section=>observer.observe(section));
document.querySelector('#year').textContent=new Date().getFullYear();

initMotion();


document.addEventListener('keydown',event=>{
 if(event.key!=='Tab'||menu.getAttribute('aria-expanded')!=='true')return;
 const items=[menu,...nav.querySelectorAll('a')],first=items[0],last=items.at(-1);
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});
