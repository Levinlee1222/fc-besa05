import test from 'node:test';
import assert from 'node:assert/strict';
import {filterGames, nextGame} from '../public/fixtures.js';
const games=[['2026-10-31T15:00:00+01:00','FC Besa','Gast'],['2026-11-04T19:00:00+01:00','Heim','FC Besa']];
test('Heim- und Auswärtsspiele getrennt auswählen',()=>{
 assert.deepEqual(filterGames(games,'home'),[games[0]]);
 assert.deepEqual(filterGames(games,'away'),[games[1]]);
 assert.deepEqual(filterGames(games,'all'),games);
});
test('Vergangene Spiele nicht als nächstes Spiel anzeigen',()=>assert.deepEqual(nextGame(games,new Date('2026-10-31T17:00:00Z')),games[1]));
test('Kein nächstes Spiel nach Ende der hinterlegten Termine',()=>assert.equal(nextGame(games,new Date('2027-01-01')),null));
test('Nächstes Spiel aus unsortierten Daten chronologisch bestimmen',()=>assert.deepEqual(nextGame([...games].reverse(),new Date('2026-01-01')),games[0]));
