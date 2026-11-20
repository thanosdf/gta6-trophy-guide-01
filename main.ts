// Leonida Trophy Guide: the program that hands the entry in.
//
// It runs on Node 22 with the standard library only, no network, no build
// step. It copies this repository's app/ (the offline guide) and
// screenshots/ (its renders) into /output, then writes /output/dossier.json
// with the vendored make.fun library, which is the summary the judge reads:
// the screenshots, the first load's files and bytes, and the source.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The dossier must be byte for byte what the scorer's own copy of the
// library writes, so vendor/makefun-frontend.ts is left exactly as it is
// and the caps below match the scorer's own limits.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repo = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The guide is nothing without its front page, so refuse to hand in a
// broken copy instead of writing an empty dossier.
if (!existsSync(join(repo, 'app', 'index.html'))) {
  throw new Error('app/index.html is missing: the guide has no front page');
}

// The gate takes 3 or 4 screenshots, each a real render of the guide.
// Count them here so a bad run fails loudly instead of at the gate.
const shots = readdirSync(join(repo, 'screenshots'))
  .filter((name) => !name.startsWith('.') && statSync(join(repo, 'screenshots', name)).isFile());
if (shots.length < 3 || shots.length > 4) {
  throw new Error(`screenshots/ holds ${shots.length} images, but the gate takes 3 or 4`);
}

mkdirSync(out, { recursive: true });
cpSync(join(repo, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(join(repo, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes
// the bytes; the others refuse an entry the scorer would refuse (more than
// 4 screenshots or one over 256 KiB; more than 993 files and directories
// in app/ or 48 MiB of app files: app/ counts beside /output's own
// 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
