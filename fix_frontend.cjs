const fs = require('fs');

// Fix ProductDetails.tsx
let pd = fs.readFileSync('src/pages/ProductDetails.tsx', 'utf8');
pd = pd.replace("import { Product } from '../data/products';", "import { Product, catalog } from '../data/products';");
pd = pd.replace(
  "  const { slug } = useParams<{ slug: string }>();\n    const recentIds = useRecentlyViewed(product?.id);",
  "  const { slug } = useParams<{ slug: string }>();\n  const product = catalog.find(p => p.slug === slug);\n  const recentIds = useRecentlyViewed(product?.id);"
);
fs.writeFileSync('src/pages/ProductDetails.tsx', pd);

// Fix Shop.tsx
let shop = fs.readFileSync('src/pages/Shop.tsx', 'utf8');
shop = shop.replace("import { Product } from '../data/products';", "import { Product, catalog } from '../data/products';");
fs.writeFileSync('src/pages/Shop.tsx', shop);
