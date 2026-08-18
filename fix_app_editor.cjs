const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace("import AdminProducts from './pages/admin/AdminProducts';", "import AdminProducts from './pages/admin/AdminProducts';\nimport AdminProductEditor from './pages/admin/AdminProductEditor';");

content = content.replace("<Route path=\"products\" element={<AdminProducts />} />", "<Route path=\"products\" element={<AdminProducts />} />\n          <Route path=\"products/new\" element={<AdminProductEditor />} />\n          <Route path=\"products/:id\" element={<AdminProductEditor />} />");

fs.writeFileSync('src/App.tsx', content);
