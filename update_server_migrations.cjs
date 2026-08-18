const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

if (!content.includes('runMigrations')) {
  content = content.replace("import { publicRouter } from './server/public.js';", "import { publicRouter } from './server/public.js';\nimport { runMigrations } from './server/db/migrate.js';");
  content = content.replace("async function startServer() {", "async function startServer() {\n  try { await runMigrations(); } catch(e) { console.error('Migration failed:', e); }");
  fs.writeFileSync('server.ts', content);
}
