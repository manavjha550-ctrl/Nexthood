const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace("import AdminSettings from './pages/admin/AdminSettings';", "import AdminSettings from './pages/admin/AdminSettings';\nimport AdminAnalytics from './pages/admin/AdminAnalytics';\nimport AdminOrderDetails from './pages/admin/AdminOrderDetails';\nimport AdminCustomerDetails from './pages/admin/AdminCustomerDetails';");

content = content.replace("<Route path=\"orders\" element={<AdminOrders />} />", "<Route path=\"orders\" element={<AdminOrders />} />\n          <Route path=\"orders/:id\" element={<AdminOrderDetails />} />");

content = content.replace("<Route path=\"customers\" element={<AdminCustomers />} />", "<Route path=\"customers\" element={<AdminCustomers />} />\n          <Route path=\"customers/:id\" element={<AdminCustomerDetails />} />");

content = content.replace("<Route path=\"coupons\" element={<AdminCoupons />} />", "<Route path=\"coupons\" element={<AdminCoupons />} />\n          <Route path=\"analytics\" element={<AdminAnalytics />} />");

fs.writeFileSync('src/App.tsx', content);
