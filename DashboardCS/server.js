require('dotenv').config();   // ← Cargar variables .env

const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');
const path = require('path');

const app = express();
// Logger simple para depuración de peticiones (muestra método y URL)
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});

// Servir archivos estáticos desde /public
app.use(express.static("public"))

// Servir la carpeta `img` en la ruta /img para que las imágenes fuera de `public`
// sean accesibles desde el navegador sin mover archivos.
app.use('/img', express.static(path.join(__dirname, 'img')))

app.use(cors());

// Puerto desde .env
const PORT = process.env.PORT || 3000;

// Ruta absoluta al archivo JSON
const cabeceraPath = path.join(__dirname, 'config', 'cabecera.json');

// Endpoint REST para servir el JSON
app.get('/cabecera', (req, res) => {
  res.sendFile(cabeceraPath);
});

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// Conexión usando variables .env
async function getConnection() {
  return await oracledb.getConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    connectString: process.env.DB_CONNECT
  });
}

app.get('/clientes', async (req, res) => {
  let conn;

  try {
    conn = await getConnection();

    const result = await conn.execute(`
      select * from adcc.pos_gift_card
    `);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });

  } finally {
    if (conn) {
      try { await conn.close(); } catch (err) { console.error(err); }
    }
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});