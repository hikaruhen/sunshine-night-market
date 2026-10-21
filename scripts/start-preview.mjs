import { spawn } from 'node:child_process';
import { mkdir, open, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createConnection } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';
import { APP_TITLE } from '../src/config.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const url = 'http://127.0.0.1:5173/';
const logs = resolve(root, 'test-artifacts', 'preview');

async function listening() {
  return new Promise((resolveProbe, reject) => {
    const socket = createConnection({ host: '127.0.0.1', port: 5173 });
    socket.once('connect', () => { socket.destroy(); resolveProbe(true); });
    socket.once('error', error => {
      socket.destroy();
      if (error.code === 'ECONNREFUSED') resolveProbe(false);
      else reject(error);
    });
    socket.setTimeout(1500, () => { socket.destroy(); reject(new Error('Port 5173 did not respond.')); });
  });
}

async function verify() {
  const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
  const html = await response.text();
  if (response.status !== 200 || !html.includes(`<title>${APP_TITLE}`) || !html.includes('./src/app.js')) {
    throw new Error('Port 5173 is in use but is not the game preview. Nothing was stopped or replaced.');
  }
}

async function main() {
  if (await listening()) {
    await verify();
    console.log(`Already running (HTTP 200): ${url}`);
    return;
  }

  await mkdir(logs, { recursive: true });
  const stdout = await open(resolve(logs, 'stdout.log'), 'a');
  const stderr = await open(resolve(logs, 'stderr.log'), 'a');
  let child;
  let spawnError;
  try {
    child = spawn(process.execPath, [resolve(root, 'scripts', 'serve.mjs')], {
      cwd: root, detached: true, windowsHide: true,
      stdio: ['ignore', stdout.fd, stderr.fd],
    });
    child.on('error', error => { spawnError = error; });
    child.unref();
  } finally {
    await stdout.close();
    await stderr.close();
  }

  for (let attempt = 0; attempt < 40; attempt++) {
    if (spawnError) throw spawnError;
    if (await listening()) {
      await verify();
      console.log(`Ready (HTTP 200): ${url} [started PID ${child.pid}]`);
      return;
    }
    await delay(250);
  }
  const detail = await readFile(resolve(logs, 'stderr.log'), 'utf8');
  throw new Error(`Preview did not become ready. Check ${logs}\n${detail.slice(-2000)}`);
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
