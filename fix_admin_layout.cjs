const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminLayout.tsx', 'utf8');

content = content.replace("const { user, loading, logout } = useAuth();", "const { user, isLoading: loading, logout } = useAuth();");
// Change 'framer-motion' to 'motion/react'
content = content.replace("import { motion } from 'framer-motion';", "import { motion } from 'motion/react';");

fs.writeFileSync('src/pages/admin/AdminLayout.tsx', content);
