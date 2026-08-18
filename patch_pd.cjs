const fs = require('fs');
let pd = fs.readFileSync('src/pages/ProductDetails.tsx', 'utf8');
pd = pd.replace("  const { slug } = useParams<{ slug: string }>();\n    const recentIds = useRecentlyViewed(product?.id);",
"  const { slug } = useParams<{ slug: string }>();\n  const product = catalog.find(p => p.slug === slug);\n  const recentIds = useRecentlyViewed(product?.id);");
if(pd.indexOf("const product = catalog.find") === -1) {
  pd = pd.replace("  const { slug } = useParams<{ slug: string }>();", "  const { slug } = useParams<{ slug: string }>();\n  const product = catalog.find(p => p.slug === slug);");
}
fs.writeFileSync('src/pages/ProductDetails.tsx', pd);
