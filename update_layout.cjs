const fs = require('fs');
const path = 'src/components/Layout.tsx';
let content = fs.readFileSync(path, 'utf8');

// replace <a> with <Link> for internal links
content = content.replace(/<a href="#" className="([^"]*)">([^<]*)<\/a>/g, '<Link to="/shop" className="$1">$2</Link>');
content = content.replace(/import \{ motion, AnimatePresence \} from 'motion\/react';/g, "import { motion, AnimatePresence } from 'motion/react';\nimport { Link } from 'react-router-dom';\nimport { SearchOverlay } from './SearchOverlay';");
if (!content.includes('react-router-dom')) {
  content = content.replace(/import React, \{ useState, useEffect \} from 'react';/, "import React, { useState, useEffect } from 'react';\nimport { Link } from 'react-router-dom';\nimport { SearchOverlay } from './SearchOverlay';");
}
content = content.replace(/<a href="#" className="font-outfit/g, '<Link to="/shop" className="font-outfit');
content = content.replace(/<\/a>/g, '</Link>');
content = content.replace(/<a /g, '<Link ');
content = content.replace(/href="#"/g, 'to="/"');

// Add Search props to DesktopHeader and MobileHeader
content = content.replace(/function DesktopHeader\(\{ scrolled \}: \{ scrolled: boolean \}\) \{/, 'function DesktopHeader({ scrolled, onSearchClick }: { scrolled: boolean, onSearchClick: () => void }) {');
content = content.replace(/<button className="hover:text-brand-off-white\/60 transition-colors"><Search size=\{16\} strokeWidth=\{1\.5\} \/><\/button>/, '<button onClick={onSearchClick} className="hover:text-brand-off-white/60 transition-colors"><Search size={16} strokeWidth={1.5} /></button>');

content = content.replace(/function MobileHeader\(\{ scrolled, toggleMenu, menuOpen \}: \{ scrolled: boolean, toggleMenu: \(\) => void, menuOpen: boolean \}\) \{/, 'function MobileHeader({ scrolled, toggleMenu, menuOpen, onSearchClick }: { scrolled: boolean, toggleMenu: () => void, menuOpen: boolean, onSearchClick: () => void }) {');
content = content.replace(/<button className="hover:text-brand-off-white\/60 transition-colors p-1"><Search size=\{18\} strokeWidth=\{1\.5\} \/><\/button>/, '<button onClick={onSearchClick} className="hover:text-brand-off-white/60 transition-colors p-1"><Search size={18} strokeWidth={1.5} /></button>');

// In Layout, add search state and pass to headers
content = content.replace(/const \[scrolled, setScrolled\] = useState\(false\);/, 'const [scrolled, setScrolled] = useState(false);\n  const [searchOpen, setSearchOpen] = useState(false);');
content = content.replace(/<DesktopHeader scrolled=\{scrolled\} \/>/, '<DesktopHeader scrolled={scrolled} onSearchClick={() => setSearchOpen(true)} />');
content = content.replace(/<MobileHeader scrolled=\{scrolled\} toggleMenu=\{\(\) => setMenuOpen\(!menuOpen\)\} menuOpen=\{menuOpen\} \/>/, '<MobileHeader scrolled={scrolled} toggleMenu={() => setMenuOpen(!menuOpen)} menuOpen={menuOpen} onSearchClick={() => setSearchOpen(true)} />');
content = content.replace(/<Footer \/>/, '<Footer />\n      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />');

// Fix navigation drawer links
content = content.replace(/const links = \["Shop", "New Drop", "Collections", "T-Shirts", "Long Sleeve", "About", "Contact"\];/, 'const links = [\n    {name:"Shop", path:"/shop"},\n    {name:"Collections", path:"/collections"},\n    {name:"T-Shirts", path:"/collections/t-shirts"},\n    {name:"Long Sleeve", path:"/collections/long-sleeve"}\n  ];');
content = content.replace(/links\.map\(\(link, i\) => \(/, 'links.map((link, i) => (');
content = content.replace(/key=\{link\}/, 'key={link.name}');
content = content.replace(/to="\/"/, 'to={link.path} onClick={onClose}');
content = content.replace(/>\s*\{link\}\s*<\/Link>/, '>{link.name}</Link>');

// Fix shop / collections links in DesktopHeader
content = content.replace(/<Link to="\/shop" className="font-outfit text-\[11px\] tracking-widest uppercase text-brand-off-white hover:text-brand-off-white\/60 transition-colors">\s*Shop\s*<\/Link>/g, '<Link to="/shop" className="font-outfit text-[11px] tracking-widest uppercase text-brand-off-white hover:text-brand-off-white/60 transition-colors">Shop</Link>');
content = content.replace(/<Link to="\/shop" className="font-outfit text-\[11px\] tracking-widest uppercase text-brand-off-white hover:text-brand-off-white\/60 transition-colors">\s*Collections\s*<\/Link>/g, '<Link to="/collections" className="font-outfit text-[11px] tracking-widest uppercase text-brand-off-white hover:text-brand-off-white/60 transition-colors">Collections</Link>');

fs.writeFileSync(path, content);
console.log('Updated Layout.tsx');
