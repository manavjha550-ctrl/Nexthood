const fs = require('fs');
const path = 'src/components/Layout.tsx';
let content = fs.readFileSync(path, 'utf8');

// Import useWishlist in Layout
if (!content.includes('useWishlist')) {
  content = content.replace(/import \{ SearchOverlay \} from '.\/SearchOverlay';/, "import { SearchOverlay } from './SearchOverlay';\nimport { useWishlist } from '../hooks/useWishlist';");
}

// In DesktopHeader, replace Heart button with one showing count
content = content.replace(/function DesktopHeader\(\{ scrolled, onSearchClick \}: \{ scrolled: boolean, onSearchClick: \(\) => void \}\) \{/, 'function DesktopHeader({ scrolled, onSearchClick, wishlistCount }: { scrolled: boolean, onSearchClick: () => void, wishlistCount: number }) {');
content = content.replace(/<button className="hover:text-brand-off-white\/60 transition-colors"><Heart size=\{16\} strokeWidth=\{1\.5\} \/><\/button>/, `<button className="hover:text-brand-off-white/60 transition-colors flex items-center gap-1"><Heart size={16} strokeWidth={1.5} /><span className="font-outfit text-[10px] tracking-widest">{wishlistCount > 0 ? \`(\${wishlistCount})\` : ''}</span></button>`);

// In Layout component, fetch wishlist and pass to DesktopHeader
content = content.replace(/const \[searchOpen, setSearchOpen\] = useState\(false\);/, 'const [searchOpen, setSearchOpen] = useState(false);\n  const { wishlist } = useWishlist();');
content = content.replace(/<DesktopHeader scrolled=\{scrolled\} onSearchClick=\{\(\) => setSearchOpen\(true\)\} \/>/, '<DesktopHeader scrolled={scrolled} onSearchClick={() => setSearchOpen(true)} wishlistCount={wishlist.length} />');

fs.writeFileSync(path, content);
console.log('Updated Layout.tsx with wishlist count');
