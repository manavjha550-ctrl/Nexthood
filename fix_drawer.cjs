const fs = require('fs');
let layout = fs.readFileSync('src/components/Layout.tsx', 'utf8');

layout = layout.replace(
  /<motion\.a[\s\S]*?key=\{link\.name\}[\s\S]*?to="\/"[\s\S]*?initial=\{\{ opacity: 0, y: 10 \}\}[\s\S]*?animate=\{\{ opacity: 1, y: 0 \}\}[\s\S]*?transition=\{\{ delay: i \* 0\.05 \+ 0\.1 \}\}[\s\S]*?className="font-syne text-2xl font-semibold uppercase hover:text-brand-off-white\/60 transition-colors"[\s\S]*?>[\s\S]*?\{link\.name\}[\s\S]*?<\/motion\.a>/g,
  `<motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 + 0.1 }}
                >
                  <Link to={link.path} onClick={onClose} className="font-syne text-2xl font-semibold uppercase hover:text-brand-off-white/60 transition-colors">
                    {link.name}
                  </Link>
                </motion.div>`
);

fs.writeFileSync('src/components/Layout.tsx', layout);
console.log('Fixed Drawer');
