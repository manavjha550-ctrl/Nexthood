const fs = require('fs');

let layoutCode = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// Add import
layoutCode = layoutCode.replace(
  "import { useCart } from '../context/CartContext';",
  "import { useCart } from '../context/CartContext';\nimport { useAuth } from '../context/AuthContext';"
);

// Update DesktopHeader signature
layoutCode = layoutCode.replace(
  "function DesktopHeader({ scrolled, onSearchClick, wishlistCount, cartCount, openDrawer }: { scrolled: boolean, onSearchClick: () => void, wishlistCount: number, cartCount: number, openDrawer: () => void }) {",
  "function DesktopHeader({ scrolled, onSearchClick, wishlistCount, cartCount, openDrawer }: { scrolled: boolean, onSearchClick: () => void, wishlistCount: number, cartCount: number, openDrawer: () => void }) {\n  const { user } = useAuth();"
);

// Update Account Link in DesktopHeader
layoutCode = layoutCode.replace(
  '<Link to="/shop" className="hover:text-brand-off-white/60 transition-colors text-[11px] tracking-widest">Account</Link>',
  '{user ? (\n            <Link to="/account" className="hover:text-brand-off-white/60 transition-colors text-[11px] tracking-widest">{user.fullName.split(" ")[0]}</Link>\n          ) : (\n            <Link to="/login" className="hover:text-brand-off-white/60 transition-colors text-[11px] tracking-widest">Account</Link>\n          )}'
);

// Update NavigationDrawer signature and account link
layoutCode = layoutCode.replace(
  "function NavigationDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {",
  "function NavigationDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {\n  const { user } = useAuth();"
);

layoutCode = layoutCode.replace(
  '<Link to="/shop" onClick={onClose} className="font-outfit text-xs tracking-widest uppercase">Account</Link>',
  '{user ? (\n                  <Link to="/account" onClick={onClose} className="font-outfit text-xs tracking-widest uppercase">{user.fullName.split(" ")[0]}</Link>\n                ) : (\n                  <Link to="/login" onClick={onClose} className="font-outfit text-xs tracking-widest uppercase">Account</Link>\n                )}'
);

fs.writeFileSync('src/components/Layout.tsx', layoutCode);
console.log('Layout updated');
