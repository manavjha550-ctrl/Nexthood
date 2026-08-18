const fs = require('fs');
let appStr = fs.readFileSync('src/App.tsx', 'utf8');

appStr = appStr.replace(
  "import { Checkout } from './pages/Checkout';",
  "import { Checkout } from './pages/Checkout';\nimport { Legal } from './pages/Legal';"
);

appStr = appStr.replace(
  '<Route path="/checkout" element={<Checkout />} />',
  '<Route path="/checkout" element={<Checkout />} />\n          <Route path="/legal" element={<Legal />} />'
);

fs.writeFileSync('src/App.tsx', appStr);
console.log('App.tsx updated with Legal route');
