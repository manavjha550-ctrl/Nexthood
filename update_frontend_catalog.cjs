const fs = require('fs');

function updateHome() {
  let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');
  content = content.replace("import { catalog } from '../data/products';", "");
  
  const repl = `
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  
  useEffect(() => {
    fetch('/api/public/products')
      .then(res => res.json())
      .then(data => {
        setFeaturedProducts(data.slice(0, 4));
      });
  }, []);
`;
  content = content.replace("const featuredProducts = catalog.slice(0, 4);", repl);
  
  if (!content.includes('useState')) {
    content = content.replace("import { Link } from 'react-router-dom';", "import { Link } from 'react-router-dom';\nimport { useState, useEffect } from 'react';");
  }
  fs.writeFileSync('src/pages/Home.tsx', content);
}

function updateShop() {
  let content = fs.readFileSync('src/pages/Shop.tsx', 'utf8');
  content = content.replace("import { catalog, Product } from '../data/products';", "import { Product } from '../data/products';");
  
  const repl = `
  const [catalog, setCatalog] = useState<Product[]>([]);
  
  useEffect(() => {
    fetch('/api/public/products')
      .then(res => res.json())
      .then(data => {
        setCatalog(data);
      });
  }, []);
`;
  content = content.replace("const Shop = () => {", "const Shop = () => {\n" + repl);
  
  content = content.replace("let result = [...catalog];", "let result = catalog ? [...catalog] : [];");
  fs.writeFileSync('src/pages/Shop.tsx', content);
}

function updateCollections() {
  let content = fs.readFileSync('src/pages/Collections.tsx', 'utf8');
  content = content.replace("import { catalog } from '../data/products';", "");
  
  const repl = `
  const [graphicSeriesProducts, setGraphicSeriesProducts] = useState<any[]>([]);
  
  useEffect(() => {
    fetch('/api/public/products')
      .then(res => res.json())
      .then(data => {
        setGraphicSeriesProducts(data.filter((p: any) => p.collection === 'Graphic Series').slice(0, 4));
      });
  }, []);
`;
  content = content.replace("const graphicSeriesProducts = catalog.filter(p => p.collection === 'Graphic Series').slice(0, 4);", repl);
  
  if (!content.includes('useState')) {
    content = content.replace("import { Link } from 'react-router-dom';", "import { Link } from 'react-router-dom';\nimport { useState, useEffect } from 'react';");
  }
  fs.writeFileSync('src/pages/Collections.tsx', content);
}

function updateProductDetails() {
  let content = fs.readFileSync('src/pages/ProductDetails.tsx', 'utf8');
  content = content.replace("import { catalog, Product } from '../data/products';", "import { Product } from '../data/products';");
  
  const repl = `
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  
  useEffect(() => {
    if (!slug) return;
    fetch(\`/api/public/products/\${slug}\`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setProduct(data);
        }
      });
      
    fetch('/api/public/products')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
           const recs = data.filter((p: any) => p.slug !== slug).sort(() => 0.5 - Math.random()).slice(0, 4);
           setRecommendations(recs);
        }
      });
  }, [slug]);
`;
  content = content.replace("const product = catalog.find(p => p.slug === slug);", "");
  content = content.replace(/const recommendations = catalog[\s\S]*?\.slice\(0, 4\);/, "");
  content = content.replace("const ProductDetails = () => {", "const ProductDetails = () => {\n" + repl);
  
  fs.writeFileSync('src/pages/ProductDetails.tsx', content);
}

updateHome();
updateShop();
updateCollections();
updateProductDetails();
