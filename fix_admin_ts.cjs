const fs = require('fs');
let content = fs.readFileSync('server/admin.ts', 'utf8');
content = content.replace("    res.json({ id: c.id, fullName: c.full_name, email: c.email, phone: c.phone, createdAt: c.created_at });  } catch(e) { res.status(500).json({error: 'Internal server error'}); }});", "");
fs.writeFileSync('server/admin.ts', content);
