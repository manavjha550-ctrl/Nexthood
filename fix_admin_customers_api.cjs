const fs = require('fs');
let content = fs.readFileSync('server/admin.ts', 'utf8');

// Replace the simple getAllCustomers and getUserById
const newCustomersApi = `
adminRouter.get('/customers', async (req, res) => {
  try {
    const customers = await query(\`
      SELECT u.id, u.full_name as "fullName", u.email, u.phone, u.created_at as "createdAt",
             COUNT(o.id) as orders, SUM(o.total) as "lifetimeSpend"
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id AND o.payment_status = 'PAID'
      WHERE u.role = 'CUSTOMER'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    \`);
    res.json(customers.rows.map(c => ({...c, orders: Number(c.orders), lifetimeSpend: Number(c.lifetimeSpend || 0)})));
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.get('/customers/:id', async (req, res) => {
  try {
    const custRes = await query(\`
      SELECT u.id, u.full_name as "fullName", u.email, u.phone, u.created_at as "createdAt",
             COUNT(o.id) as orders, SUM(o.total) as "lifetimeSpend"
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id AND o.payment_status = 'PAID'
      WHERE u.id = $1 AND u.role = 'CUSTOMER'
      GROUP BY u.id
    \`, [req.params.id]);
    
    if (custRes.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    
    const customer = custRes.rows[0];
    const orderHistory = await query('SELECT id, created_at, order_status, payment_status, total FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [req.params.id]);
    
    res.json({
      ...customer,
      orders: Number(customer.orders),
      lifetimeSpend: Number(customer.lifetimeSpend || 0),
      orderHistory: orderHistory.rows.map(o => ({...o, total: Number(o.total)}))
    });
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});
`;

content = content.replace(/adminRouter\.get\('\/customers', async \(req, res\) => \{[\s\S]*?\}\);\s*adminRouter\.get\('\/customers\/:id', async \(req, res\) => \{[\s\S]*?\}\);/, newCustomersApi.trim());

fs.writeFileSync('server/admin.ts', content);
