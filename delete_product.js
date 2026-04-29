const fs = require('fs');
const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
db.products = db.products.filter(p => !p.name.includes('T Scale'));
fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
console.log('Product deleted');
