const fs = require('fs');
let content = fs.readFileSync('server/admin.ts', 'utf8');

// The problematic snippet is:
const toRemove = "    res.json({ id: c.id, fullName: c.full_name, email: c.email, phone: c.phone, createdAt: c.created_at });\n  } catch(e) { res.status(500).json({error: 'Internal server error'}); }\n});";
content = content.replace(toRemove, "");
fs.writeFileSync('server/admin.ts', content);
