const fs = require('fs');

function strip(path) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/const __filename = fileURLToPath\(import\.meta\.url\);\nconst __dirname = path\.dirname\(__filename\);\n/g, "");
  content = content.replace(/import \{ fileURLToPath \} from 'url';\n/g, "");
  fs.writeFileSync(path, content);
}

strip('server.ts');
strip('server/db/migrate.ts');
