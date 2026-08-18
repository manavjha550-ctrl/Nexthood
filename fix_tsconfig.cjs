const fs = require('fs');
let tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
tsconfig.compilerOptions.typeRoots = ["./node_modules/@types", "./server"];
fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));
