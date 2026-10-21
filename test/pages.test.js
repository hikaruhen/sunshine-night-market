import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

test('page asset graph stays inside the GitHub Pages project subpath', async () => {
  const base = new URL('https://hikaruhen.github.io/sunshine-night-market/');
  const queue = [new URL('index.html', base)], visited = new Set();
  while (queue.length) {
    const url = queue.shift();
    if (visited.has(url.href)) continue;
    assert.equal(url.origin, base.origin, `External runtime asset: ${url}`);
    assert.ok(url.pathname.startsWith(base.pathname), `Asset escaped project subpath: ${url}`);
    visited.add(url.href);
    const file = resolve(decodeURIComponent(url.pathname.slice(base.pathname.length)));
    const content = await readFile(file, 'utf8');
    const extension = extname(file);
    const pattern = extension === '.html' ? /(?:src|href)="([^"#]+)"/g
      : extension === '.js' ? /(?:\bfrom\s*|\bimport\s*)['"]([^'"]+)['"]/g
      : extension === '.css' ? /url\(['"]?([^'"\)]+)['"]?\)/g : null;
    if (pattern) for (const match of content.matchAll(pattern)) {
      if (!match[1].startsWith('data:')) queue.push(new URL(match[1], url));
    }
  }
  assert.ok(visited.has(new URL('src/config.js', base).href));
  assert.ok(visited.has(new URL('src/litmus.js', base).href));
  assert.ok(visited.has(new URL('src/style.css', base).href));
});
