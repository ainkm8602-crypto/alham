const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
const lines = code.split('\n');
let insideGet = false;
let openBraces = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('app.get(')) {
    insideGet = true;
    openBraces = 0;
  }
  
  if (insideGet) {
    if (lines[i].includes('{')) openBraces += (lines[i].match(/{/g) || []).length;
    if (lines[i].includes('}')) openBraces -= (lines[i].match(/}/g) || []).length;
    
    if (lines[i].trim() === 'saveDb();') {
      console.log('Removed saveDb from line', i + 1);
      lines[i] = ''; // remove
    }
    
    if (openBraces === 0) {
      insideGet = false;
    }
  }
}

fs.writeFileSync('server.ts', lines.join('\n'));
