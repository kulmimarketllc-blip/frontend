const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replaceTextInFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  let updatedContent = content.replace(/ESUUQ/g, 'Kulmi Market');
  updatedContent = updatedContent.replace(/esuuq/g, 'kulmi');
  
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
};

const walkSync = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkSync(filePath);
    } else if (filePath.endsWith('.js') || filePath.endsWith('.jsx') || filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      replaceTextInFile(filePath);
    }
  }
};

walkSync(directoryPath);
console.log('Done!');
