require("dotenv").config();

const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Add your Neon connection string to .env.");
}

const pool = new Pool({
  connectionString: databaseUrl,
});

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS testTable (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    )
  `);
}

app.get("/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS now");
    res.json({ ok: true, now: result.rows[0].now });
  } catch (err) {
    console.error("Error checking database health", err.stack);
    res.status(500).json({ ok: false });
  }
});


app.post("/insert", async (req, res) => {
  const { name, id } = req.body;

  if (name == null || id == null) {
    return res.status(400).send("name and id are required");
  }

  try {
    await pool.query("INSERT INTO testTable (name, id) VALUES ($1, $2)", [name, id]);
    res.send("Data inserted successfully");
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).send("Error inserting data");
  }
});

app.get("/getData", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM testTable ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).send("Error fetching data");
  }
});

async function startServer() {
  try {
    await pool.query("SELECT 1");
    await ensureSchema();

    app.listen(3000, () => {
      console.log("Connected to Neon database");
      console.log("Server is running on port 3000");
    });
  } catch (err) {
    console.error("Connection error", err.stack);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});

startServer();
