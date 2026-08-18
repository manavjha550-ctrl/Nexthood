const fs = require('fs');

function addNoIndex(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('name="robots" content="noindex"')) {
    content = content.replace(
      "document.title =",
      "let metaRobots = document.querySelector('meta[name=\"robots\"]');\n    if (!metaRobots) {\n      metaRobots = document.createElement('meta');\n      metaRobots.setAttribute('name', 'robots');\n      document.head.appendChild(metaRobots);\n    }\n    metaRobots.setAttribute('content', 'noindex');\n\n    document.title ="
    );
    fs.writeFileSync(filePath, content);
    console.log('Added noindex to ' + filePath);
  }
}

addNoIndex('src/pages/Bag.tsx');
addNoIndex('src/pages/Checkout.tsx');
