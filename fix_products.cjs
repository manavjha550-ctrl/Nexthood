const fs = require('fs');
let code = fs.readFileSync('src/data/products.ts', 'utf8');

// Replace all products completely for safety
code = `export interface ProductImage { src: string; alt: string; }
export interface Product {
  id: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  collection: string;
  images: ProductImage[];
  primaryImage: string;
  sizes?: string[];
  colors?: string[];
  badges?: string[];
  featured?: boolean;
  newArrival?: boolean;
  bestseller?: boolean;
  stock?: number;
  sku?: string;
}

export const catalog: Product[] = [
  {
    id: "p1",
    slug: "blessed",
    name: "Blessed",
    price: 499,
    category: "T-Shirts",
    collection: "Graphic Series",
    images: [
      { src: "/images/products/blessed_model.jpg", alt: "Blessed model view" },
      { src: "/images/products/blessed_flat.jpg", alt: "Blessed flat view" }
    ],
    primaryImage: "/images/products/blessed_model.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
    badges: ["BESTSELLER"],
    sku: "NH-BLESSED",
    description: "Our signature Blessed graphic tee. Heavyweight 240GSM cotton cut in our custom oversized block. A core piece in the mainline uniform.",
    stock: 50,
    compareAtPrice: 599
  },
  {
    id: "p2",
    slug: "thorn",
    name: "Thorn",
    price: 499,
    category: "T-Shirts",
    collection: "Graphic Series",
    images: [
      { src: "/images/products/thorn_model.jpg", alt: "Thorn model view" },
      { src: "/images/products/thorn_flat.jpg", alt: "Thorn flat view" }
    ],
    primaryImage: "/images/products/thorn_model.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
    sku: "NH-THORN",
    description: "The Thorn graphic tee introduces brutalist typography to our core silhouette. Engineered for endurance and daily wear.",
    stock: 0
  },
  {
    id: "p3",
    slug: "starboy",
    name: "Starboy",
    price: 499,
    category: "T-Shirts",
    collection: "Graphic Series",
    images: [
      { src: "/images/products/starboy_front.jpg", alt: "Starboy front view" },
      { src: "/images/products/starboy_back.jpg", alt: "Starboy back view" }
    ],
    primaryImage: "/images/products/starboy_front.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
    sku: "NH-STARBOY",
    description: "Starboy explores thematic iconography printed on our signature vintage-washed cotton canvas. Dropped shoulders, wide body.",
    stock: 3
  },
  {
    id: "p4",
    slug: "spider-man",
    name: "Spider-Man",
    price: 349,
    category: "T-Shirts",
    collection: "Graphic Series",
    images: [
      { src: "/images/products/spiderman_black.jpg", alt: "Spider-Man black view" },
      { src: "/images/products/spiderman_cream.jpg", alt: "Spider-Man cream view" }
    ],
    primaryImage: "/images/products/spiderman_black.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Cream"],
    badges: ["NEW"],
    sku: "NH-SPIDERMAN",
    description: "A collaborative exploration. Premium cotton construction featuring custom distressed printing techniques.",
    stock: 120
  },
  {
    id: "p5",
    slug: "trust-loyalty-eye",
    name: "Trust & Loyalty Eye",
    price: 450,
    category: "T-Shirts",
    collection: "Graphic Series",
    images: [
      { src: "/images/products/trust_eye.jpg", alt: "Trust & Loyalty Eye view" }
    ],
    primaryImage: "/images/products/trust_eye.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
    sku: "NH-TRUST-EYE",
    description: "Trust & Loyalty Eye graphic tee. High-density printing across the chest. Engineered for layering.",
    stock: 25
  },
  {
    id: "p6",
    slug: "phantom",
    name: "Phantom",
    price: 349,
    category: "T-Shirts",
    collection: "Graphic Series",
    images: [
      { src: "/images/products/phantom_front.jpg", alt: "Phantom front view" }
    ],
    primaryImage: "/images/products/phantom_front.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
    sku: "NH-PHANTOM",
    description: "Phantom minimal graphic tee. Subtle tonal branding on our heaviest cotton blank. A staple for the modern uniform.",
    stock: 80
  }
];
`;
fs.writeFileSync('src/data/products.ts', code);
