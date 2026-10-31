import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {resolve} from 'node:path';

const root = resolve('public');
const sources = ['index.html', '404.html', 'style.css', 'motion.css', 'app.js', 'site.webmanifest'];

function localReferences(text) {
  const refs = new Set();
  for (const [, value] of text.matchAll(/(?:src|href|srcset|imagesrcset|content)="([^"]+)"/g))
    for (const part of value.split(',')) refs.add(part.trim().split(/\s+/)[0]);
  for (const [, value] of text.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)) refs.add(value);
  for (const [, value] of text.matchAll(/"src":\s*"([^"]+)"/g)) refs.add(value);
  return [...refs].filter(ref => ref.startsWith('/') && !ref.startsWith('//'));
}

for (const source of sources) {
  test(`Alle lokalen Verweise in ${source} existieren`, () => {
    const missing = localReferences(readFileSync(resolve(root, source), 'utf8'))
      .map(ref => ref.split(/[?#]/)[0])
      .filter(ref => ref !== '/' && !existsSync(resolve(root, '.' + ref)));
    assert.deepEqual(missing, []);
  });
}
