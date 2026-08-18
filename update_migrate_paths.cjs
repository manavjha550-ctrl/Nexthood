const fs = require('fs');
let content = fs.readFileSync('server/db/migrate.ts', 'utf8');

// Replace __dirname with process.cwd() / server / db
content = content.replace("const schemaPath = path.join(__dirname, 'schema.sql');", "const schemaPath = path.join(process.cwd(), 'server', 'db', 'schema.sql');");
fs.writeFileSync('server/db/migrate.ts', content);
