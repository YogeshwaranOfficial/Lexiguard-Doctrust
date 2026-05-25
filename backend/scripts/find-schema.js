#!/usr/bin/env node
/**
 * find-schema.js — Auto-detects prisma schema location.
 *
 * Works in TWO environments without any config change:
 *
 *  LOCAL  (prisma at project root):
 *    lexiguard/
 *      prisma/schema.prisma   ← found at ../prisma relative to backend/
 *      backend/
 *        scripts/find-schema.js
 *
 *  RENDER (prisma copied inside backend/):
 *    backend/
 *      prisma/schema.prisma   ← found at ./prisma relative to backend/
 *      scripts/find-schema.js
 *
 * Usage (from package.json scripts):
 *   node scripts/find-schema.js generate   → prisma generate
 *   node scripts/find-schema.js migrate    → prisma migrate deploy
 */

const { execSync } = require('child_process');
const { existsSync } = require('fs');
const { resolve } = require('path');

const action = process.argv[2];
if (!['generate', 'migrate', 'dev'].includes(action)) {
  console.error('Usage: node scripts/find-schema.js <generate|migrate|dev>');
  process.exit(1);
}

// process.cwd() is always backend/ because scripts run from package.json
const insideBackend = resolve(process.cwd(), 'prisma/schema.prisma');  // Render
const atRoot        = resolve(process.cwd(), '../prisma/schema.prisma'); // Local

let schemaPath;
if (existsSync(insideBackend)) {
  schemaPath = './prisma/schema.prisma';
  console.log('[schema] Found: backend/prisma/schema.prisma (Render mode)');
} else if (existsSync(atRoot)) {
  schemaPath = '../prisma/schema.prisma';
  console.log('[schema] Found: ../prisma/schema.prisma (local root mode)');
} else {
  console.error('[schema] ERROR: schema.prisma not found in either location:');
  console.error('  ' + insideBackend);
  console.error('  ' + atRoot);
  process.exit(1);
}

const commands = {
  generate: `npx prisma generate --schema="${schemaPath}"`,
  migrate:  `npx prisma migrate deploy --schema="${schemaPath}"`,
  dev:      `npx prisma migrate dev --schema="${schemaPath}"`,
};

const cmd = commands[action];
console.log('[schema] Running: ' + cmd);
console.log('');

try {
  execSync(cmd, { stdio: 'inherit' });
} catch {
  process.exit(1);
}
