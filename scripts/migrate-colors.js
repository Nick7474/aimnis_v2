const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const dir = path.join(__dirname, 'src');

walkDir(dir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // 1. Replace Hex Codes
    content = content.replace(/#00d4ff/gi, '#735fe9');
    content = content.replace(/#0891b2/gi, '#5a3ee1');

    // 2. Replace 'cyan' with 'brand'
    // Matches cyan-xx, or just the word cyan in strings
    content = content.replace(/\bcyan\b/gi, 'brand');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Replaced colors in: ${filePath}`);
    }
  }
});
