require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Middlewares
app.use(cors()); // Para permitir llamadas desde distintos orígenes
app.use(express.json()); // Permite capturar el body en formato JSON

// Configuración de base de datos
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Esencial para conexiones SSL externas de Render Postgres
    }
});

app.get('/', (req, res) => {
    res.json({ message: "API de Usuarios operativa. Lista para testear en Postman." });
});

// GET /usuarios → listar todos
app.get('/usuarios', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usuarios ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor al listar' });
    }
});

// GET /usuarios/:id → obtener por ID
app.get('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// POST /usuarios → crear
app.post('/usuarios', async (req, res) => {
    try {
        const { nombre, email, telefono, edad } = req.body;
        const result = await pool.query(
            'INSERT INTO usuarios (nombre, email, telefono, edad) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, email, telefono, edad ? parseInt(edad) : null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear el usuario' });
    }
});

// PUT /usuarios/:id → actualizar todos los campos
app.put('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, telefono, edad } = req.body;
        const result = await pool.query(
            'UPDATE usuarios SET nombre = $1, email = $2, telefono = $3, edad = $4 WHERE id = $5 RETURNING *',
            [nombre, email, telefono, edad ? parseInt(edad) : null, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar' });
    }
});

// DELETE /usuarios/:id → eliminar
app.delete('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

        res.json({ message: 'Usuario eliminado correctamente', usuario: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de API iniciado y escuchando en el puerto ${PORT}`);
});
