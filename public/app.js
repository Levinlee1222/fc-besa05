const games=[
 ['2026-10-31T15:00:00+01:00','FC Besa','TuS Leopoldshöhe II'],
 ['2026-11-04T19:00:00+01:00','TuS RW Grastrup-Retzen II','FC Besa'],
 ['2026-11-08T12:30:00+01:00','Yunus Lemgo','FC Besa'],
 ['2026-11-15T13:00:00+01:00','TuS Asemissen III','FC Besa'],
 ['2026-11-21T14:30:00+01:00','FC Besa','TSG Holzhausen/Sylbach II'],
 ['2026-11-29T13:00:00+01:00','TSV Kirchheide III','FC Besa'],
 ['2027-02-28T10:45:00+01:00','TuS Ahmsen III','FC Besa'],
 ['2027-03-07T13:00:00+01:00','FC Besa','KSC Ehrsen']
];
const dateFormat=new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'short',year:'numeric',timeZone:'Europe/Berlin'});
const timeFormat=new Intl.DateTimeFormat('de-DE',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Berlin'});
const weekday=new Intl.DateTimeFormat('de-DE',{weekday:'short',timeZone:'Europe/Berlin'});
function render(filter='all'){
 const filtered=games.filter(([,home])=>filter==='all'||(filter==='home'?home==='FC Besa':home!=='FC Besa'));
 document.querySelector('#fixtures').innerHTML=filtered.map(([date,home,away])=>{
 const d=new Date(date); const atHome=home==='FC Besa';
 return `<article class="fixture"><time datetime="${date}"><strong>${dateFormat.format(d)}</strong><span>${weekday.format(d)} · ${timeFormat.format(d)} Uhr</span></time><div class="teams"><span class="${atHome?'besa':''}">${home}</span><small>vs.</small><span class="${!atHome?'besa':''}">${away}</span></div><span class="venue ${atHome?'is-home':''}">${atHome?'Heimspiel':'Auswärts'}</span></article>`;
 }).join('')||'<p>Für diese Auswahl sind keine Spiele hinterlegt.</p>';
}
render();
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});render(button.dataset.filter);
}));
const menu=document.querySelector('.menu');const nav=document.querySelector('nav');
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}));
document.addEventListener('keydown',event=>{if(event.key==='Escape'){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.focus();}});
document.querySelector('#year').textContent=new Date().getFullYear();
