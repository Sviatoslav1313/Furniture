import path from 'path';

let sqlInstance = null;
let sqliteDbInstance = null;

const isPostgres = !!(process.env.DATABASE_URL || process.env.POSTGRES_URL);

async function getDb() {
  if (isPostgres) {
    if (!sqlInstance) {
      const { default: postgres } = await import('postgres');
      const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
      sqlInstance = postgres(connectionString, {
        ssl: { rejectUnauthorized: false }
      });

      // Lazy table initialization for Postgres
      await sqlInstance`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          verification_token VARCHAR(255),
          is_verified INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `.catch(err => console.error('Failed to init Postgres table:', err));
    }
    return {
      async query(queryText, params = []) {
        const rows = await sqlInstance.unsafe(queryText, params);
        return { rows };
      }
    };
  } else {
    if (!sqliteDbInstance) {
      const { default: Database } = await import('better-sqlite3');
      const dbPath = path.resolve(process.cwd(), 'database.sqlite');
      sqliteDbInstance = new Database(dbPath);

      sqliteDbInstance.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          verification_token TEXT,
          is_verified INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }
    return {
      async query(queryText, params = []) {
        const sqliteSql = queryText.replace(/\$\d+/g, '?');
        const stmt = sqliteDbInstance.prepare(sqliteSql);
        
        if (queryText.trim().toUpperCase().startsWith('SELECT')) {
          const rows = stmt.all(params);
          return { rows };
        } else {
          const result = stmt.run(params);
          return { rows: [], result };
        }
      }
    };
  }
}

const db = {
  async query(queryText, params = []) {
    const client = await getDb();
    return client.query(queryText, params);
  }
};

export default db;
export { isPostgres };
