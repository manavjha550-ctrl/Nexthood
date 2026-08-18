const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace("import { seedDemoAccount } from './server/db.js';", "import { publicRouter } from './server/public.js';");
content = content.replace("  seedDemoAccount();", "");
content = content.replace("  app.use('/api/admin', adminRouter);", "  app.use('/api/admin', adminRouter);\n  app.use('/api/public', publicRouter);");
fs.writeFileSync('server.ts', content);
