const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /order\.updatedAt = new Date\(\)\.toISOString\(\);\s*saveDb\(\);\s*res\.json\(\{ success: true, order \}\);/g,
  `order.updatedAt = new Date().toISOString();\n  syncOrderToFirestore(order);\n  saveDb();\n  res.json({ success: true, order });`
);

fs.writeFileSync('server.ts', code);
