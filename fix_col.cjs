const fs = require('fs');
let code = fs.readFileSync('src/pages/Collections.tsx', 'utf8');
code = code.replace(
  'src="/images/products/uploaded/763398285_1001018992982573_4720073835676992398_n.jpg"',
  'src="/images/products/starboy_front.jpg"'
);
fs.writeFileSync('src/pages/Collections.tsx', code);
