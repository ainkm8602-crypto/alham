const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /dbState\.users\.push\(user\);\s*saveDb\(\);/g,
  `dbState.users.push(user);\n    syncUserToFirestore(user).catch(() => {});\n    saveDb();`
);

code = code.replace(
  /saveDb\(\);\s*res\.json\(order\);\s*\n\}\);/g,
  `syncOrderToFirestore(order).catch(() => {});\n  saveDb();\n  res.json(order);\n});`
);

// We should also look for place where order is created
code = code.replace(
  /orders\.unshift\(newOrder\);\s*saveDb\(\);/g,
  `orders.unshift(newOrder);\n  syncOrderToFirestore(newOrder).catch(() => {});\n  saveDb();`
);


fs.writeFileSync('server.ts', code);
