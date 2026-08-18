const fs = require('fs');

// Fix Layout.tsx
let layout = fs.readFileSync('src/components/Layout.tsx', 'utf8');
layout = layout.replace(/<Link to=\{link\.path\} onClick=\{onClose\} className="hover:opacity-80 transition-opacity">/, '<Link to="/" className="hover:opacity-80 transition-opacity">');
layout = layout.replace(/<Link \n                  key=\{link.name\}\n                  to="\/"\n/, '<Link \n                  key={link.name}\n                  to={link.path} onClick={onClose}\n');
layout = layout.replace(/<Link to="\/" className="absolute left-1\/2 -translate-x-1\/2">/, '<Link to="/" className="absolute left-1/2 -translate-x-1/2">');
// Re-check NavigationDrawer links
layout = layout.replace(/<Link\s+key=\{link\.name\}\s+to="\/"\s+className="font-syne text-2xl font-semibold uppercase hover:text-brand-off-white\/60 transition-colors"\s*>\s*\{link\.name\}\s*<\/Link>/g, 
  '<Link key={link.name} to={link.path} onClick={onClose} className="font-syne text-2xl font-semibold uppercase hover:text-brand-off-white/60 transition-colors">{link.name}</Link>');
fs.writeFileSync('src/components/Layout.tsx', layout);

// Fix ProductCard.tsx
let card = fs.readFileSync('src/components/ProductCard.tsx', 'utf8');
card = card.replace(/export function ProductCard\(\{ product \}: \{ product: Product \}\) \{/, 'export function ProductCard({ product }: { product: Product, key?: React.Key }) {');
fs.writeFileSync('src/components/ProductCard.tsx', card);

console.log('Fixed');
