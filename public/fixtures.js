export const games=[
 ['2026-10-31T15:00:00+01:00','FC Besa','TuS Leopoldshöhe II'],
 ['2026-11-04T19:00:00+01:00','TuS RW Grastrup-Retzen II','FC Besa'],
 ['2026-11-08T12:30:00+01:00','Yunus Lemgo','FC Besa'],
 ['2026-11-15T13:00:00+01:00','TuS Asemissen III','FC Besa'],
 ['2026-11-21T14:30:00+01:00','FC Besa','TSG Holzhausen/Sylbach II'],
 ['2026-11-29T13:00:00+01:00','TSV Kirchheide III','FC Besa'],
 ['2027-02-28T10:45:00+01:00','TuS Ahmsen III','FC Besa'],
 ['2027-03-07T13:00:00+01:00','FC Besa','KSC Ehrsen']
];
export function filterGames(list,filter='all') {return list.filter(([,home])=>filter==='all'||(filter==='home'?home==='FC Besa':home!=='FC Besa'));}
export function nextGame(list,now=new Date()) {return list.filter(([date])=>new Date(date)>=now).sort((a,b)=>new Date(a[0])-new Date(b[0]))[0]||null;}
