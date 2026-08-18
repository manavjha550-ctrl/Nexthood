const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Replace Hero Background
code = code.replace(
  'backgroundImage: `url("/images/campaign/nexthood_campaign_hero.jpg")`',
  'backgroundImage: `url("/images/ui/hero.jpg")`'
);

// Replace Mainline Drop Image (uses blessed_model instead of old hash)
code = code.replace(
  'src="/images/products/uploaded/688356759_1728478181656357_3392084299283319230_n.jpg"',
  'src="/images/products/blessed_model.jpg"'
);

// Replace Shop Categories array
const oldCategories = `            {[
              { name: "T-Shirts", src: "/images/products/uploaded/758350034_27664731326529967_2887842006468609395_n.jpg", link: "/collections/t-shirts" },
              { name: "Long Sleeve", src: "/images/products/uploaded/766319926_1617139786596013_6803408660997148690_n.jpg", link: "/collections/long-sleeve" },
              { name: "Hoodies & Sweats", src: "/images/products/uploaded/766344900_4469660169990307_6101832594510816811_n.jpg", link: "/shop" },
              { name: "Pants & Cargo", src: "/images/products/uploaded/763663366_4026838244115563_7448027683420837392_n.jpg", link: "/shop" },
              { name: "Footwear", src: "/images/products/uploaded/763692220_3582423251904649_4737351665887322127_n.jpg", link: "/shop" },
              { name: "Accessories", src: "/images/products/uploaded/755941615_1247732784062554_5340746620494007861_n.jpg", link: "/shop" }
            ].map((cat, i) => (`.trim();

const newCategories = `            {[
              { name: "Graphic Tees", src: "/images/ui/cat_graphic.jpg", link: "/shop" },
              { name: "Heavyweight Basics", src: "/images/ui/cat_heavy.jpg", link: "/shop" },
              { name: "Vintage Wash", src: "/images/ui/cat_vintage.jpg", link: "/shop" },
              { name: "Core Classics", src: "/images/ui/cat_core.jpg", link: "/shop" }
            ].map((cat, i) => (`.trim();

code = code.replace(oldCategories, newCategories);

// Replace grid columns for categories from 3 to 4 on md
code = code.replace(
  'className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"',
  'className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"'
);

// Replace Editorial Campaign Images
code = code.replace(
  'src="/images/products/uploaded/766193506_1938749603458712_8769771622467127035_n.jpg"',
  'src="/images/ui/campaign_main.jpg"'
);
code = code.replace(
  'src="/images/products/uploaded/761113080_1023506027328100_2093982855570264772_n.jpg"',
  'src="/images/ui/campaign_detail.jpg"'
);

fs.writeFileSync('src/pages/Home.tsx', code);
