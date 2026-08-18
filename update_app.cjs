const fs = require('fs');

let appStr = fs.readFileSync('src/App.tsx', 'utf8');

// Imports
appStr = appStr.replace(
  "import { OrderDetails } from './pages/OrderDetails';",
  "import { OrderDetails } from './pages/OrderDetails';\n" +
  "import AdminLayout from './pages/admin/AdminLayout';\n" +
  "import AdminDashboard from './pages/admin/AdminDashboard';\n" +
  "import AdminProducts from './pages/admin/AdminProducts';\n" +
  "import AdminOrders from './pages/admin/AdminOrders';\n" +
  "import AdminCustomers from './pages/admin/AdminCustomers';\n" +
  "import AdminCategories from './pages/admin/AdminCategories';\n" +
  "import AdminCollections from './pages/admin/AdminCollections';\n" +
  "import AdminCoupons from './pages/admin/AdminCoupons';\n" +
  "import AdminActivity from './pages/admin/AdminActivity';\n" +
  "import AdminSettings from './pages/admin/AdminSettings';"
);

// Routes
const oldRoutes = `<Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collections/:slug" element={<Shop />} />
          <Route path="/products/:slug" element={<ProductDetails />} />
          <Route path="/bag" element={<Bag />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/account/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/account/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/account/orders/:orderId" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
        </Routes>
      </Layout>`;

const newRoutes = `<Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="collections" element={<AdminCollections />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="activity" element={<AdminActivity />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/collections/:slug" element={<Shop />} />
              <Route path="/products/:slug" element={<ProductDetails />} />
              <Route path="/bag" element={<Bag />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
              <Route path="/account/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/account/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/account/orders/:orderId" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
            </Routes>
          </Layout>
        } />
      </Routes>`;

appStr = appStr.replace(oldRoutes, newRoutes);

fs.writeFileSync('src/App.tsx', appStr);
console.log('App.tsx updated');
