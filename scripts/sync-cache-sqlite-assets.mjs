import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourceDir = path.join(
	projectRoot,
	'node_modules',
	'@nostr-dev-kit',
	'cache-sqlite-wasm',
	'dist'
);
const targetDir = path.join(projectRoot, 'static');
const files = ['worker.js', 'wa-sqlite-async.wasm'];
const schemaVersionLookup = `async function getCurrentVersion(db) {
  try {
    const result = await db.exec("SELECT version FROM schema_version LIMIT 1");
    if (result && result.length > 0 && result[0].values && result[0].values.length > 0) {
      return result[0].values[0][0];
    }
  } catch {}
  return 0;
}`;
const patchedSchemaVersionLookup = `async function getCurrentVersion(db) {
  const schemaVersionTable = await db.exec("SELECT 1 FROM sqlite_master WHERE type='table' AND name='schema_version' LIMIT 1");
  if (!schemaVersionTable[0]?.values?.length) {
    return 0;
  }
  try {
    const result = await db.exec("SELECT version FROM schema_version LIMIT 1");
    if (result && result.length > 0 && result[0].values && result[0].values.length > 0) {
      return result[0].values[0][0];
    }
  } catch {}
  return 0;
}`;

function hasSameContents(sourcePath, targetPath) {
	if (!existsSync(targetPath)) return false;

	return readFileSync(sourcePath).equals(readFileSync(targetPath));
}

function patchWorkerAsset(workerPath) {
	const current = readFileSync(workerPath, 'utf8');
	if (current.includes(patchedSchemaVersionLookup)) {
		console.log('[sync-cache-sqlite-assets] worker patch already applied');
		return;
	}

	if (!current.includes(schemaVersionLookup)) {
		throw new Error('Could not find schema_version migration snippet in worker.js');
	}

	writeFileSync(workerPath, current.replace(schemaVersionLookup, patchedSchemaVersionLookup));
	console.log('[sync-cache-sqlite-assets] patched worker.js schema_version lookup');
}

for (const file of files) {
	const sourcePath = path.join(sourceDir, file);
	const targetPath = path.join(targetDir, file);

	if (!existsSync(sourcePath)) {
		throw new Error(`Missing cache-sqlite-wasm asset: ${sourcePath}`);
	}

	if (hasSameContents(sourcePath, targetPath)) {
		console.log(`[sync-cache-sqlite-assets] up to date: ${file}`);
		continue;
	}

	mkdirSync(path.dirname(targetPath), { recursive: true });
	copyFileSync(sourcePath, targetPath);
	console.log(`[sync-cache-sqlite-assets] copied: ${file}`);
}

patchWorkerAsset(path.join(targetDir, 'worker.js'));
