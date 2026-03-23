require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        const query = `
      CREATE TABLE IF NOT EXISTS usuarios (
          id SERIAL PRIMARY KEY,
          nombre TEXT NOT NULL,
          email TEXT NOT NULL,
          telefono TEXT,
          edad INTEGER
      );
    `;
        console.log("Creando tabla 'usuarios' en Render...");
        await pool.query(query);
        console.log("¡Tabla asegurada en la base de datos de Render! Ya puedes usar Postman.");
    } catch (error) {
        console.error("Error inicializando db:", error);
    } finally {
        pool.end();
    }
}

run();
