const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');
code = code.replace(
  'src="/images/products/uploaded/763398285_1001018992982573_4720073835676992398_n.jpg"',
  'src="/images/ui/hero.jpg"'
);
fs.writeFileSync('src/pages/Home.tsx', code);
