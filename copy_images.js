const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\fbaa5bb1-f8b2-42df-a6d4-d2bdc15da911';
const destDir = path.join(__dirname, 'public', 'assets', 'images');

const files = [
  ['armchair_green_1782417377254.png', 'armchair_green.png'],
  ['armchair_beige_1782417389414.png', 'armchair_beige.png'],
  ['coffee_table_1782417400687.png', 'coffee_table.png'],
  ['coffee_table_oak_1782417413060.png', 'coffee_table_oak.png'],
  ['coffee_table_black_1782417423529.png', 'coffee_table_black.png'],
  ['console_1782417439905.png', 'console.png'],
  ['console_green_1782417451723.png', 'console_green.png'],
  ['console_black_1782417464216.png', 'console_black.png']
];

files.forEach(([srcName, destName]) => {
  const srcPath = path.join(srcDir, srcName);
  const destPath = path.join(destDir, destName);
  try {
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${srcName} to ${destName}`);
    } else {
      console.warn(`Source file not found: ${srcPath}`);
    }
  } catch (err) {
    console.error(`Error copying ${srcName}:`, err.message);
  }
});
