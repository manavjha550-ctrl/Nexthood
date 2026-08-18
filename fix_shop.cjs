const fs = require('fs');
let code = fs.readFileSync('src/pages/Shop.tsx', 'utf8');
code = code.replace("const isLongSleeve = slug === 'long-sleeve';", "");
code = code.replace("isTShirts ? ['T-Shirts'] : isLongSleeve ? ['Long Sleeve'] : []", "isTShirts ? ['T-Shirts'] : []");
code = code.replace("{['T-Shirts', 'Long Sleeve'].map(cat => (", "{['T-Shirts'].map(cat => (");
fs.writeFileSync('src/pages/Shop.tsx', code);
