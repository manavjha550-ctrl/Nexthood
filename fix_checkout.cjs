const fs = require('fs');
let content = fs.readFileSync('src/pages/Checkout.tsx', 'utf8');

// Use regex to see where 'user' is already declared. 
// It's probably `const { user } = useAuth();` earlier in the file.
content = content.replace(/const { user } = useAuth\(\);\n\s*if \(isPaymentStep\) {/, "if (isPaymentStep) {");

fs.writeFileSync('src/pages/Checkout.tsx', content);
