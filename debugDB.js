require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'usuarios'");
        console.log("SCHEMA:", res.rows);

        // Intenta insertar temporalmente para ver el error exacto
        try {
            await pool.query('INSERT INTO usuarios (nombre, email, telefono, edad) VALUES ($1, $2, $3, $4)', ['Test', 'test@test.com', '123', 25]);
            console.log("Insert exitoso localmente.");
        } catch (inerr) {
            console.error("Error al insertar:", inerr.message);
        }
    } catch (err) {
        console.error("Error general DB:", err.message);
    } finally {
        pool.end();
    }
}
check();
