const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'prisma', 'dev.db');
const db = new DatabaseSync(dbPath);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%';").all();

console.log('--- TABLES IN DEV.DB ---');
for (const t of tables) {
  try {
    const count = db.prepare(`SELECT count(*) as c FROM "${t.name}"`).get();
    if (count.c > 0) {
      console.log(`${t.name}: ${count.c} records`);
    }
  } catch (e) {
    console.error(`Error reading ${t.name}:`, e.message);
  }
}
