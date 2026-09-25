const fs = require('fs');
const path = require('path');

const candidates = [
  path.join(__dirname, 'dist', 'main.js'),
  path.join(__dirname, 'dist', 'apps', 'backend', 'src', 'main.js'),
  path.join(__dirname, 'dist', 'src', 'main.js'),
];

const entry = candidates.find((p) => fs.existsSync(p));

if (!entry) {
  console.error('❌ Could not find compiled main.js. Searched in:', candidates);
  process.exit(1);
}

console.log(`🚀 Starting Inzovate ERP Backend from: ${entry}`);
require(entry);
