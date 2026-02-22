const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');
const app = express();
app.use(cors());
const PORT = 3000;

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function getConnection() {
  return await oracledb.getConnection({
    user: "carlosm",
    password: "cmartinez",
    connectString: "199.1.1.36:1521/unicentro"
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